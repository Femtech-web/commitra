import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock BEFORE importing config manager
vi.mock("os", () => ({
  default: {
    homedir: vi.fn(() => "/home/user"),
  },
}));

vi.mock("fs/promises", () => ({
  default: {
    readFile: vi.fn(),
  },
}));

vi.mock("ini", () => ({
  default: {
    parse: vi.fn(),
  },
}));

import fs from "fs/promises";
import os from "os";
import ini from "ini";

import { getRuntimeConfig } from "../../src/core/config/manager";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getRuntimeConfig", () => {
  it("loads values from config file", async () => {
    vi.mocked(fs.readFile).mockResolvedValue(
      "provider=openai\nOPENAI_API_KEY=abc"
    );

    vi.mocked(ini.parse).mockReturnValue({
      provider: "openai",
      OPENAI_API_KEY: "abc",
    });

    const cfg = await getRuntimeConfig();
    expect(cfg.provider).toBe("openai");
    expect(cfg.openaiApiKey).toBe("abc");
  });

  it("falls back to env when file missing", async () => {
    vi.mocked(fs.readFile).mockRejectedValue(new Error("missing"));
    process.env.OPENAI_API_KEY = "xyz";

    const cfg = await getRuntimeConfig();
    expect(cfg.openaiApiKey).toBe("xyz");
    expect(cfg.provider).toBe("groq");
  });
});
