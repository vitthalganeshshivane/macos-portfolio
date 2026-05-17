import type { AIProvider, AIRequest, AIResponse } from '../../types';

const NVIDIA_NIM_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemma-3n-e4b-it';
const REQUEST_TIMEOUT_MS = 30_000;

interface NvidiaNimConfig {
	apiKey: string;
	model?: string;
	baseUrl?: string;
}

/**
 * NVIDIA NIM AI provider.
 * Uses NVIDIA-hosted inference endpoints.
 * OpenAI-compatible API structure.
 */
export class NvidiaNimProvider implements AIProvider {
	readonly name = 'NVIDIA NIM';
	readonly id = 'nvidia-nim';

	private apiKey: string;
	private model: string;
	private baseUrl: string;

	constructor(config: NvidiaNimConfig) {
		this.apiKey = config.apiKey;
		this.model = config.model ?? DEFAULT_MODEL;
		this.baseUrl = config.baseUrl ?? NVIDIA_NIM_API_URL;
	}

	async complete(request: AIRequest): Promise<AIResponse> {
		const messages = [
			{ role: 'system', content: request.systemPrompt },
			...request.history,
			{ role: 'user', content: request.userMessage },
		];

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

		try {
			const response = await fetch(this.baseUrl, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.apiKey}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					model: this.model,
					messages,
					max_tokens: 512,
					temperature: 0.7,
				}),
				signal: controller.signal,
			});

			if (!response.ok) {
				const errorText = await response.text().catch(() => 'Unknown error');
				throw new Error(
					`NVIDIA NIM API error (${String(response.status)}): ${errorText}`,
				);
			}

			const data = (await response.json()) as {
				choices: Array<{ message: { content: string } }>;
				usage?: { prompt_tokens: number; completion_tokens: number };
			};

			const text = data.choices[0]?.message?.content ?? '';
			const usage = data.usage
				? { prompt: data.usage.prompt_tokens, completion: data.usage.completion_tokens }
				: undefined;

			return { text, usage };
		} finally {
			clearTimeout(timeoutId);
		}
	}
}
