export interface CommitraConfig {
  provider: "openai" | "groq" | "anthropic" | "local";
  model: string;
  apiKey?: string;
}

export const DEFAULT_CONFIG: CommitraConfig = {
  provider: "openai",
  model: "gpt-4o-mini",
};
