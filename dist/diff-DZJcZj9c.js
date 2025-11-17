import{createRequire as _pkgrollCR}from"node:module";const require=_pkgrollCR(import.meta.url);import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import ini from 'ini';
import require$$0 from 'openai';
import { AbortController as AbortController$1 } from 'node-abort-controller';
import { Groq } from 'groq-sdk';
import chalk from 'chalk';
import fs$1 from 'fs';
import { fileURLToPath } from 'url';
import { execSync, spawnSync } from 'child_process';

const CONFIG_PATH = path.join(os.homedir(), ".commitra");
const readConfigFile = async () => {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf8");
    return ini.parse(raw);
  } catch {
    return {};
  }
};
const getRuntimeConfig = async (cliConfig) => {
  const fileConfig = await readConfigFile();
  const env = process.env;
  const provider = cliConfig?.provider ?? fileConfig["provider"] ?? env.COMMITRA_PROVIDER ?? "groq";
  const model = cliConfig?.model ?? fileConfig["model"] ?? env.COMMITRA_MODEL;
  const cfg = {
    provider,
    model,
    openaiApiKey: cliConfig?.openaiApiKey ?? fileConfig["OPENAI_API_KEY"] ?? env.OPENAI_API_KEY,
    groqApiKey: cliConfig?.groqApiKey ?? fileConfig["GROQ_API_KEY"] ?? env.GROQ_API_KEY,
    anthropicApiKey: cliConfig?.anthropicApiKey ?? fileConfig["ANTHROPIC_API_KEY"] ?? env.ANTHROPIC_API_KEY,
    localModelUrl: cliConfig?.localModelUrl ?? fileConfig["LOCAL_MODEL_URL"] ?? env.LOCAL_MODEL_URL,
    timeout: cliConfig?.timeout ?? Number(fileConfig["timeout"] || env.COMMITRA_TIMEOUT || 1e4),
    proxy: cliConfig?.proxy ?? (env.https_proxy || env.HTTPS_PROXY || env.http_proxy || env.HTTP_PROXY) ?? void 0,
    generate: Number(fileConfig["generate"] ?? env.COMMITRA_GENERATE ?? 1)
  };
  return cfg;
};

function openaiClientFactory(apiKey, opts) {
  if (!apiKey) {
    throw new Error("OpenAI API key is required");
  }
  const { OpenAI } = require$$0;
  const client = new OpenAI({ apiKey });
  return {
    provider: "openai",
    async chat(messages, options = {}) {
      const controller = new AbortController$1();
      const timer = setTimeout(() => controller.abort(), opts?.timeout ?? 1e4);
      try {
        const messagesForApi = messages.map((m) => ({ role: m.role, content: m.content }));
        const completion = await client.chat.completions.create({
          model: opts?.model ?? options?.max_tokens ? "gpt-4o" : "gpt-4o",
          messages: messagesForApi,
          temperature: options?.temperature ?? 0.2,
          max_tokens: options?.max_tokens ?? Math.max(200, 12 * (options?.max_tokens ?? 150)),
          n: options?.n ?? 1,
          signal: controller.signal
        });
        const choices = (completion.choices || []).map((c) => ({
          message: {
            role: c.message.role,
            content: c.message.content
          },
          finish_reason: c.finish_reason ?? null
        }));
        return {
          id: completion.id,
          choices,
          usage: completion.usage
        };
      } finally {
        clearTimeout(timer);
      }
    }
  };
}

function groqClientFactory(apiKey, opts) {
  if (!apiKey) throw new Error("Groq API key is required");
  const client = new Groq({
    apiKey,
    timeout: opts?.timeout
  });
  return {
    provider: "groq",
    async chat(messages, options = {}) {
      try {
        const completion = await client.chat.completions.create({
          model: opts?.model || (options.type === "commit" ? "moonshotai/kimi-k2-instruct-0905" : "openai/gpt-oss-20b"),
          messages,
          temperature: options?.temperature ?? 0.3,
          top_p: 1,
          max_completion_tokens: options?.max_tokens ?? 400,
          n: options?.n ?? 1,
          stream: false
        });
        const choices = (completion.choices || []).map((c) => ({
          message: {
            role: c.message?.role ?? "assistant",
            content: sanitizeMessage(c.message?.content ?? "")
          },
          finish_reason: c.finish_reason ?? null
        })).filter((c) => c.message.content.length > 0);
        if (!choices.length) {
          console.warn(chalk.yellow("Groq returned an empty message \u2014 check your model or try smaller diffs."));
        }
        return {
          id: completion.id,
          choices,
          usage: completion.usage
        };
      } catch (error) {
        handleGroqError(error);
        throw error;
      }
    }
  };
}
function sanitizeMessage(msg) {
  return msg.trim().replace(/^["']|["']\.?$/g, "").replace(/[\n\r]/g, " ").replace(/(\w)\.$/, "$1");
}
function handleGroqError(error) {
  if (error instanceof Groq.APIError) {
    let message = chalk.red(`Groq API Error: ${error.status} - ${error.name}`);
    if (error.message) {
      message += chalk.gray(`
\u2192 ${error.message}`);
    }
    if (error.status === 413) {
      message += chalk.yellow(
        "\n\u{1F4A1} Your diff may be too large.\nTry committing smaller batches or reducing included files."
      );
    }
    if (error.status === 429) {
      message += chalk.yellow("\nRate limit exceeded \u2014 try again shortly.");
    }
    if (error.status >= 500) {
      message += chalk.yellow("\nGroq API might be temporarily down: https://console.groq.com/status");
    }
    console.error(message);
  } else if (error.code === "ENOTFOUND") {
    console.error(chalk.red(`Could not reach Groq API (${error.hostname}) \u2014 check your internet or proxy settings.`));
  } else {
    console.error(chalk.red(`Unexpected Groq error: ${error.message || String(error)}`));
  }
}

function anthropicClientFactory(apiKey, opts) {
  if (!apiKey) {
    throw new Error("Anthropic API key is required");
  }
  const Anthropic = (() => {
    try {
      return require("@anthropic-ai/sdk");
    } catch {
      return null;
    }
  })();
  return {
    provider: "anthropic",
    async chat(messages, options = {}) {
      const prompt = messages.map((m) => `[${m.role.toUpperCase()}] ${m.content}`).join("\n\n");
      if (Anthropic) {
        const client = new Anthropic.Anthropic({ apiKey });
        const resp = await client.completions.create({
          model: opts?.model ?? "claude-2.1",
          prompt,
          max_tokens_to_sample: options?.max_tokens ?? 500,
          temperature: options?.temperature ?? 0.2
        });
        const text = resp?.completion ?? "";
        return {
          choices: [{ message: { role: "assistant", content: text }, finish_reason: null }]
        };
      }
      const controller = new AbortController();
      const timeout = opts?.timeout ?? 1e4;
      const timer = setTimeout(() => controller.abort(), timeout);
      try {
        const res = await fetch("https://api.anthropic.com/v1/complete", {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: opts?.model ?? "claude-2.1",
            prompt,
            max_tokens_to_sample: options?.max_tokens ?? 500,
            temperature: options?.temperature ?? 0.2
          })
        });
        if (!res.ok) {
          throw new Error(`Anthropic request failed: ${res.status} ${res.statusText}`);
        }
        const body = await res.json();
        return {
          choices: [{ message: { role: "assistant", content: body.completion ?? "" }, finish_reason: null }]
        };
      } finally {
        clearTimeout(timer);
      }
    }
  };
}

function localClientFactory(localModelUrl, opts) {
  if (!localModelUrl) {
    throw new Error("localModelUrl is required for local provider");
  }
  const base = localModelUrl.replace(/\/$/, "");
  return {
    provider: "local",
    async chat(messages, options = {}) {
      const controller = new AbortController$1();
      const timeout = opts?.timeout ?? 1e4;
      const timer = setTimeout(() => controller.abort(), timeout);
      try {
        const res = await fetch(`${base}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages,
            max_tokens: options?.max_tokens ?? 500,
            temperature: options?.temperature ?? 0.2,
            n: options?.n ?? 1
          }),
          signal: controller.signal
        });
        if (!res.ok) {
          throw new Error(`Local model request failed: ${res.status} ${res.statusText}`);
        }
        const json = await res.json();
        return json;
      } finally {
        clearTimeout(timer);
      }
    }
  };
}

const createAIClient = (cfg) => {
  const opts = { timeout: cfg.timeout, proxy: cfg.proxy, model: cfg.model };
  switch (cfg.provider) {
    case "openai":
      if (!cfg.openaiApiKey) throw new Error("OpenAI API key missing for provider openai");
      return openaiClientFactory(cfg.openaiApiKey, opts);
    case "groq":
      if (!cfg.groqApiKey) throw new Error("Groq API key missing for provider groq");
      return groqClientFactory(cfg.groqApiKey, opts);
    case "anthropic":
      if (!cfg.anthropicApiKey) throw new Error("Anthropic API key missing for provider anthropic");
      return anthropicClientFactory(cfg.anthropicApiKey, opts);
    case "local":
      if (!cfg.localModelUrl) throw new Error("Local provider requires LOCAL_MODEL_URL in config");
      return localClientFactory(cfg.localModelUrl, opts);
    default:
      throw new Error(`Unsupported provider: ${String(cfg.provider)}`);
  }
};

function truncate(text, maxLength = 1500) {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}
function loadPackageJson() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const searchPaths = [
    // inside dist 
    path.resolve(__dirname, "../../package.json"),
    // inside src
    path.resolve(__dirname, "../package.json"),
    // globally or in node_modules
    path.resolve(process.cwd(), "package.json"),
    // Fallback to nearest upward search
    path.resolve(__dirname, "../../../package.json")
  ];
  for (const p of searchPaths) {
    if (fs$1.existsSync(p)) {
      try {
        return JSON.parse(fs$1.readFileSync(p, "utf8"));
      } catch (e) {
      }
    }
  }
  return { version: "1.0.0" };
}

const buildCommitPrompt = ({
  diff,
  branch,
  lastCommits,
  techStack,
  locale = "en",
  maxLength = 100
}) => {
  const prev = lastCommits.slice(0, 3).join("\n- ");
  const shortDiff = truncate(diff, 6e3);
  return `
  You are Commitra, a professional AI trained to write conventional git commit messages.

  ## GOAL
  Generate ONE professional, conventional commit message that accurately describes the staged changes.

  ## CONTEXT
  Branch: ${branch}
  Tech stack: ${techStack}
  Language: ${locale}

  Previous commits:
  - ${prev}

  Code changes:
  \`\`\`diff
  ${shortDiff}
  \`\`\`

  ## CRITICAL RULES
  - Return ONLY the commit message (no explanations).
  - Format: \`type: subject\` (NO scope, no extra words).
  - Maximum ${maxLength} characters.
  - Use imperative mood (e.g., "add", "fix", "update", not "added" or "fixed").
  - Be clear and specific \u2014 describe what changed and why.
  - Always include affected component/module if relevant.
  - Avoid redundancy with previous commits.

  ## COMMIT TYPES
  - feat: New user-facing feature
  - fix: Bug fix
  - refactor: Code restructuring or improvement
  - docs: Documentation only
  - chore: Maintenance or dependency updates
  - test: Test updates
  - perf: Performance improvement
  - build: Build system or dependency changes
  - ci: CI/CD pipeline changes
  - revert: Revert previous commit

  ## GOOD EXAMPLES
  - feat: add OAuth-based user login flow
  - fix: resolve race condition in session validation
  - refactor: simplify API handler middleware
  - docs: update API usage examples in README
  - chore: bump axios to v1.7.0 for security patch

  ## BAD EXAMPLES
  - feat(auth): add login (no scopes allowed)
  - updated files
  - minor fixes

  ## OUTPUT
  Return only the final commit message line, no markdown, no extra context.
    `;
};

const BASE_EXCLUDE_PATTERNS = [
  // JavaScript / TypeScript
  "node_modules",
  ".next",
  "dist",
  "build",
  ".turbo",
  ".expo",
  "bun.lockb",
  "pnpm-lock.yaml",
  "yarn.lock",
  "package-lock.json",
  // Python
  "__pycache__",
  "*.pyc",
  "*.pyo",
  ".pytest_cache",
  ".mypy_cache",
  "env",
  "venv",
  ".venv",
  // Go
  "bin",
  "pkg",
  "*.test",
  "go.sum",
  // Rust
  "target",
  "Cargo.lock",
  // Java
  "out",
  "build",
  "target",
  "*.class",
  "*.jar",
  "*.war",
  "*.ear",
  // C / C++
  "a.out",
  "*.o",
  "*.so",
  "cmake-build-*",
  "CMakeFiles",
  "Makefile",
  // PHP
  "vendor",
  // Ruby
  "Gemfile.lock",
  ".bundle",
  // Swift
  ".swiftpm",
  ".build",
  // Docker & infra
  ".docker",
  ".cache",
  ".terraform",
  "terraform.tfstate*",
  // Misc
  ".git",
  ".gitignore",
  ".vercel",
  ".netlify",
  ".DS_Store",
  "Thumbs.db",
  "coverage",
  "logs",
  "*.log",
  "*.tmp",
  "*.min.js",
  "*.min.css"
];
const ROOT_MARKERS = [
  // JS / TS / Node / Deno
  "package.json",
  "tsconfig.json",
  "jsconfig.json",
  "deno.json",
  "deno.jsonc",
  // Python
  "pyproject.toml",
  "requirements.txt",
  "requirements.in",
  "Pipfile",
  "setup.py",
  // Go
  "go.mod",
  "go.sum",
  // Rust
  "Cargo.toml",
  "Cargo.lock",
  // PHP
  "composer.json",
  // Java
  "pom.xml",
  "build.gradle",
  "build.gradle.kts",
  // .NET / C#
  "*.csproj",
  "*.sln",
  // Swift
  "Package.swift",
  // Docker / infra
  "Dockerfile",
  "docker-compose.yml",
  "docker-compose.yaml",
  "docker-compose.override.yml",
  "compose.yml",
  "compose.yaml",
  "Makefile",
  // Env files
  ".env",
  ".env.local",
  ".env.development",
  ".env.production",
  ".env.example",
  // Prettier configs
  ".prettierrc",
  ".prettierrc.json",
  ".prettierrc.yml",
  ".prettierrc.yaml",
  "prettier.config.js",
  "prettier.config.cjs",
  ".prettierrc.js",
  ".prettierrc.cjs",
  // VSCode settings folder
  ".vscode",
  // Git root
  ".git"
];
const LIBRARY_MAP = {
  /* ---------------------------------------------
   * JavaScript / TypeScript — Frontend Frameworks
   * --------------------------------------------- */
  react: { category: "frontend", label: "React" },
  "react-dom": { category: "frontend", label: "React DOM" },
  vue: { category: "frontend", label: "Vue.js" },
  "vue-router": { category: "frontend", label: "Vue Router" },
  svelte: { category: "frontend", label: "Svelte" },
  solidjs: { category: "frontend", label: "SolidJS" },
  preact: { category: "frontend", label: "Preact" },
  next: { category: "framework", label: "Next.js" },
  nuxt: { category: "framework", label: "Nuxt.js" },
  remix: { category: "framework", label: "Remix" },
  astro: { category: "framework", label: "Astro" },
  qwik: { category: "frontend", label: "Qwik" },
  /* ---------------------------------------------
   * UI Libraries
   * --------------------------------------------- */
  tailwindcss: { category: "ui", label: "Tailwind CSS" },
  "@mui/material": { category: "ui", label: "MUI" },
  "@chakra-ui/react": { category: "ui", label: "Chakra UI" },
  "styled-components": { category: "ui", label: "Styled Components" },
  antd: { category: "ui", label: "Ant Design" },
  bootstrap: { category: "ui", label: "Bootstrap" },
  "@radix-ui/react": { category: "ui", label: "Radix UI" },
  "@shadcn/ui": { category: "ui", label: "Shadcn UI" },
  "framer-motion": { category: "ui", label: "Framer Motion" },
  /* ---------------------------------------------
   * Backend Frameworks
   * --------------------------------------------- */
  express: { category: "backend", label: "Express" },
  fastify: { category: "backend", label: "Fastify" },
  koa: { category: "backend", label: "Koa" },
  hapi: { category: "backend", label: "Hapi" },
  "@nestjs/core": { category: "backend", label: "NestJS" },
  feathersjs: { category: "backend", label: "FeathersJS" },
  adonisjs: { category: "backend", label: "AdonisJS" },
  /* ---------------------------------------------
   * Databases / ORMs
   * --------------------------------------------- */
  prisma: { category: "orm", label: "Prisma ORM" },
  mongoose: { category: "database", label: "Mongoose (MongoDB)" },
  typeorm: { category: "orm", label: "TypeORM" },
  sequelize: { category: "orm", label: "Sequelize" },
  knex: { category: "database", label: "Knex" },
  drizzle: { category: "orm", label: "Drizzle ORM" },
  pg: { category: "database", label: "PostgreSQL" },
  mysql: { category: "database", label: "MySQL" },
  redis: { category: "database", label: "Redis" },
  sqlite3: { category: "database", label: "SQLite" },
  "@vercel/postgres": { category: "database", label: "Vercel Postgres" },
  /* ---------------------------------------------
   * Testing — JS
   * --------------------------------------------- */
  jest: { category: "testing", label: "Jest" },
  vitest: { category: "testing", label: "Vitest" },
  mocha: { category: "testing", label: "Mocha" },
  chai: { category: "testing", label: "Chai" },
  sinon: { category: "testing", label: "Sinon" },
  cypress: { category: "testing", label: "Cypress" },
  playwright: { category: "testing", label: "Playwright" },
  jasmine: { category: "testing", label: "Jasmine" },
  /* ---------------------------------------------
   * Build Systems / Tooling
   * --------------------------------------------- */
  webpack: { category: "build", label: "Webpack" },
  vite: { category: "build", label: "Vite" },
  rollup: { category: "build", label: "Rollup" },
  esbuild: { category: "build", label: "esbuild" },
  turbo: { category: "build", label: "Turborepo" },
  nx: { category: "build", label: "Nx Monorepo" },
  /* ---------------------------------------------
   * DevOps / CI/CD
   * --------------------------------------------- */
  docker: { category: "devops", label: "Docker" },
  "docker-compose": { category: "devops", label: "Docker Compose" },
  husky: { category: "devops", label: "Husky" },
  "lint-staged": { category: "devops", label: "Lint-Staged" },
  eslint: { category: "devops", label: "ESLint" },
  prettier: { category: "devops", label: "Prettier" },
  commitlint: { category: "devops", label: "Commitlint" },
  pm2: { category: "devops", label: "PM2" },
  /* ---------------------------------------------
   * Cloud SDKs
   * --------------------------------------------- */
  "aws-sdk": { category: "cloud", label: "AWS SDK" },
  "@aws-sdk/client-s3": { category: "cloud", label: "AWS S3" },
  firebase: { category: "cloud", label: "Firebase" },
  supabase: { category: "cloud", label: "Supabase" },
  vercel: { category: "cloud", label: "Vercel Deployment" },
  netlify: { category: "cloud", label: "Netlify" },
  /* ---------------------------------------------
   * Mobile Frameworks
   * --------------------------------------------- */
  "react-native": { category: "mobile", label: "React Native" },
  expo: { category: "mobile", label: "Expo" },
  nativescript: { category: "mobile", label: "NativeScript" },
  capacitor: { category: "mobile", label: "Capacitor" },
  cordova: { category: "mobile", label: "Cordova" },
  /* ---------------------------------------------
   * Web3 / Blockchain
   * --------------------------------------------- */
  ethers: { category: "web3", label: "Ethers.js" },
  viem: { category: "web3", label: "Viem" },
  wagmi: { category: "web3", label: "Wagmi" },
  "web3.js": { category: "web3", label: "Web3.js" },
  hardhat: { category: "web3", label: "Hardhat" },
  truffle: { category: "web3", label: "Truffle" },
  foundry: { category: "web3", label: "Foundry" },
  anchor: { category: "web3", label: "Solana Anchor" },
  /* ---------------------------------------------
   * AI / ML / LLM
   * --------------------------------------------- */
  openai: { category: "ai", label: "OpenAI SDK" },
  "@anthropic-ai/sdk": { category: "ai", label: "Anthropic SDK" },
  groq: { category: "ai", label: "Groq SDK" },
  "langchain": { category: "ai", label: "LangChain" },
  "@huggingface/transformers": {
    category: "ai",
    label: "HuggingFace Transformers"
  },
  pinecone: { category: "ai", label: "Pinecone Vector DB" },
  weaviate: { category: "ai", label: "Weaviate" },
  /* ---------------------------------------------
   * Utilities & Tooling
   * --------------------------------------------- */
  lodash: { category: "utils", label: "Lodash" },
  dayjs: { category: "utils", label: "Day.js" },
  moment: { category: "utils", label: "Moment.js" },
  axios: { category: "utils", label: "Axios" },
  zod: { category: "utils", label: "Zod Validator" },
  yup: { category: "utils", label: "Yup Validator" },
  rxjs: { category: "utils", label: "RxJS" }
};
const TECH_MAP = {
  frontend: [
    // Frameworks
    "react",
    "next",
    "next.js",
    "nuxt",
    "vue",
    "svelte",
    "sveltekit",
    "angular",
    "solid",
    "solidjs",
    "preact",
    // Languages
    "javascript",
    "typescript",
    // SPA / UI routing
    "astro",
    // CSS Frameworks (optional here)
    "vite"
  ],
  backend: [
    // JS/TS backend
    "node",
    "express",
    "fastify",
    "hapi",
    "nest",
    "nestjs",
    // Python backend
    "django",
    "flask",
    "fastapi",
    // Ruby
    "rails",
    "ruby on rails",
    // Go backend
    "gin",
    "echo",
    "fiber",
    // PHP backend
    "laravel",
    "symfony",
    // Java
    "spring",
    "springboot",
    // C#
    "dotnet",
    "asp.net",
    "aspnet",
    // Databases
    "postgres",
    "mysql",
    "sqlite",
    "mongodb",
    "redis"
  ],
  ui: [
    "radix",
    "headlessui",
    "headless ui",
    "tailwind",
    "chakra",
    "mantine",
    "shadcn",
    "bootstrap",
    "material ui",
    "mui",
    "framer motion"
  ],
  blockchain: [
    "ethers",
    "wagmi",
    "viem",
    "web3",
    "web3py",
    "alchemy",
    "infura",
    "hardhat",
    "foundry",
    "forge",
    "openzeppelin",
    "viem",
    "thirdweb",
    "solidity",
    "rust",
    "anchor",
    "arcid",
    "worldcoin",
    "chainlink",
    "supabase auth"
  ]
};

const excludeArgs = BASE_EXCLUDE_PATTERNS.map((p) => `:(exclude)${p}`);
const getStagedFiles = () => {
  const args = [
    "diff",
    "--cached",
    "--name-only",
    "--diff-algorithm=minimal",
    ...excludeArgs
  ];
  const { stdout } = spawnSync("git", args, { encoding: "utf8" });
  if (!stdout) return [];
  return stdout.split("\n").filter(Boolean);
};
const getDiffSummary = () => {
  try {
    const args = [
      "diff",
      "--cached",
      "--numstat",
      "--diff-algorithm=minimal",
      ...excludeArgs
    ];
    const { stdout } = spawnSync("git", args, { encoding: "utf8" });
    if (!stdout) return "";
    const stats = stdout.split("\n").filter(Boolean).map((line) => {
      const [add, del, file] = line.split("	");
      return {
        file,
        additions: Number(add) || 0,
        deletions: Number(del) || 0,
        total: (Number(add) || 0) + (Number(del) || 0)
      };
    });
    const totalFiles = stats.length;
    const totalAdditions = stats.reduce((s, f) => s + f.additions, 0);
    const totalDeletions = stats.reduce((s, f) => s + f.deletions, 0);
    const totalChanges = stats.reduce((s, f) => s + f.total, 0);
    const top = stats.sort((a, b) => b.total - a.total).slice(0, 10);
    const lines = [
      `Files changed: ${totalFiles}`,
      `Additions: ${totalAdditions}, Deletions: ${totalDeletions}, Total changes: ${totalChanges}`,
      "",
      "Top modified files:",
      ...top.map(
        (f) => `- ${f.file} (+${f.additions}/-${f.deletions}, ${f.total} changes)`
      )
    ];
    return lines.join("\n");
  } catch (err) {
    console.error("Error in getDiffSummary:", err);
    return "";
  }
};
const buildDiffSnippets = (files, perFileMaxLines = 25, totalMaxChars = 4e3) => {
  try {
    const targetFiles = files.slice(0, 5);
    const parts = [];
    let remaining = totalMaxChars;
    for (const f of targetFiles) {
      const stdout = execSync(`git diff --cached --unified=0 -- "${f}"`, { encoding: "utf8" });
      if (!stdout) continue;
      const lines = stdout.split("\n").filter(Boolean);
      const picked = [];
      let count = 0;
      for (const line of lines) {
        const isHunk = line.startsWith("@@");
        const isChange = (line.startsWith("+") || line.startsWith("-")) && !line.startsWith("+++") && !line.startsWith("---");
        if (isHunk || isChange) {
          picked.push(line);
          count++;
          if (count >= perFileMaxLines) break;
        }
      }
      if (picked.length > 0) {
        const block = [`# ${f}`, ...picked].join("\n");
        if (block.length <= remaining) {
          parts.push(block);
          remaining -= block.length;
        } else {
          parts.push(block.slice(0, remaining));
          remaining = 0;
        }
      }
      if (remaining <= 0) break;
    }
    if (parts.length === 0) return "";
    return ["Context snippets (truncated):", ...parts].join("\n");
  } catch {
    return "";
  }
};
const buildEnhancedDiffContext = () => {
  const files = getStagedFiles();
  const summary = getDiffSummary();
  const snippets = buildDiffSnippets(files);
  let final = "";
  if (summary) final += `CHANGES SUMMARY:
${summary}

`;
  if (snippets) final += `CODE CONTEXT:
${snippets}

`;
  if (!final.trim()) {
    const fallback = execSync("git diff --cached --unified=3", { encoding: "utf8" });
    final = `FULL DIFF (fallback):
${fallback}`;
  }
  return final.trim();
};

export { BASE_EXCLUDE_PATTERNS as B, LIBRARY_MAP as L, ROOT_MARKERS as R, TECH_MAP as T, buildCommitPrompt as a, buildEnhancedDiffContext as b, createAIClient as c, getRuntimeConfig as g, loadPackageJson as l };
