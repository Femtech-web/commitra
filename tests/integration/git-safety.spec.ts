import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runGit } from "../../src/core/git/command.js";
import { buildEnhancedDiffContext } from "../../src/core/git/diff.js";
import { findMetadataRootForStagedFiles } from "../../src/core/utils/fs.js";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => fs.rm(directory, { recursive: true, force: true })));
});

describe("Git safety integration", () => {
  it("handles shell metacharacters in staged filenames without executing them", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "commitra-git-safety-"));
    temporaryDirectories.push(root);
    runGit(["init", "--quiet"], { cwd: root });
    // Double quotes are illegal in Windows filenames. A single quote still
    // exercises argument handling without making the fixture OS-specific.
    const hostileName = "change-$(touch owned)-'quoted'.ts";
    await fs.writeFile(path.join(root, hostileName), "export const safe = true;\n");
    runGit(["add", "--", hostileName], { cwd: root });

    const context = buildEnhancedDiffContext(6_000, root);
    expect(context).toContain("Files changed: 1");
    await expect(fs.access(path.join(root, "owned"))).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("resolves monorepo metadata from the repository root even when called elsewhere", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "commitra-monorepo-"));
    temporaryDirectories.push(root);
    const packageRoot = path.join(root, "packages", "app");
    await fs.mkdir(path.join(packageRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(packageRoot, "package.json"), "{}\n");
    await fs.writeFile(path.join(packageRoot, "src", "index.ts"), "export {};\n");
    runGit(["init", "--quiet"], { cwd: root });
    runGit(["add", "--", "packages/app/src/index.ts"], { cwd: root });
    expect(findMetadataRootForStagedFiles(root)).toBe(packageRoot);
  });
});
