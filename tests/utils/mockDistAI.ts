import { vi } from "vitest";

export function mockDistAI(message: string) {
  const diffBundle = "../../dist/diff-DZJcZj9c.js";

  vi.mock(diffBundle, () => ({
    createAIClient: vi.fn(() => ({
      provider: "mock",
      chat: vi.fn(async () => ({
        choices: [{ message: { content: message } }],
      })),
    })),
    buildCommitPrompt: vi.fn(() => "PROMPT"),
    buildEnhancedDiffContext: vi.fn(() => "DIFF"),
  }));
}
