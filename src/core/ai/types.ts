export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export type ChatCompletionResponse = {
  id?: string;
  choices: Array<{
    message: ChatMessage;
    finish_reason?: string | null;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};

export type AIClientOptions = {
  timeout?: number;
  proxy?: string | undefined;
  model?: string;
};

export interface AIClient {
  provider: string;
  chat: (messages: ChatMessage[], options?: { max_tokens?: number; n?: number; temperature?: number, type?: "readme" | "commit" }) => Promise<ChatCompletionResponse>;
}
