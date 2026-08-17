import type { AIClient, AIClientOptions, ChatCompletionResponse, ChatMessage } from "../types.js";

export function localClientFactory(localModelUrl: string, opts: AIClientOptions = {}): AIClient {
  if (!localModelUrl) throw new Error("LOCAL_MODEL_URL is required for the local provider");
  const base = localModelUrl.replace(/\/$/, "");
  const isOllama = /(?:localhost|127\.0\.0\.1):11434/.test(base) || base.endsWith("/api");

  return {
    provider: "local",
    async chat(messages: ChatMessage[], options = {}): Promise<ChatCompletionResponse> {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), opts.timeout ?? 30_000);
      try {
        const endpoint = isOllama ? `${base.replace(/\/api$/, "")}/api/chat` : `${base.replace(/\/v1$/, "")}/v1/chat/completions`;
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify(isOllama ? {
            model: opts.model || "llama3.2",
            messages,
            stream: false,
            options: { temperature: options.temperature ?? 0.2, num_predict: options.max_tokens ?? 500 },
          } : {
            model: opts.model || "local-model",
            messages,
            max_tokens: options.max_tokens ?? 500,
            temperature: options.temperature ?? 0.2,
            n: options.n ?? 1,
          }),
        });
        if (!response.ok) throw new Error(`Local model request failed: ${response.status} ${response.statusText}`);
        const body = await response.json() as any;
        if (!isOllama) return body as ChatCompletionResponse;
        return { choices: [{ message: { role: "assistant", content: body.message?.content || "" }, finish_reason: body.done_reason || null }] };
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
