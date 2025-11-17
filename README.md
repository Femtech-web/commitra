# commitra

Commitra is a command-line interface designed to enhance developer productivity by leveraging AI to generate context-rich commit messages, README files, and insightful project overviews. It analyzes the current repository state, extracts meaningful information from Git diffs, and uses advanced language models to produce concise, informative commit descriptions that align with the project’s conventions.

The tool is built with a modular architecture that separates concerns across distinct folders such as AI integration, configuration management, and output formatting. This design allows developers to extend or replace components—like swapping AI providers or adding new output formats—without affecting the core functionality. Commitra also offers a diagram generation feature that visualizes the project’s structure, making onboarding and documentation faster and more accurate.

By integrating with popular AI SDKs (Anthropic, Groq) and CLI libraries (Commander, Clack), Commitra provides a seamless experience for developers who want to maintain high-quality commit histories and documentation with minimal manual effort. Its lightweight footprint and TypeScript foundation ensure type safety and easy maintenance across diverse development environments.

## Tech Stack

### Frontend

- JavaScript/TypeScript

### Backend

- Node.js

### UI / Styling

_None_

### Blockchain / Web3

_None_

### Other

- CLI
- AI SDKs (Anthropic, Groq)
- Commander
- Clack Prompts
- Figlet
- Chalk
- Fuse.js
- Ini
- Toml

## Features

### AI-Powered Commit Message Generation

Analyzes staged changes and uses AI models to produce concise, context-aware commit messages that follow best practices and project conventions.

**Relevant Files:**

- `src/cli/commands/commit.ts`
- `src/core/ai/ai.ts`
- `src/core/git/diff.ts`
- `src/core/prompt/commit.ts`

### README Generation

Generates a comprehensive README file based on the repository’s metadata, dependencies, and detected architecture, ensuring up-to-date documentation.

**Relevant Files:**

- `src/cli/commands/readme.ts`
- `src/core/prompt/readme.ts`
- `src/core/output/markdown.ts`

### Project Diagram Creation

Creates a visual representation of the project structure, highlighting key modules and their relationships to aid onboarding and documentation.

**Relevant Files:**

- `src/cli/commands/diagram.ts`
- `src/core/prompt/diagram.ts`
- `src/core/output/diagram.ts`

### Hook Integration

Provides a hook command to integrate Commitra’s functionality into existing Git workflows or CI pipelines.

**Relevant Files:**

- `src/cli/commands/hook.ts`
- `src/core/git/repo.ts`

### Configuration Management

Allows users to customize behavior via a configuration file and environment variables, supporting schema validation and defaults.

**Relevant Files:**

- `src/core/config/manager.ts`
- `src/core/config/schema.ts`
- `src/cli/commands/config.ts`

### API Route Detection

Detects and lists API endpoints within the project, aiding developers in understanding exposed services and generating related documentation.

**Relevant Files:**

- `src/core/detect/apiRoutes.ts`
- `src/core/detect/detect.ts`
- `src/cli/commands/api.ts`

### Output Formatting

Supports multiple output formats (markdown, table, console logs) and includes utilities for logging and diagram rendering.

**Relevant Files:**

- `src/core/output/logger.ts`
- `src/core/output/markdown.ts`
- `src/core/output/diagram.ts`

## Dependencies

- **@anthropic-ai/sdk** — SDK for interacting with Anthropic’s AI models, used for generating commit messages and documentation. _(Category: ai)_
- **@clack/prompts** — Interactive prompt library for building CLI interfaces with user-friendly prompts. _(Category: ui)_
- **@iarna/toml** — Parser and stringifier for TOML files, used for configuration handling. _(Category: config)_
- **chalk** — Library for styling terminal string output, used for colored console logs and banners. _(Category: ui)_
- **cli-table3** — Utility for rendering tables in the terminal, used in API route listings and diagnostics. _(Category: ui)_
- **commander** — Command-line argument parsing library that powers the CLI command structure. _(Category: framework)_
- **figlet** — Creates ASCII art banners for the CLI startup screen. _(Category: ui)_
- **fuse.js** — Fuzzy search library used for quick lookup of commands or API endpoints. _(Category: utility)_
- **groq-sdk** — SDK for interacting with Groq’s AI models, providing an alternative AI provider. _(Category: ai)_
- **ini** — Parser for INI configuration files, used for reading legacy config formats. _(Category: config)_

## Project Structure

```text
├── .env
├── README-1.md
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

- **src/cli** — Entry point for the command-line interface, including the main index and banner rendering.
- **src/cli/commands** — Individual CLI command implementations such as commit, readme, diagram, and API route listing.
- **src/core/ai** — AI integration layer that abstracts provider-specific logic and defines types for AI interactions.
- **src/core/config** — Configuration management, including schema validation and environment variable handling.
- **src/core/context** — Contextual data aggregation used by various components to access repository state.
- **src/core/detect** — Detection utilities for classifying code, extracting metadata, and identifying API routes.
- **src/core/git** — Git-related helpers for reading diffs, repository information, and commit history.
- **src/core/output** — Output formatting utilities for diagrams, markdown, and console logging.
- **src/core/prompt** — Prompt templates for AI interactions, guiding the generation of commit messages, README content, and diagrams.
- **src/core/utils** — General-purpose utilities such as file system helpers, error handling, and constants.

## API Routes

### `/src/cli/commands/api`

        **Purpose:**
        CLI command that scans the project for API endpoints and displays them in a formatted table, aiding developers in quickly reviewing exposed routes.

        **Input:**
        None – operates on the current working directory.

        **Output:**
        A table listing detected API routes, their HTTP methods, and file locations.

        **File:**
        `src/cli/commands/api.ts`

        ---


        ### `/src/core/prompt/api`

        **Purpose:**
        Provides prompt templates for AI to generate documentation or explanations related to API routes.

        **Input:**
        Detected API route data.

        **Output:**
        Formatted prompt string used by the AI provider.

        **File:**
        `src/core/prompt/api.ts`

        ---

## Installation

1. Clone the repository: git clone https://github.com/your-org/commitra.git
2. Navigate into the project directory: cd commitra
3. Install dependencies: npm install
4. Create a .env file based on the provided example and set required API keys.

## Development

- Run the TypeScript compiler in watch mode: npx tsup src/index.ts --watch
- Execute the CLI locally: npx ts-node src/index.ts <command>
- Use the provided commands to test functionality (e.g., npx ts-node src/index.ts commit).

## Environment Variables

- Not provided

## Testing

- Not provided

## Deployment

- Not provided

## Smart Contracts

### `Not provided`

Not provided

## Libraries & Utilities

- Not provided

## Contributing

We welcome contributions from the community! To get started, fork the repository and create a feature branch. Run the tests (if any) and ensure your changes pass linting and type checks. Submit a pull request with a clear description of the feature or bug fix. For major changes, open an issue first to discuss the approach. All contributions must adhere to the project's coding style and include appropriate documentation. If you encounter any problems, feel free to open an issue or reach out via the repository’s discussion board.

---

Built with ❤️ by [Commitra](https://github.com/commitra)
