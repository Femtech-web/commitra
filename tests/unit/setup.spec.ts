import { describe, expect, it } from "vitest";
import { validateLocalModelUrl } from "../../src/cli/commands/setup";

describe("validateLocalModelUrl", () => {
  it.each(["http://127.0.0.1:11434", "https://models.example.com/v1"]) (
    "accepts credential-free HTTP(S) URL %s",
    (value) => {
      expect(validateLocalModelUrl(value)).toBeUndefined();
    },
  );

  it("rejects embedded credentials", () => {
    expect(validateLocalModelUrl("https://user:secret@models.example.com/v1")).toBe(
      "Do not embed credentials in the URL.",
    );
  });

  it("rejects unsupported protocols", () => {
    expect(validateLocalModelUrl("file:///tmp/model")).toBe("Use an HTTP(S) URL.");
  });

  it("rejects malformed URLs", () => {
    expect(validateLocalModelUrl("not a URL")).toBe("Enter a valid URL.");
  });
});
