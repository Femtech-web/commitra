import fs from "fs";
import path from "path";

export type ExtractedDeps = {
  packageManager?: string;
  dependencies: string[];
  raw?: Record<string, any>;
};

export function detectLanguageAndManager(projectRoot: string): { language: string; packageManager?: string } {
  // Check for manifest files
  const files = fs.readdirSync(projectRoot);
  if (files.includes("package.json")) {
    const pm = files.includes("pnpm-lock.yaml") ? "pnpm" : files.includes("yarn.lock") ? "yarn" : "npm";
    return { language: "JavaScript/TypeScript", packageManager: pm };
  }
  if (files.includes("pyproject.toml") || files.includes("requirements.txt")) {
    return { language: "Python", packageManager: "pip/poetry" };
  }
  if (files.includes("go.mod")) {
    return { language: "Go", packageManager: "go" };
  }
  if (files.includes("Cargo.toml")) {
    return { language: "Rust", packageManager: "cargo" };
  }
  if (files.includes("pom.xml")) {
    return { language: "Java", packageManager: "maven" };
  }
  if (files.includes("composer.json")) {
    return { language: "PHP", packageManager: "composer" };
  }
  if (files.some((f) => f.endsWith(".sol"))) {
    return { language: "Solidity", packageManager: "npm" };
  }
  return { language: "Unknown", packageManager: undefined };
}

export async function extractDependencies(projectRoot: string, language: string, packageManager?: string): Promise<ExtractedDeps> {
  try {
    if (language.includes("JavaScript")) {
      const pkgPath = path.join(projectRoot, "package.json");
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      const deps = [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.devDependencies || {}),
      ];
      return { packageManager, dependencies: deps, raw: pkg };
    }

    if (language === "Python") {
      const pyproject = path.join(projectRoot, "pyproject.toml");
      if (fs.existsSync(pyproject)) {
        const toml = fs.readFileSync(pyproject, "utf8");
        const matches = Array.from(toml.matchAll(/([a-zA-Z0-9_-]+)\s*=\s*["'][^"']+["']/g)).map(m => m[1]);
        return { packageManager, dependencies: matches, raw: { pyproject: true } };
      }
      const req = path.join(projectRoot, "requirements.txt");
      if (fs.existsSync(req)) {
        const txt = fs.readFileSync(req, "utf8");
        const deps = txt.split("\n").map(l => l.split(/[<=>]/)[0].trim()).filter(Boolean);
        return { packageManager, dependencies: deps, raw: { requirements: true } };
      }
      return { packageManager, dependencies: [], raw: {} };
    }

    if (language === "Go") {
      const goMod = path.join(projectRoot, "go.mod");
      if (fs.existsSync(goMod)) {
        const content = fs.readFileSync(goMod, "utf8");
        const matches = Array.from(content.matchAll(/^\s*require\s+([\w\.\/\-]+)\s+/gim)).map(m => m[1]);
        return { packageManager: "go", dependencies: matches, raw: { goMod: true } };
      }
    }

    if (language === "Rust") {
      const cargo = path.join(projectRoot, "Cargo.toml");
      if (fs.existsSync(cargo)) {
        const content = fs.readFileSync(cargo, "utf8");
        const matches = Array.from(content.matchAll(/^\s*([a-zA-Z0-9_+-]+)\s*=\s*/gim)).map(m => m[1]);
        return { packageManager: "cargo", dependencies: matches, raw: { cargo: true } };
      }
    }

    if (language === "Java") {
      const pom = path.join(projectRoot, "pom.xml");
      if (fs.existsSync(pom)) {
        const xml = fs.readFileSync(pom, "utf8");
        const matches = Array.from(xml.matchAll(/<artifactId>([^<]+)<\/artifactId>/g)).map(m => m[1]);
        return { packageManager: "maven", dependencies: matches, raw: {} };
      }
    }

    if (language === "PHP") {
      const composer = path.join(projectRoot, "composer.json");
      if (fs.existsSync(composer)) {
        const pkg = JSON.parse(fs.readFileSync(composer, "utf8"));
        const deps = Object.keys(pkg.require || {});
        return { packageManager: "composer", dependencies: deps, raw: pkg };
      }
    }

    return { packageManager, dependencies: [], raw: {} };
  } catch (err) {
    return { packageManager, dependencies: [], raw: {} };
  }
}
