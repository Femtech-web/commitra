import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { installHook, uninstallHook } from "../../src/cli/commands/hook.js";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => fs.rm(directory, { recursive: true, force: true })));
});

describe("hook installation", () => {
  it("preserves and restores an existing hook while safely quoting paths", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "commitra-hook-"));
    temporaryDirectories.push(root);
    const hooks = path.join(root, "hooks with spaces");
    const hookPath = path.join(hooks, "prepare-commit-msg");
    const entryDirectory = path.join(root, "entry $(touch owned)");
    const entryPath = path.join(entryDirectory, "hook-entry.js");
    await fs.mkdir(entryDirectory, { recursive: true });
    await fs.mkdir(hooks, { recursive: true });
    await fs.writeFile(entryPath, "// entry\n");
    await fs.writeFile(hookPath, "#!/bin/sh\necho existing\n", { mode: 0o755 });

    await installHook(hookPath, entryPath);
    const installed = await fs.readFile(hookPath, "utf8");
    expect(installed).toContain("Commitra Git hook");
    expect(installed).toContain(`'${entryPath}'`);
    expect(await fs.readFile(`${hookPath}.commitra-backup`, "utf8")).toContain("existing");

    await uninstallHook(hookPath);
    expect(await fs.readFile(hookPath, "utf8")).toContain("existing");
  });
});
