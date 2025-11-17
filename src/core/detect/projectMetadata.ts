import fs from "fs";
import path from "path";
import toml from "@iarna/toml";
import xml2js from "xml2js";


export interface Dependency {
  name: string;
  version: string;
}

export interface ProjectMetadata {
  name: string;
  version?: string;
  description?: string;
  dependencies: Dependency[];
  language: string;
  ecosystem: string;
}


function exists(file: string) {
  return fs.existsSync(file);
}

function read(file: string) {
  return fs.readFileSync(file, "utf-8");
}

/* ---------------------------------------------
   JavaScript / TypeScript (Node)
--------------------------------------------- */

export function parsePackageJson(root: string): ProjectMetadata | null {
  const file = path.join(root, "package.json");
  if (!exists(file)) return null;

  const pkg = JSON.parse(read(file));

  const deps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  const dependencies: Dependency[] = Object.entries(deps).map(([name, version]) => ({
    name,
    version: String(version),
  }));

  return {
    name: pkg.name ?? path.basename(root),
    version: pkg.version,
    description: pkg.description,
    dependencies,
    language: "javascript",
    ecosystem: "node",
  };
}

/* ---------------------------------------------
   Python
   - pyproject.toml (modern)
   - requirements.txt (fallback)
--------------------------------------------- */

export function parsePyproject(root: string): ProjectMetadata | null {
  const file = path.join(root, "pyproject.toml");
  if (!exists(file)) return null;

  const py = toml.parse(read(file)) as any;

  const project = py.project || py.tool?.poetry;
  if (!project) return null;

  const deps = project.dependencies || {};

  const dependencies: Dependency[] = Object.entries(deps).map(([name, version]) => ({
    name,
    version: typeof version === "string" ? version : JSON.stringify(version),
  }));

  return {
    name: project.name || path.basename(root),
    version: project.version,
    description: project.description,
    dependencies,
    language: "python",
    ecosystem: "python",
  };
}

export function parseRequirements(root: string): ProjectMetadata | null {
  const file = path.join(root, "requirements.txt");
  if (!exists(file)) return null;

  const lines = read(file).split("\n");

  const dependencies: Dependency[] = lines
    .filter(Boolean)
    .map((line) => {
      const [name, version] = line.split("==");
      return {
        name: name.trim(),
        version: version?.trim() || "latest",
      };
    });

  return {
    name: path.basename(root),
    dependencies,
    language: "python",
    ecosystem: "python",
  };
}

/* ---------------------------------------------
   Go (go.mod)
--------------------------------------------- */

export function parseGoMod(root: string): ProjectMetadata | null {
  const file = path.join(root, "go.mod");
  if (!exists(file)) return null;

  const content = read(file);
  const name = content.match(/^module (.+)/m)?.[1] ?? path.basename(root);

  const depMatches = [...content.matchAll(/require ([^ ]+) ([^ ]+)/g)];

  const dependencies: Dependency[] = depMatches.map((m) => ({
    name: m[1],
    version: m[2],
  }));

  return {
    name,
    dependencies,
    language: "go",
    ecosystem: "go",
  };
}

/* ---------------------------------------------
   Rust (Cargo.toml)
--------------------------------------------- */

export function parseCargo(root: string): ProjectMetadata | null {
  const file = path.join(root, "Cargo.toml");
  if (!exists(file)) return null;

  const data = toml.parse(read(file)) as any;

  const pkg = data.package || {};
  const deps = data.dependencies || {};

  const dependencies: Dependency[] = Object.entries(deps).map(([name, version]) => ({
    name,
    version: typeof version === "string" ? version : JSON.stringify(version),
  }));

  return {
    name: pkg.name || path.basename(root),
    version: pkg.version,
    description: pkg.description,
    dependencies,
    language: "rust",
    ecosystem: "cargo",
  };
}

/* ---------------------------------------------
   PHP (composer.json)
--------------------------------------------- */

export function parseComposer(root: string): ProjectMetadata | null {
  const file = path.join(root, "composer.json");
  if (!exists(file)) return null;

  const pkg = JSON.parse(read(file));

  const deps = {
    ...(pkg.require || {}),
    ...(pkg["require-dev"] || {}),
  };

  const dependencies: Dependency[] = Object.entries(deps).map(([name, version]) => ({
    name,
    version: String(version),
  }));

  return {
    name: pkg.name ?? path.basename(root),
    version: pkg.version,
    description: pkg.description,
    dependencies,
    language: "php",
    ecosystem: "composer",
  };
}

/* ---------------------------------------------
   Ruby (Gemfile)
--------------------------------------------- */

export function parseGemfile(root: string): ProjectMetadata | null {
  const file = path.join(root, "Gemfile");
  if (!exists(file)) return null;

  const lines = read(file).split("\n");

  const dependencies: Dependency[] = lines
    .filter((l) => l.trim().startsWith("gem "))
    .map((l) => {
      const match = l.match(/gem ["'](.+?)["'],?\s*["']?(.+?)["']?$/);
      return match
        ? { name: match[1], version: match[2] || "latest" }
        : null;
    })
    .filter(Boolean) as Dependency[];

  return {
    name: path.basename(root),
    dependencies,
    language: "ruby",
    ecosystem: "bundler",
  };
}

/* ---------------------------------------------
   C# (.csproj)
--------------------------------------------- */

export async function parseCsproj(root: string): Promise<ProjectMetadata | null> {
  const files = fs.readdirSync(root).filter((f) => f.endsWith(".csproj"));
  if (!files.length) return null;

  const file = path.join(root, files[0]);
  const xml = await xml2js.parseStringPromise(read(file));

  const pkg = xml.Project.PropertyGroup?.[0] || {};
  const deps = xml.Project.ItemGroup?.flatMap((grp: any) =>
    grp.PackageReference?.map((ref: any) => ({
      name: ref.$.Include,
      version: ref.$.Version,
    })) || []
  ) || [];

  return {
    name: pkg.AssemblyName?.[0] || path.basename(root),
    version: pkg.Version?.[0],
    description: pkg.Description?.[0],
    dependencies: deps,
    language: "csharp",
    ecosystem: "dotnet",
  };
}

/* ---------------------------------------------
   Java (pom.xml / build.gradle)
--------------------------------------------- */

export async function parsePom(root: string): Promise<ProjectMetadata | null> {
  const file = path.join(root, "pom.xml");
  if (!exists(file)) return null;

  const xml = await xml2js.parseStringPromise(read(file));
  const proj = xml.project;

  const deps: Dependency[] =
    proj.dependencies?.[0].dependency?.map((d: any) => ({
      name: d.groupId[0] + ":" + d.artifactId[0],
      version: d.version?.[0] || "latest",
    })) || [];

  return {
    name: proj.name?.[0] || path.basename(root),
    version: proj.version?.[0],
    description: proj.description?.[0],
    dependencies: deps,
    language: "java",
    ecosystem: "maven",
  };
}

export function parseGradle(root: string): ProjectMetadata | null {
  const file = path.join(root, "build.gradle");
  const kts = path.join(root, "build.gradle.kts");

  const gradleFile = exists(file) ? file : exists(kts) ? kts : null;
  if (!gradleFile) return null;

  const content = read(gradleFile);

  const name = content.match(/rootProject\.name\s*=\s*["'](.+?)["']/)?.[1];

  const deps = [...content.matchAll(/implementation ["'](.+?):(.+?):(.+?)["']/g)];

  const dependencies: Dependency[] = deps.map((m) => ({
    name: m[1] + ":" + m[2],
    version: m[3],
  }));

  return {
    name: name || path.basename(root),
    dependencies,
    language: "java",
    ecosystem: "gradle",
  };
}

/* ---------------------------------------------
   Swift (Package.swift)
--------------------------------------------- */

export function parseSwift(root: string): ProjectMetadata | null {
  const file = path.join(root, "Package.swift");
  if (!exists(file)) return null;

  const content = read(file);

  const name = content.match(/name:\s*["'](.+?)["']/)?.[1] || path.basename(root);

  const deps = [...content.matchAll(/package\(.*?from:\s*["'](.+?)["']/gs)];

  const dependencies: Dependency[] = deps.map((m) => ({
    name: "package",
    version: m[1],
  }));

  return {
    name,
    dependencies,
    language: "swift",
    ecosystem: "swiftpm",
  };
}

/* ---------------------------------------------
   MAIN DISPATCHER
--------------------------------------------- */

export async function detectProjectMetadata(root: string): Promise<ProjectMetadata> {
  const detectors = [
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
    parseCsproj, // async
  ];

  for (const detect of detectors) {
    const result = detect.length === 1
      ? detect(root) as ProjectMetadata
      : await detect(root);

    if (result) return result;
  }

  return {
    name: path.basename(root),
    dependencies: [],
    language: "unknown",
    ecosystem: "unknown",
  };
}
