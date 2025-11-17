import { vi } from "vitest";

// Ensure no real network requests
vi.stubGlobal("fetch", () => {
  throw new Error("Network calls are blocked in tests. Use mocks.");
});

// Silence console spam in tests
vi.spyOn(console, "log").mockImplementation(() => { });
vi.spyOn(console, "error").mockImplementation(() => { });
vi.spyOn(console, "warn").mockImplementation(() => { });
