import type { AIClient, ChatMessage, ChatCompletionResponse } from '../types';
import type { AIClientOptions } from '../types';

export function anthropicClientFactory(apiKey: string, opts?: AIClientOptions): AIClient {
  if (!apiKey) {
    throw new Error('Anthropic API key is required');
  }

  // lazy import; allow optional dependency
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Anthropic = (() => {
    try {
      return require('@anthropic-ai/sdk');
    } catch {
      return null;
    }
  })();

  return {
    provider: 'anthropic',
    async chat(messages: ChatMessage[], options = {}) {
      const prompt = messages.map(m => `[${m.role.toUpperCase()}] ${m.content}`).join('\n\n');

      if (Anthropic) {
        const client = new Anthropic.Anthropic({ apiKey });
        const resp = await client.completions.create({
          model: opts?.model ?? 'claude-2.1',
          prompt,
          max_tokens_to_sample: options?.max_tokens ?? 500,
          temperature: options?.temperature ?? 0.2,
        });

        const text = resp?.completion ?? '';
        return {
          choices: [{ message: { role: 'assistant', content: text }, finish_reason: null }],
        } as ChatCompletionResponse;
      }

      const controller = new AbortController();
      const timeout = opts?.timeout ?? 10000;
      const timer = setTimeout(() => controller.abort(), timeout);

      try {
        const res = await fetch('https://api.anthropic.com/v1/complete', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: opts?.model ?? 'claude-2.1',
            prompt,
            max_tokens_to_sample: options?.max_tokens ?? 500,
            temperature: options?.temperature ?? 0.2,
          }),
        });

        if (!res.ok) {
          throw new Error(`Anthropic request failed: ${res.status} ${res.statusText}`);
        }

        const body = await res.json();
        return {
          choices: [{ message: { role: 'assistant', content: body.completion ?? '' }, finish_reason: null }],
        } as ChatCompletionResponse;
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
