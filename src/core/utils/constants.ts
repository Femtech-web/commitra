export const BASE_EXCLUDE_PATTERNS = [
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
  "*.min.css",
];

export const ROOT_MARKERS = [
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

export interface LibraryMeta {
  category:
  | "framework"
  | "frontend"
  | "backend"
  | "ui"
  | "database"
  | "orm"
  | "testing"
  | "devops"
  | "cloud"
  | "build"
  | "mobile"
  | "web3"
  | "ai"
  | "utils";
  label: string;
}

export const LIBRARY_MAP: Record<string, LibraryMeta> = {
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
    label: "HuggingFace Transformers",
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
  rxjs: { category: "utils", label: "RxJS" },
};


export const TECH_MAP = {
  frontend: [
    // Frameworks
    "react", "next", "next.js", "nuxt", "vue", "svelte", "sveltekit",
    "angular", "solid", "solidjs", "preact",

    // Languages
    "javascript", "typescript",

    // SPA / UI routing
    "astro",

    // CSS Frameworks (optional here)
    "vite"
  ],

  backend: [
    // JS/TS backend
    "node", "express", "fastify", "hapi", "nest", "nestjs",

    // Python backend
    "django", "flask", "fastapi",

    // Ruby
    "rails", "ruby on rails",

    // Go backend
    "gin", "echo", "fiber",

    // PHP backend
    "laravel", "symfony",

    // Java
    "spring", "springboot",

    // C#
    "dotnet", "asp.net", "aspnet",

    // Databases
    "postgres", "mysql", "sqlite", "mongodb", "redis"
  ],

  ui: [
    "radix", "headlessui", "headless ui", "tailwind",
    "chakra", "mantine", "shadcn", "bootstrap", "material ui",
    "mui", "framer motion"
  ],

  blockchain: [
    "ethers", "wagmi", "viem", "web3", "web3py", "alchemy", "infura",
    "hardhat", "foundry", "forge", "openzeppelin", "viem", "thirdweb",
    "solidity", "rust", "anchor", "arcid", "worldcoin", "chainlink", "supabase auth"
  ]
};
