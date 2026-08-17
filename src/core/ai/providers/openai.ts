import type { AIClient, AIClientOptions, ChatCompletionResponse, ChatMessage } from "../types.js";

export function openaiClientFactory(apiKey: string, opts: AIClientOptions = {}): AIClient {
  if (!apiKey) throw new Error("OpenAI API key is required");
  let clientPromise: Promise<InstanceType<(typeof import("openai"))["default"]>> | undefined;
  const getClient = () => clientPromise ??= import("openai").then(({ default: OpenAI }) => new OpenAI({ apiKey, timeout: opts.timeout }));

  return {
    provider: "openai",
    async chat(messages: ChatMessage[], options = {}): Promise<ChatCompletionResponse> {
      const client = await getClient();
      const completion = await client.chat.completions.create({
        model: opts.model || "gpt-4o-mini",
        messages,
        temperature: options.temperature ?? 0.2,
        max_completion_tokens: options.max_tokens ?? 500,
        n: options.n ?? 1,
      });
      return {
        id: completion.id,
        choices: completion.choices.map((choice) => ({
          message: { role: "assistant", content: choice.message.content || "" },
          finish_reason: choice.finish_reason,
        })),
        usage: completion.usage ? {
          prompt_tokens: completion.usage.prompt_tokens,
          completion_tokens: completion.usage.completion_tokens,
          total_tokens: completion.usage.total_tokens,
        } : undefined,
      };
    },
  };
}
