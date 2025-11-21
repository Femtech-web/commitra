# app

The project is a modern, server-rendered web application built with Next.js and React, leveraging TypeScript for type safety and a rich set of UI primitives from Radix UI and Headless UI. The application serves as a dynamic landing page, featuring interactive sections such as a hero banner, feature grid, terminal demo, and a final call-to-action. It also includes visual effects like a particle cloud and smooth scrolling, enhancing the user experience.

The codebase is organized into distinct folders that separate concerns: reusable components, page sections, custom hooks, utility functions, and visual editing tools. This modular structure promotes maintainability and scalability, allowing developers to add new sections or replace existing ones without affecting unrelated parts of the application. The use of a .env file and a comprehensive set of dependencies indicates readiness for deployment in various environments.

Overall, the application showcases a blend of modern frontend practices, including component-driven architecture, responsive design, and accessibility-focused UI components. It is primed for further expansion, such as integrating backend APIs, adding authentication, or extending the visual editing capabilities.

## Tech Stack

### Frontend

- JavaScript/TypeScript
- Next.js
- React

  ### Backend

  _None_

  ### UI / Styling

  _None_

  ### Blockchain / Web3

  _None_

  ### Other

  _None_

## Features

### Hero Section

A visually striking hero section that introduces the application with a headline, subtext, and a call-to-action button. It uses responsive design and smooth scrolling to guide users to the next section.

**Relevant Files:**

- `src/components/sections/HeroSection.tsx`

### Feature Grid

A grid layout that showcases key features of the application. Each feature card contains an icon, title, and brief description, providing users with a quick overview of the product’s capabilities.

**Relevant Files:**

- `src/components/sections/FeatureGrid.tsx`

### Terminal Demo

An interactive terminal simulation that demonstrates the application’s command-line interface. It highlights how users can interact with the tool directly from the browser.

**Relevant Files:**

- `src/components/sections/TerminalDemo.tsx`

### Installation Section

A dedicated section that explains how to install and set up the application. It includes code snippets and links to documentation, making onboarding straightforward for developers.

**Relevant Files:**

- `src/components/sections/InstallationSection.tsx`

### Visual Edits Messenger

A component that provides real-time visual editing feedback. It communicates with a backend service to tag and load components dynamically, enhancing the editing workflow.

**Relevant Files:**

- `src/visual-edits/VisualEditsMessenger.tsx`

## Dependencies

- **@babel/parser** — Parses JavaScript/TypeScript code into an abstract syntax tree for transformations and analysis. _(Category: tooling)_
- **@headlessui/react** — Unstyled, fully accessible UI components for React, enabling custom styling while maintaining accessibility. _(Category: ui)_
- **@heroicons/react** — A set of free, MIT-licensed SVG icons packaged as React components. _(Category: ui)_
- **@hookform/resolvers** — Resolves validation schemas for react-hook-form, simplifying form validation. _(Category: ui)_
- **@libsql/client** — Client library for interacting with a libsql database, providing query execution and connection management. _(Category: database)_
- **@number-flow/react** — React components for formatting and displaying numbers with locale-aware formatting. _(Category: ui)_
- **@radix-ui/react-accordion** — Accessible accordion component for grouping collapsible content. _(Category: ui)_
- **@radix-ui/react-alert-dialog** — Accessible alert dialog component for modal interactions. _(Category: ui)_
- **@radix-ui/react-aspect-ratio** — Component that maintains a consistent aspect ratio for its children. _(Category: ui)_
- **@radix-ui/react-avatar** — Component for displaying user avatars with optional fallback content. _(Category: ui)_
- **@radix-ui/react-checkbox** — Accessible checkbox component with customizable styling. _(Category: ui)_
- **@radix-ui/react-collapsible** — Component that allows content to be collapsed or expanded with smooth transitions. _(Category: ui)_
- **@radix-ui/react-context-menu** — Accessible context menu component for right-click interactions. _(Category: ui)_
- **@radix-ui/react-dialog** — Modal dialog component with focus trapping and accessibility features. _(Category: ui)_
- **@radix-ui/react-dropdown-menu** — Component for creating dropdown menus with keyboard navigation. _(Category: ui)_
- **@radix-ui/react-hover-card** — Hover card component that displays additional information on hover. _(Category: ui)_
- **@radix-ui/react-label** — Component that associates a label with form controls for accessibility. _(Category: ui)_
- **@radix-ui/react-menubar** — Component for building accessible menubars. _(Category: ui)_
- **@radix-ui/react-navigation-menu** — Component for creating responsive navigation menus. _(Category: ui)_
- **@radix-ui/react-popover** — Accessible popover component for contextual content. _(Category: ui)_

## Project Structure

```text
├── .env
├── README.md
├── bun.lock
├── components.json
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   ├── window.svg
├── src
│   ├── app
│   │   ├── global-error.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   ├── components
│   │   ├── ErrorReporter.tsx
│   │   ├── ParticleCloud.tsx
│   │   ├── SmoothScroll.tsx
│   │   ├── sections
│   │   │   ├── DiffShowcase.tsx
│   │   │   ├── FeatureGrid.tsx
│   │   │   ├── FinalCTA.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── InstallationSection.tsx
│   │   │   ├── ProblemTwistSection.tsx
│   │   │   ├── TerminalDemo.tsx
│   ├── hooks
│   │   ├── use-mobile.ts
│   ├── lib
│   │   ├── utils.ts
│   ├── visual-edits
│   │   ├── VisualEditsMessenger.tsx
│   │   ├── component-tagger-loader.js
├── tsconfig.json
```

## Core Folders

- **src/components** — Reusable UI components that can be composed across the application.
- **src/components/sections** — Page-specific sections that build the landing page layout.
- **src/hooks** — Custom React hooks for shared logic, such as detecting mobile devices.
- **src/lib** — Utility functions and helper modules used throughout the codebase.
- **src/visual-edits** — Components and scripts related to visual editing and messaging of UI elements.

## Installation

1. Clone the repository: git clone <repository-url>
2. Navigate to the project directory: cd app
3. Install dependencies using Bun: bun install
4. Create a .env file based on the provided template and set any required environment variables.
5. Start the development server: bun dev

## Development

- Run the development server with Bun: bun dev
- The application will be available at http://localhost:3000 by default.
- Hot module replacement is enabled for rapid iteration.

## Environment Variables

- Not provided

## Testing

- Not provided

## Deployment

- Not provided

## Contributing

We welcome contributions from the community! To get started, fork the repository and create a new branch for your feature or bug fix. Ensure that your changes follow the existing coding style and that you add relevant tests where applicable. Run the development server locally with `bun dev` to verify your changes. Once ready, submit a pull request with a clear description of the issue you addressed or the feature you added. Our maintainers will review your submission, provide feedback, and merge it once it meets the project's quality standards. For larger changes, consider opening an issue first to discuss the approach. All contributors must agree to the Contributor License Agreement (CLA) and adhere to the project's code of conduct.

---

Built with ❤️ by [Commitra](https://github.com/commitra)
