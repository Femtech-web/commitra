import { vi } from "vitest";

export function mockFs() {
  const read = vi.fn();
  const write = vi.fn();
  const exists = vi.fn();

  vi.mock("fs", () => ({
    default: {
      readFileSync: read,
      writeFileSync: write,
      existsSync: exists,
    },
  }));

  return { read, write, exists };
}
