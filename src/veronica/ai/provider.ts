import type { AIProvider, AIRequest, AIResponse, AIProviderId } from '../types';

/**
 * AI provider registry and router.
 * Supports provider switching, fallback, and future load balancing.
 */
class AIProviderRegistry {
	private providers = new Map<string, AIProvider>();
	private activeProviderId: AIProviderId | null = null;
	private fallbackOrder: AIProviderId[] = [];

	register(provider: AIProvider): void {
		this.providers.set(provider.id, provider);
	}

	setActive(id: AIProviderId): void {
		if (!this.providers.has(id)) {
			throw new Error(`AI provider '${id}' not registered.`);
		}
		this.activeProviderId = id;
	}

	setFallbackOrder(order: AIProviderId[]): void {
		this.fallbackOrder = order.filter((id) => this.providers.has(id));
	}

	getActive(): AIProvider | null {
		if (!this.activeProviderId) return null;
		return this.providers.get(this.activeProviderId) ?? null;
	}

	/**
	 * Route a request through the provider chain.
	 * Tries active provider first, then falls back through the order.
	 */
	async route(request: AIRequest): Promise<AIResponse> {
		const chain = this.getProviderChain();
		let lastError: Error | null = null;

		for (const provider of chain) {
			try {
				return await provider.complete(request);
			} catch (error) {
				lastError =
					error instanceof Error ? error : new Error(String(error));
				// Continue to next provider
			}
		}

		throw lastError ?? new Error('No AI providers available.');
	}

	private getProviderChain(): AIProvider[] {
		const chain: AIProvider[] = [];

		if (this.activeProviderId) {
			const active = this.providers.get(this.activeProviderId);
			if (active) chain.push(active);
		}

		for (const id of this.fallbackOrder) {
			if (id !== this.activeProviderId) {
				const provider = this.providers.get(id);
				if (provider) chain.push(provider);
			}
		}

		return chain;
	}
}

/** Singleton AI provider registry. */
export const aiRegistry = new AIProviderRegistry();
