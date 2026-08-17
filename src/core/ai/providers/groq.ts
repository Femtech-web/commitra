import chalk from "chalk";
import type { AIClient, AIClientOptions, ChatCompletionResponse, ChatMessage } from "../types.js";

export function groqClientFactory(apiKey: string, opts: AIClientOptions = {}): AIClient {
  if (!apiKey) throw new Error("Groq API key is required");
  let clientPromise: Promise<InstanceType<(typeof import("groq-sdk"))["Groq"]>> | undefined;
  const getClient = () => clientPromise ??= import("groq-sdk")
    .then(({ Groq }) => new Groq({ apiKey, timeout: opts.timeout }));

  return {
    provider: "groq",
    async chat(messages: ChatMessage[], options = {}): Promise<ChatCompletionResponse> {
      try {
        const client = await getClient();
        const completion = await client.chat.completions.create({
          model: opts.model || (options.type === "commit" ? "openai/gpt-oss-120b" : "openai/gpt-oss-20b"),
          messages,
          temperature: options.temperature ?? 0.3,
          top_p: 1,
          max_completion_tokens: options.max_tokens ?? 400,
          n: options.n ?? 1,
          stream: false,
        });
        return {
          id: completion.id,
          choices: completion.choices.map((choice) => ({
            message: { role: "assistant", content: sanitizeMessage(choice.message?.content || "") },
            finish_reason: choice.finish_reason,
          })).filter((choice) => choice.message.content),
          usage: completion.usage,
        } as ChatCompletionResponse;
      } catch (error) {
        handleGroqError(error);
        throw error;
      }
    },
  };
}

function sanitizeMessage(message: string): string {
  return message.trim().replace(/^["']|["']\.?$/g, "").replace(/[\n\r]+/g, " ").replace(/(\w)\.$/, "$1");
}

function handleGroqError(error: unknown): void {
  const detail = error as { status?: number; name?: string; message?: string; code?: string; hostname?: string };
  if (detail.status) {
    let message = chalk.red(`Groq API error: ${detail.status}${detail.name ? ` - ${detail.name}` : ""}`);
    if (detail.message) message += chalk.gray(`\n→ ${detail.message}`);
    if (detail.status === 413) message += chalk.yellow("\nThe request was too large. Commitra already summarized the diff; try staging a smaller logical change if this persists.");
    if (detail.status === 429) message += chalk.yellow("\nRate limit exceeded — retry shortly or select another model.");
    console.error(message);
  } else if (detail.code === "ENOTFOUND") {
    console.error(chalk.red(`Could not reach Groq${detail.hostname ? ` (${detail.hostname})` : ""}.`));
  }
}
