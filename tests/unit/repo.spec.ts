import { describe, expect, it, vi } from "vitest";
import { runGit } from "../../src/core/git/command.js";
import { commitWithMessage } from "../../src/core/git/repo.js";

vi.mock("../../src/core/git/command.js", () => ({
  runGit: vi.fn(() => ({ stdout: "", stderr: "", status: 0, truncated: false })),
  gitOutput: vi.fn(),
}));

describe("commitWithMessage", () => {
  it("passes hostile messages as a single argument without a shell", () => {
    const message = 'fix: preserve "quotes"; $(touch owned)';
    commitWithMessage(message, ["--no-verify"], "/repo");
    expect(runGit).toHaveBeenCalledWith(
      ["commit", "-m", message, "--no-verify"],
      { cwd: "/repo", stdio: "inherit" },
    );
  });
});
