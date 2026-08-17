import { describe, expect, it } from "vitest";
import { getGroqCompletionOptions } from "../../src/core/ai/providers/groq.js";

describe("Groq completion options", () => {
  it("reserves reasoning and answer tokens for GPT-OSS commit requests", () => {
    expect(getGroqCompletionOptions("openai/gpt-oss-120b", 120)).toEqual({
      max_completion_tokens: 1_024,
      reasoning_effort: "low",
      reasoning_format: "hidden",
    });
  });

  it("preserves larger GPT-OSS budgets", () => {
    expect(getGroqCompletionOptions("openai/gpt-oss-20b", 2_000).max_completion_tokens).toBe(2_000);
  });

  it("does not add reasoning controls to other Groq models", () => {
    expect(getGroqCompletionOptions("llama-3.1-8b-instant", 120)).toEqual({
      max_completion_tokens: 120,
    });
  });
});
