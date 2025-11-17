import { vi } from "vitest";

export function mockAIResponse(message = "feat: mock commit message") {
  return {
    choices: [
      {
        message: {
          content: message,
        },
      },
    ],
  };
}

export function mockAIClientFactory(message: string) {
  return {
    provider: "mock",
    chat: vi.fn(async () => mockAIResponse(message)),
  };
}

