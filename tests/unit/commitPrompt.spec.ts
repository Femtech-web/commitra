import { describe, it, expect } from "vitest";
import { buildCommitPrompt } from "../../src/core/prompt/commit";

describe("buildCommitPrompt", () => {
  it("constructs a valid prompt containing core sections", () => {
    const prompt = buildCommitPrompt({
      diff: "--- diff content",
      branch: "main",
      lastCommits: ["fix: something", "chore: update"],
      techStack: "language: ts",
      locale: "en",
      maxLength: 120,
    });

    expect(prompt).toContain("You are Commitra");
    expect(prompt).toContain("Branch: main");
    expect(prompt).toContain("Tech stack: language: ts");
    expect(prompt).toContain("Previous commits:");
    expect(prompt).toContain("fix: something");
    expect(prompt).toContain("```diff");
    expect(prompt).toContain("--- diff content");
    expect(prompt).toContain("Return only the final commit message line");
  });

  it("truncates diff if too long", () => {
    const longDiff = "x".repeat(10000);
    const prompt = buildCommitPrompt({
      diff: longDiff,
      branch: "",
      lastCommits: [],
      techStack: "",
      locale: "en",
      maxLength: 120,
    });

    expect(prompt).toContain("...");
    expect(prompt).toContain("```diff");
  });
});
