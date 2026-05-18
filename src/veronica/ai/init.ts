import { aiRegistry } from './provider';
import { OpenRouterProvider } from './providers/openrouter';
import { NvidiaNimProvider } from './providers/nvidia-nim';

/**
 * Initialize AI providers from environment variables.
 * Called once at app startup.
 */
export function initializeAI(): void {
	const openrouterKey = import.meta.env.VITE_OPENROUTER_API_KEY as
		| string
		| undefined;
	const nvidiaKey = import.meta.env.VITE_NVIDIA_NIM_API_KEY as
		| string
		| undefined;

	if (openrouterKey) {
		aiRegistry.register(
			new OpenRouterProvider({ apiKey: openrouterKey }),
		);
	}

	if (nvidiaKey) {
		aiRegistry.register(new NvidiaNimProvider({ apiKey: nvidiaKey }));
	}

	// Set routing: NVIDIA NIM primary, OpenRouter fallback
	if (nvidiaKey && openrouterKey) {
		aiRegistry.setActive('nvidia-nim');
		aiRegistry.setFallbackOrder(['openrouter']);
	} else if (nvidiaKey) {
		aiRegistry.setActive('nvidia-nim');
	} else if (openrouterKey) {
		aiRegistry.setActive('openrouter');
	}
	// If neither key is set, aiRegistry.getActive() returns null
	// and the executor will show a graceful message
}
