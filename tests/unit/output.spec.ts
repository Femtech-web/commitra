import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { parseJsonResponse } from "../../src/core/ai/response.js";
import { resolveProjectOutput, writeGeneratedFile } from "../../src/core/output/file.js";

const directories: string[] = [];
afterEach(() => directories.splice(0).forEach((directory) => fs.rmSync(directory, { recursive: true, force: true })));

describe("generated output", () => {
  it("parses fenced JSON responses", () => {
    expect(parseJsonResponse<{ ok: boolean }>("```json\n{\"ok\":true}\n```").ok).toBe(true);
  });

  it("keeps output inside the project and requires force to overwrite", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "commitra-output-"));
    directories.push(root);
    expect(() => resolveProjectOutput(root, "../outside.md", "README.md")).toThrow(/inside the project/);
    const output = resolveProjectOutput(root, "docs/result.md", "README.md");
    writeGeneratedFile(output, "first");
    expect(() => writeGeneratedFile(output, "second")).toThrow(/--force/);
    writeGeneratedFile(output, "second", true);
    expect(fs.readFileSync(output, "utf8")).toBe("second");
  });
});
