import type { AIClient, ChatMessage, ChatCompletionResponse } from '../types';
import type { AIClientOptions } from '../types';
import { AbortController } from 'node-abort-controller';

export function localClientFactory(localModelUrl: string, opts?: AIClientOptions): AIClient {
  if (!localModelUrl) {
    throw new Error('localModelUrl is required for local provider');
  }

  const base = localModelUrl.replace(/\/$/, '');

  return {
    provider: 'local',
    async chat(messages: ChatMessage[], options = {}) {
      const controller = new AbortController();
      const timeout = opts?.timeout ?? 10000;
      const timer = setTimeout(() => controller.abort(), timeout);

      try {
        const res = await fetch(`${base}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages,
            max_tokens: options?.max_tokens ?? 500,
            temperature: options?.temperature ?? 0.2,
            n: options?.n ?? 1,
          }),
          signal: controller.signal as any,
        });

        if (!res.ok) {
          throw new Error(`Local model request failed: ${res.status} ${res.statusText}`);
        }

        const json = await res.json();
        return json as ChatCompletionResponse;
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
