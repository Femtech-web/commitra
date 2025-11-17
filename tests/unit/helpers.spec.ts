import { describe, it, expect, vi } from "vitest";
import {
  truncate,
  capitalize,
  safeStringify,
  normalizeWhitespace,
  loadPackageJson,
} from "../../src/core/utils/helpers";
import fs from "fs";

vi.mock("fs");
vi.mock("path");

describe("helpers", () => {
  it("truncate works", () => {
    expect(truncate("hello", 10)).toBe("hello");
    expect(truncate("a".repeat(20), 5)).toBe("aaaaa...");
  });

  it("capitalize works", () => {
    expect(capitalize("word")).toBe("Word");
    expect(capitalize("")).toBe("");
  });

  it("safeStringify handles errors", () => {
    const obj: any = {};
    obj.self = obj;

    expect(safeStringify(obj)).toBe("[Unserializable Object]");
  });

  it("normalizeWhitespace collapses spaces", () => {
    expect(normalizeWhitespace("A   B   C")).toBe("A B C");
  });

  it("loadPackageJson loads first existing file", () => {
    vi.mocked(fs.existsSync).mockReturnValueOnce(true);
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ version: "2.0.0" })
    );

    const result = loadPackageJson();
    expect(result.version).toBe("2.0.0");
  });
});
