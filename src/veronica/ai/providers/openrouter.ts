import type { AIProvider, AIRequest, AIResponse } from "../../types";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "openrouter/free";
const REQUEST_TIMEOUT_MS = 30_000;

interface OpenRouterConfig {
  apiKey: string;
  model?: string;
  siteUrl?: string;
  siteName?: string;
}

/**
 * OpenRouter AI provider.
 * Uses OpenAI-compatible API structure.
 * Supports custom model selection and free/paid model switching.
 */
export class OpenRouterProvider implements AIProvider {
  readonly name = "OpenRouter";
  readonly id = "openrouter";

  private apiKey: string;
  private model: string;
  private siteUrl: string;
  private siteName: string;

  constructor(config: OpenRouterConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model ?? DEFAULT_MODEL;
    this.siteUrl = config.siteUrl ?? window.location.origin;
    this.siteName = config.siteName ?? "Veronica Terminal";
  }

  async complete(request: AIRequest): Promise<AIResponse> {
    const messages = [
      { role: "system", content: request.systemPrompt },
      ...request.history,
      { role: "user", content: request.userMessage },
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": this.siteUrl,
          "X-Title": this.siteName,
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
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(
          `OpenRouter API error (${String(response.status)}): ${errorText}`,
        );
      }

      const data = (await response.json()) as {
        choices: Array<{ message: { content: string } }>;
        usage?: { prompt_tokens: number; completion_tokens: number };
      };

      const text = data.choices[0]?.message?.content ?? "";
      const usage = data.usage
        ? {
            prompt: data.usage.prompt_tokens,
            completion: data.usage.completion_tokens,
          }
        : undefined;

      return { text, usage };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
