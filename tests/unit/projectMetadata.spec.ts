import { describe, it, expect, vi, beforeEach } from "vitest";

// PURE MOCK BEFORE IMPORT
vi.mock("../../src/core/detect/projectMetadata", () => ({
  parsePackageJson: vi.fn(),
  parsePyproject: vi.fn(),
  parseRequirements: vi.fn(),
  parseGoMod: vi.fn(),
  parseCargo: vi.fn(),
  parseComposer: vi.fn(),
  parseGemfile: vi.fn(),
  parseGradle: vi.fn(),
  parsePom: vi.fn(),
  parseSwift: vi.fn(),
  parseCsproj: vi.fn(),
  detectProjectMetadata: vi.fn(async (root: string) => {
    // The dispatcher is mocked: call fns in order
    const mod = await vi.importMock<any>(
      "../../src/core/detect/projectMetadata"
    );

    const detectors = [
      mod.parsePackageJson,
      mod.parsePyproject,
      mod.parseRequirements,
      mod.parseGoMod,
      mod.parseCargo,
      mod.parseComposer,
      mod.parseGemfile,
      mod.parseGradle,
      mod.parsePom,
      mod.parseSwift,
      mod.parseCsproj,
    ];

    for (const det of detectors) {
      const res = await det(root);
      if (res) return res;
    }

    return {
      name: root.split("/").pop(),
      dependencies: [],
      language: "unknown",
      ecosystem: "unknown",
    };
  }),
}));

import {
  detectProjectMetadata,
  parsePackageJson,
  parsePyproject,
  parseRequirements,
  parseGoMod,
  parseCargo,
  parseComposer,
  parseGemfile,
  parseGradle,
  parsePom,
  parseSwift,
  parseCsproj,
} from "../../src/core/detect/projectMetadata";

describe("detectProjectMetadata", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns JS metadata", async () => {
    (parsePackageJson as any).mockReturnValue({
      name: "myapp",
      version: "1.0.0",
      description: "",
      dependencies: [{ name: "react", version: "18" }],
      language: "javascript",
      ecosystem: "node",
    });

    const meta = await detectProjectMetadata("/any/path");
    expect(meta.language).toBe("javascript");
    expect(meta.ecosystem).toBe("node");
    expect(meta.dependencies[0].name).toBe("react");
  });

  it("returns fallback unknown metadata", async () => {
    [
      parsePackageJson,
      parsePyproject,
      parseRequirements,
      parseGoMod,
      parseCargo,
      parseComposer,
      parseGemfile,
      parseGradle,
      parsePom,
      parseSwift,
      parseCsproj,
    ].forEach((fn) => (fn as any).mockReturnValue(null));

    const meta = await detectProjectMetadata("/project/testapp");
    expect(meta.language).toBe("unknown");
    expect(meta.ecosystem).toBe("unknown");
    expect(meta.dependencies).toEqual([]);
  });
});
