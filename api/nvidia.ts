import type { VercelRequest, VercelResponse } from "@vercel/node";

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { apiKey, model, messages, max_tokens, temperature } = req.body as {
    apiKey?: string;
    model?: string;
    messages?: Array<{ role: string; content: string }>;
    max_tokens?: number;
    temperature?: number;
  };

  if (!apiKey || !messages) {
    return res.status(400).json({ error: "Missing apiKey or messages" });
  }

  try {
    const response = await fetch(NVIDIA_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model ?? "mistralai/ministral-14b-instruct-2512",
        messages,
        max_tokens: max_tokens ?? 512,
        temperature: temperature ?? 0.7,
      }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Proxy error", details: String(error) });
  }
}
