import { Groq } from "groq-sdk";
import chalk from "chalk";
import type { AIClient, ChatMessage, ChatCompletionResponse, AIClientOptions } from "../types.js";

export function groqClientFactory(apiKey: string, opts?: AIClientOptions): AIClient {
  if (!apiKey) throw new Error("Groq API key is required");


  const client = new Groq({
    apiKey,
    timeout: opts?.timeout,
  });

  return {
    provider: "groq",
    async chat(messages: ChatMessage[], options = {}): Promise<ChatCompletionResponse> {
      try {
        const completion = await client.chat.completions.create({
          model:
            opts?.model ||
            (options.type === "commit"
              ? "moonshotai/kimi-k2-instruct-0905"
              : "openai/gpt-oss-20b"),
          messages: messages as any,
          temperature: options?.temperature ?? 0.3,
          top_p: 1,
          max_completion_tokens: options?.max_tokens ?? 400,
          n: options?.n ?? 1,
          stream: false,
        });

        const choices = (completion.choices || [])
          .map((c: any) => ({
            message: {
              role: c.message?.role ?? "assistant",
              content: sanitizeMessage(c.message?.content ?? ""),
            },
            finish_reason: c.finish_reason ?? null,
          }))
          .filter((c) => c.message.content.length > 0);

        if (!choices.length) {
          console.warn(chalk.yellow("Groq returned an empty message — check your model or try smaller diffs."));
        }

        return {
          id: (completion as any).id,
          choices,
          usage: (completion as any).usage,
        } as ChatCompletionResponse;
      } catch (error: any) {
        handleGroqError(error);
        throw error;
      }
    },
  };
}

function sanitizeMessage(msg: string): string {
  return msg
    .trim()
    .replace(/^["']|["']\.?$/g, "")
    .replace(/[\n\r]/g, " ")
    .replace(/(\w)\.$/, "$1");
}

function handleGroqError(error: any) {
  if (error instanceof Groq.APIError) {
    let message = chalk.red(`Groq API Error: ${error.status} - ${error.name}`);

    if (error.message) {
      message += chalk.gray(`\n→ ${error.message}`);
    }

    if (error.status === 413) {
      message += chalk.yellow(
        "\n💡 Your diff may be too large.\nTry committing smaller batches or reducing included files."
      );
    }

    if (error.status === 429) {
      message += chalk.yellow("\nRate limit exceeded — try again shortly.");
    }

    if (error.status >= 500) {
      message += chalk.yellow("\nGroq API might be temporarily down: https://console.groq.com/status");
    }

    console.error(message);
  } else if (error.code === "ENOTFOUND") {
    console.error(chalk.red(`Could not reach Groq API (${error.hostname}) — check your internet or proxy settings.`));
  } else {
    console.error(chalk.red(`Unexpected Groq error: ${error.message || String(error)}`));
  }
}
