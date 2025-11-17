import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildEnhancedDiffContext } from "../../src/core/git/diff";
import { spawnSync } from "child_process";
import { execSync } from "child_process";

vi.mock("child_process", () => ({
  spawnSync: vi.fn(),
  execSync: vi.fn(),
}));

describe("buildEnhancedDiffContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns enhanced diff summary + snippets when data exists", () => {
    // staged files
    vi.mocked(spawnSync).mockReturnValueOnce({ stdout: "fileA.ts\nfileB.ts\n" });

    // diff summary
    vi.mocked(spawnSync).mockReturnValueOnce({
      stdout: "10\t2\tfileA.ts\n5\t1\tfileB.ts\n",
    });

    // snippets (execSync for each file)
    vi.mocked(execSync)
      .mockReturnValueOnce("@@ -1 +1 @@\n+change1")
      .mockReturnValueOnce("@@ -2 +2 @@\n+change2");

    const result = buildEnhancedDiffContext();

    expect(result).toContain("CHANGES SUMMARY:");
    expect(result).toContain("Files changed: 2");
    expect(result).toContain("CODE CONTEXT:");
    expect(result).toContain("# fileA.ts");
    expect(result).toContain("# fileB.ts");
  });

  it("uses fallback diff if summary and snippets are empty", () => {
    vi.mocked(spawnSync).mockReturnValue({ stdout: "" });
    vi.mocked(execSync).mockReturnValue("FULL FALLBACK DIFF");

    const result = buildEnhancedDiffContext();
    expect(result).toContain("FULL DIFF (fallback):");
    expect(result).toContain("FULL FALLBACK DIFF");
  });
});
