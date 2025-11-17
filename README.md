# **Commitra**

### ⚡ _The Intelligent Commit & Project AI CLI_

[![npm version](https://img.shields.io/npm/v/commitra.svg)](https://www.npmjs.com/package/commitra)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub Repo](https://img.shields.io/github/stars/<YOUR_GITHUB>/commitra?style=social)](https://github.com/Femtech-web/commitra)

---

## 🎥 Demo

[![Commitra Demo](https://img.youtube.com/vi/mizHUayTtgo/0.jpg)](https://youtu.be/mizHUayTtgo)

---

## Start in 3 Simple Steps

### **Get a Groq API Key (default provider)**

Groq is the default AI engine for Commitra — fast and free to start.

👉 Get your API key here:  
**https://console.groq.com/keys**

---

### **Save it to Commitra config**

```bash
commitra config set GROQ_API_KEY=your_key_here
```

(Optional) Set provider explicitly:

```bash
commitra config set provider=groq
```

---

### **Generate your first AI commit**

```bash
commitra commit
```

Or generate multiple:

```bash
commitra commit -g 3
```

---

## Also: Use Commitra _inside_ normal Git commits

Once you install Commitra’s Git hook, your commit workflow becomes:

```bash
git add .
git commit
```

Commitra will automatically:

- Analyze your staged files
- Generate an AI-powered commit message
- Insert it into your editor  
  Perfect if you never want to run `commitra commit` manually again.

### Install the hook:

```bash
commitra hook install
```

### Remove the hook:

```bash
commitra hook uninstall
```

---

## **Features**

- **AI-generated commit messages**
- **Automatic API documentation**
- **Folder tree visualization**
- **Architecture Mermaid diagrams**
- **README generator**
- **Config system with providers (OpenAI, Groq, Anthropic, Local)**
- **Git hook integration**
- Minimal, clean output — no noise

---

# 📦 Installation

```bash
npm install -g commitra
```

Supports:

- macOS
- Linux
- Windows
- (Homebrew formula coming soon)

---

## 🧰 Commands Overview

### 1. `commit`

Generate an AI-powered commit message from staged git changes.

```bash
commitra commit
```

Options:

```
--suggest-only       Print suggestion without committing
-g, --generate <n>   Generate N suggestions
```

---

### 2. `api`

Generate API documentation from your project structure + code.

```bash
commitra api
```

Options:

```
-o, --output FILE     Output file (default: API_DOCS.md)
-b, --base-url URL    Optional API base URL
```

---

### 3. `diagram`

Generate clean architecture diagrams (Mermaid).

```bash
commitra diagram
```

Options:

```
-s, --summarize         Add AI architecture summary
-o, --output FILE        Save output (default: FLOW.md)
-d, --depth N            Folder depth scan
-t, --type flow|sequence|system
-b, --base-url URL
```

---

### 4. `readme`

Generate a signature-style README.md.

```bash
commitra readme
```

---

### 5. `folder`

Generate a project folder tree.

```bash
commitra folder
```

Options:

```
-d, --depth N          Depth (default 3)
-o, --output FILE      Output file (default: PROJECT_FOLDER.md)
```

---

### 6. `config`

Manage Commitra configuration.

#### Get:

```bash
commitra config get provider
```

#### Set:

```bash
commitra config set provider=openai OPENAI_API_KEY=sk-123
```

---

### 7. `hook`

Manage Git hook integration.

Install:

```bash
commitra hook install
```

Uninstall:

```bash
commitra hook uninstall
```

---

## Configuration System

Commitra loads configuration from:

1. CLI flags
2. `~/.commitra` config file
3. Environment variables
4. Defaults (Groq)

### Example `~/.commitra`

```
provider=groq
GROQ_API_KEY=your_key_here
model=llama-3-8b
```

Supported providers:

```
groq (default)
openai
anthropic
local
```

---

## **Environment Variables**

> set them using **commitra config set key=value**.

| Variable            | Meaning                                          |
| ------------------- | ------------------------------------------------ |
| `OPENAI_API_KEY`    | OpenAI auth                                      |
| `GROQ_API_KEY`      | Groq auth                                        |
| `ANTHROPIC_API_KEY` | Anthropic auth                                   |
| `model`             | LLM provider model                               |
| `provider`          | Override/set LLM provider                        |
| `generate`          | Suggestions commit count to generate (default 1) |
| `timeout`           | Request timeout                                  |

---

## How Commitra Works (Minimal Explanation)

Commitra processes:

- Git staged changes (numstat + diff)
- File structure
- Code snippets (truncated)
- Commit history
- Environment metadata

Then feeds compact prompts to your AI provider to generate:

- Clean commit messages
- Diagrams
- Documentation
- README templates
- API summaries

Everything is processed **locally first**, so only optimized summaries go to the model.

---

## Project Structure

```text
├── .env
├── LICENSE
├── README.md
├── package.json
├── src
│   ├── cli
│   │   ├── banner.ts
│   │   ├── commands
│   │   │   ├── api.ts
│   │   │   ├── commit.ts
│   │   │   ├── config.ts
│   │   │   ├── diagram.ts
│   │   │   ├── hook.ts
│   │   │   ├── prepare-commit-msg.ts
│   │   │   ├── project-folder.ts
│   │   │   ├── readme.ts
│   │   ├── index.ts
│   ├── core
│   │   ├── ai
│   │   │   ├── ai.ts
│   │   │   ├── providers
│   │   │   ├── types.ts
│   │   ├── config
│   │   │   ├── manager.ts
│   │   │   ├── schema.ts
│   │   ├── context
│   │   │   ├── index.ts
│   │   ├── detect
│   │   │   ├── aiClassifier.ts
│   │   │   ├── apiRoutes.ts
│   │   │   ├── detect.ts
│   │   │   ├── extractors.ts
│   │   │   ├── localClassifier.ts
│   │   │   ├── projectMetadata.ts
│   │   ├── git
│   │   │   ├── diff.ts
│   │   │   ├── repo.ts
│   │   ├── output
│   │   │   ├── diagram.ts
│   │   │   ├── logger.ts
│   │   │   ├── markdown.ts
│   │   ├── prompt
│   │   │   ├── api.ts
│   │   │   ├── commit.ts
│   │   │   ├── diagram.ts
│   │   │   ├── readme.ts
│   │   ├── utils
│   │   │   ├── constants.ts
│   │   │   ├── error.ts
│   │   │   ├── fs.ts
│   │   │   ├── helpers.ts
│   ├── hook-entry.ts
│   ├── index.ts
├── tests
│   ├── mocks
│   │   ├── mockAI.ts
│   │   ├── mockFs.ts
│   │   ├── mockGit.ts
│   ├── setup.ts
│   ├── unit
│   │   ├── commitPrompt.spec.ts
│   │   ├── config.spec.ts
│   │   ├── diff.spec.ts
│   │   ├── helpers.spec.ts
│   │   ├── projectMetadata.spec.ts
│   ├── utils
│   │   ├── findDistDiff.ts
│   │   ├── fixtureBatch.ts
│   │   ├── mockDistAI.ts
│   │   ├── runCli.ts
│   │   ├── testRepo.ts
├── tsconfig.json
├── vitest-env.d.ts
├── vitest.config.ts
```

---

## Development

```bash
git clone https://github.com/Femtech-web/commitra
cd commitra
npm install
```

Run dev mode:

```bash
npm run dev commit
```

Build:

```bash
npm run build
```

Global link:

```bash
npm link
commitra commit
```

---

## 🤝 Contributing

PRs welcome.  
If you love clean DX tools, come build with us.

---

## 📄 License

**MIT License** — see [LICENSE](LICENSE) file for details.

---

## ⭐ Support

If you find Commitra useful, give it a star on GitHub ❤️  
Opening issues, PRs, or feature requests is encouraged.
