import type { AIClient, ChatMessage, ChatCompletionResponse } from '../types';
import type { AIClientOptions } from '../types';
import { AbortController } from 'node-abort-controller';

export function openaiClientFactory(apiKey: string, opts?: AIClientOptions): AIClient {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  // lazy import so the package is optional at runtime
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
  const { OpenAI } = require('openai');

  const client = new OpenAI({ apiKey });

  return {
    provider: 'openai',
    async chat(messages, options = {}) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), opts?.timeout ?? 10000);

      try {
        const messagesForApi = messages.map((m: ChatMessage) => ({ role: m.role, content: m.content }));

        const completion = await client.chat.completions.create({
          model: opts?.model ?? options?.max_tokens ? 'gpt-4o' : 'gpt-4o',
          messages: messagesForApi,
          temperature: options?.temperature ?? 0.2,
          max_tokens: options?.max_tokens ?? Math.max(200, 12 * (options?.max_tokens ?? 150)),
          n: options?.n ?? 1,
          signal: controller.signal as any,
        });

        const choices = (completion.choices || []).map((c: any) => ({
          message: {
            role: c.message.role,
            content: c.message.content,
          },
          finish_reason: c.finish_reason ?? null,
        }));

        return {
          id: (completion as any).id,
          choices,
          usage: (completion as any).usage,
        } as ChatCompletionResponse;
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
