import { describe, expect, it } from "vitest";
import { redactSensitiveText } from "../../src/core/privacy/redact.js";

describe("redactSensitiveText", () => {
  it("removes provider keys, assignments, credentials, and private keys", () => {
    const input = [
      `GROQ_API_KEY=${["gsk", "abcdefghijklmnopqrstuvwxyz123456"].join("_")}`,
      "password: super-secret-value",
      "https://user:pass@example.com/api",
      `-----BEGIN ${"PRIVATE KEY"}-----\nsecret\n-----END ${"PRIVATE KEY"}-----`,
    ].join("\n");
    const result = redactSensitiveText(input);
    expect(result.text).not.toContain("abcdefghijklmnopqrstuvwxyz");
    expect(result.text).not.toContain("super-secret-value");
    expect(result.text).not.toContain("user:pass");
    expect(result.text).not.toContain("BEGIN PRIVATE KEY");
    expect(result.redactions).toBeGreaterThanOrEqual(4);
  });
});
