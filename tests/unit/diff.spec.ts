import { beforeEach, describe, expect, it, vi } from "vitest";
import { runGit } from "../../src/core/git/command.js";
import { buildEnhancedDiffContext } from "../../src/core/git/diff.js";

vi.mock("../../src/core/git/command.js", () => ({ runGit: vi.fn() }));

const result = (stdout: string, overrides = {}) => ({ stdout, stderr: "", status: 0, truncated: false, ...overrides });

describe("buildEnhancedDiffContext", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a summary and bounded snippets", () => {
    vi.mocked(runGit)
      .mockReturnValueOnce(result("fileA.ts\0fileB.ts\0"))
      .mockReturnValueOnce(result("10\t2\tfileA.ts\0" + "5\t1\tfileB.ts\0"))
      .mockReturnValueOnce(result("diff --git a/fileA.ts b/fileA.ts\n@@ -1 +1 @@\n+change1"));

    const output = buildEnhancedDiffContext();
    expect(output).toContain("CHANGES SUMMARY:");
    expect(output).toContain("Files changed: 2");
    expect(output).toContain("CODE CONTEXT:");
    expect(output).toContain("+change1");
  });

  it("does not execute a staged filename through a shell", () => {
    const hostile = '$(touch owned); "quoted".ts';
    vi.mocked(runGit)
      .mockReturnValueOnce(result(`${hostile}\0`))
      .mockReturnValueOnce(result(`1\t0\t${hostile}\0`))
      .mockReturnValueOnce(result("@@ -0,0 +1 @@\n+safe"));

    buildEnhancedDiffContext();
    const snippetArgs = vi.mocked(runGit).mock.calls[2][0];
    expect(snippetArgs).toContain(hostile);
    expect(snippetArgs).toContain("--");
  });

  it("returns an empty context when nothing is staged", () => {
    vi.mocked(runGit).mockReturnValueOnce(result(""));
    expect(buildEnhancedDiffContext()).toBe("");
    expect(runGit).toHaveBeenCalledTimes(1);
  });
});
