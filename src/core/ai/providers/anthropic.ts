import type { AIClient, AIClientOptions, ChatCompletionResponse, ChatMessage } from "../types.js";

export function anthropicClientFactory(apiKey: string, opts: AIClientOptions = {}): AIClient {
  if (!apiKey) throw new Error("Anthropic API key is required");
  let clientPromise: Promise<InstanceType<(typeof import("@anthropic-ai/sdk"))["default"]>> | undefined;
  const getClient = () => clientPromise ??= import("@anthropic-ai/sdk")
    .then(({ default: Anthropic }) => new Anthropic({ apiKey, timeout: opts.timeout }));

  return {
    provider: "anthropic",
    async chat(messages: ChatMessage[], options = {}): Promise<ChatCompletionResponse> {
      const client = await getClient();
      const system = messages.filter((message) => message.role === "system").map((message) => message.content).join("\n\n");
      const conversation = messages
        .filter((message) => message.role !== "system")
        .map((message) => ({ role: message.role as "user" | "assistant", content: message.content }));
      const response = await client.messages.create({
        model: opts.model || "claude-haiku-4-5",
        system: system || undefined,
        messages: conversation,
        max_tokens: options.max_tokens ?? 500,
        temperature: options.temperature ?? 0.2,
      });
      const content = response.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("\n");
      return {
        id: response.id,
        choices: [{ message: { role: "assistant", content }, finish_reason: response.stop_reason }],
        usage: {
          prompt_tokens: response.usage.input_tokens,
          completion_tokens: response.usage.output_tokens,
          total_tokens: response.usage.input_tokens + response.usage.output_tokens,
        },
      };
    },
  };
}
