import { describe, expect, it } from "vitest";
import { normalizeCommitMessage, parseCommitFormat, parseSuggestionCount } from "../../src/core/commit/message.js";

describe("commit message utilities", () => {
  it("validates suggestion counts and formats", () => {
    expect(parseSuggestionCount("3")).toBe(3);
    expect(() => parseSuggestionCount("100")).toThrow(/between 1 and 10/);
    expect(parseCommitFormat("gitmoji")).toBe("gitmoji");
    expect(() => parseCommitFormat("unknown")).toThrow(/Invalid commit format/);
  });

  it("normalizes model wrappers and enforces subject length", () => {
    expect(normalizeCommitMessage('```text\n"fix: stop command injection."\n```', 120)).toBe("fix: stop command injection");
    expect(normalizeCommitMessage("feat: this subject is too long", 12)).toBe("feat: this");
    expect(normalizeCommitMessage("abcdefghijklmnop", 12)).toBe("abcdefghijkl");
  });
});
