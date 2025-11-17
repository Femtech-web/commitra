# commitra

commitra is an AI‑assisted developer intelligence CLI that helps developers create context‑rich commit messages, READMEs, and gain insights into their projects such as tech stack, architecture, and flow. By leveraging large language models and a suite of utility libraries, it analyzes the current repository, extracts meaningful metadata, and generates polished documentation and commit summaries automatically.

The tool is built with modern JavaScript/TypeScript and follows a modular architecture. It exposes a set of command‑line commands under the “cli” namespace, each responsible for a specific task: generating commit messages, creating READMEs, producing architectural diagrams, and configuring the tool. Internally, it uses a detection layer to classify the repository’s characteristics, a prompt layer to interact with AI providers, and an output layer to format the results in markdown, tables, or console logs.

commitra aims to reduce the cognitive load on developers by automating repetitive documentation tasks while still allowing fine‑grained control through configuration files and prompts. Its design prioritizes extensibility, enabling developers to plug in new AI providers, add custom extraction logic, or integrate with other tooling ecosystems.

## Tech Stack

### Frontend

- JavaScript
- TypeScript

  ### Backend
  - Node.js

  ### UI / Styling

  _None_

  ### Blockchain / Web3

  _None_

  ### Other

  _None_

## Features

### Commit Message Generator

Analyzes the current Git diff, extracts relevant changes, and uses an AI provider to generate a concise, context‑rich commit message that follows best practices. The command is implemented in “src/cli/commands/commit.ts” and relies on the Git diff utilities and AI prompt modules.

**Relevant Files:**

- `src/cli/commands/commit.ts`
- `src/core/git/diff.ts`
- `src/core/prompt/commit.ts`

### README Generator

Creates a comprehensive README file by inspecting the repository structure, extracting metadata, and prompting an AI model to produce natural language documentation. The command lives in “src/cli/commands/readme.ts” and uses the output markdown utilities.

**Relevant Files:**

- `src/cli/commands/readme.ts`
- `src/core/prompt/readme.ts`
- `src/core/output/markdown.ts`

### Project Diagram

Generates a visual representation of the project architecture using AI to interpret code structure and dependencies. The diagram command is defined in “src/cli/commands/diagram.ts” and outputs a markdown table via the diagram output module.

**Relevant Files:**

- `src/cli/commands/diagram.ts`
- `src/core/prompt/diagram.ts`
- `src/core/output/diagram.ts`

### Configuration Management

Provides commands to view, edit, and validate the tool’s configuration, which is stored in a TOML file. The configuration manager handles schema validation and persistence.

**Relevant Files:**

- `src/cli/commands/config.ts`
- `src/core/config/manager.ts`
- `src/core/config/schema.ts`

### AI Prompting Layer

Abstracts interactions with AI providers such as Anthropic and Groq, allowing the CLI to send prompts and receive responses. The provider modules are located under “src/core/ai/providers”.

**Relevant Files:**

- `src/core/ai/ai.ts`
- `src/core/ai/types.ts`

### Detection Layer

Detects repository characteristics (e.g., language, framework, presence of tests) using classifiers and extractors. This information feeds into prompts and output formatting.

**Relevant Files:**

- `src/core/detect/detect.ts`
- `src/core/detect/aiClassifier.ts`
- `src/core/detect/localClassifier.ts`
- `src/core/detect/extractors.ts`
- `src/core/detect/projectMetadata.ts`
- `src/core/detect/apiRoutes.ts`

## Dependencies

- **@anthropic-ai/sdk** — SDK for interacting with Anthropic’s Claude language models, used to generate AI responses. _(Category: ai)_
- **@clack/prompts** — CLI prompt library for interactive user input and confirmations. _(Category: cli)_
- **@iarna/toml** — TOML parser and stringifier for reading and writing configuration files. _(Category: config)_
- **chalk** — Terminal string styling for colored console output. _(Category: cli)_
- **cli-table3** — Utility to render data in table format in the terminal. _(Category: cli)_
- **commander** — Command‑line interface framework for defining commands and options. _(Category: cli)_
- **figlet** — ASCII art generator used for the CLI banner. _(Category: cli)_
- **fuse.js** — Lightweight fuzzy-search library, potentially used for searching within project metadata. _(Category: utility)_
- **groq-sdk** — SDK for interacting with Groq’s language models, providing an alternative AI provider. _(Category: ai)_
- **ini** — Parser for INI files, used for legacy or supplementary configuration handling. _(Category: config)_

## Project Structure

```text
├── .env
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
│   ├── index.ts
├── tsconfig.json
├── tsup.config.ts
```

## Core Folders

- **src/cli** — Entry point for the command‑line interface, including the banner and command registration.
- **src/core/ai** — AI abstraction layer that manages provider selection, prompt construction, and response handling.
- **src/core/config** — Configuration management, including schema validation and persistence of user settings.
- **src/core/context** — Contextual data aggregation used by prompts and output modules.
- **src/core/detect** — Repository detection utilities that classify language, framework, and extract metadata.
- **src/core/git** — Git integration for diffing, repository information, and commit history.
- **src/core/output** — Formatting utilities for diagrams, markdown, tables, and logging.
- **src/core/prompt** — Prompt templates for different command types (commit, readme, diagram).
- **src/core/utils** — General helper functions, constants, error handling, and file system utilities.

## API Routes

### `/src/cli/commands/api.ts`

        **Purpose:**
        Handles API‑related CLI commands, potentially exposing endpoints for external tooling or integration.

        **Input:**
        Command line arguments specifying API actions.

        **Output:**
        Console output or file generation based on the API command.

        **File:**
        `src/cli/commands/api.ts`

        ---


        ### `/src/core/prompt/api.ts`

        **Purpose:**
        Provides AI prompt templates and utilities for API interactions within the tool.

        **Input:**
        Prompt data and parameters.

        **Output:**
        Formatted prompt string ready for the AI provider.

        **File:**
        `src/core/prompt/api.ts`

        ---

## Installation

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Ensure Node.js v20 or newer is installed.

## Development

- Run `npm run dev` to start the CLI in development mode.
- Use `npm run build` to compile TypeScript and bundle with tsup.
- Commands can be tested by executing `node dist/index.js <command>` after building.

## Environment Variables

- Not provided

## Testing

- Not provided

## Deployment

- Not provided

## Smart Contracts

### `undefined`

undefined

## Libraries & Utilities

- undefined

## Contributing

We welcome contributions! To get started, fork the repository, create a feature branch, and submit a pull request. Please run the test suite (if available) and ensure all linting rules pass. For major changes, open an issue first to discuss the approach. All contributions must adhere to the code style guidelines and include appropriate documentation. If you encounter any bugs or have feature requests, feel free to open an issue on GitHub. Thank you for helping improve commitra!

---

Built with ❤️ by [Commitra](https://github.com/commitra)
