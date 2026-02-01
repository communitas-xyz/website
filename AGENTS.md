## Communitas.xyz – Agent Guide

This repository contains the Communitas.xyz website (Astro + Starlight), product and research context (`BRIEF.md`), and TypeScript tooling. This guide tells agentic coding tools how to behave in this codebase.

---

### 1. Project Context

- Communitas.xyz is an "AI community manager toolkit" focused on network science, GraphRAG, and pro-social community interventions.
- The `BRIEF.md` file is the single source of truth for the product vision, research grounding, ethics posture, and initial architecture assumptions.
- When designing data models, agents, or APIs, align with the entities, edges, and loops described in `BRIEF.md` (sensemaking, health, intervention, learning).

Agent rule: always read or re-skim `BRIEF.md` before proposing significant architectural changes, new subsystems, or user-facing behavior.

---

### 2. Build / Lint / Test Commands

This repository now contains an Astro + Starlight docs site plus TypeScript tooling.

1. Package management
   - We use `npm` as the package manager.
   - Node engine: see `package.json` (`"node": ">=22.21.0"`).

2. Core scripts (from `package.json`)
   - `npm run dev` – run the Astro dev server for the docs/marketing site.
   - `npm run build` – production build of the static site.
   - `npm run preview` – preview the built site locally.
   - `npm run lint` – run ESLint on the project.
   - `npm run format` – run Prettier on the project.
   - `npm run typecheck` – run TypeScript type-checking with `tsc --noEmit`.
   - `npm test` – run the Vitest test suite (once tests exist).

3. Content and site structure
   - Content lives in `src/content/docs/` as `.mdx` files (Starlight convention).
   - Content config is at `src/content.config.ts` (Astro 5 + Starlight loaders).
   - Custom CSS theme is at `src/styles/global.css`, registered via `customCss` in `astro.config.mts`.
   - The landing page (`src/pages/index.astro`) is a standalone Astro page outside Starlight, with its own styles.
   - Static assets (favicon, images) go in `public/`.
   - Deployment: GitHub Actions workflow at `.github/workflows/deploy.yml` builds and deploys to GitHub Pages on push to `main`.

4. Single-test patterns (Vitest; once tests exist)
   - Single file: `npx vitest path/to/file.test.ts`.
   - By test name: `npx vitest -t "test name"`.

5. E2E and other stacks (planned)
   - If you add Playwright or Cypress for e2e:
     - Single spec: `npx playwright test path/to/spec.ts` or `npx cypress run --spec path/to/spec.cy.ts`.
   - If you add a Python component, prefer `uv` or `pip` + `pytest`; use `pytest path/to/test_file.py -k name_substring` for single tests.
   - For Rust, prefer `cargo test test_name` for single tests.

When adding new tools or commands, update this section so other agents always have accurate instructions.

---

### 3. Code Style – General Principles

The repo has ESLint configured (`eslint.config.mjs`) and TypeScript in strict mode (`tsconfig.json`). Follow these rules for consistent code:

1. Language and typing
   - Prefer TypeScript over plain JavaScript for new code.
   - Use `strict` TypeScript options (no `any` unless truly unavoidable).
   - Model domain concepts explicitly: `Member`, `Thread`, `Message`, `Topic`, `Event`, `Artifact`, `Intervention`, `Policy`.

2. Modules and imports
   - Use ES modules (`import` / `export`), not CommonJS, unless integrating with a legacy tool that requires it.
   - Order imports: standard library (e.g., `node:`), third-party packages, internal modules, then relative paths.
   - Within each group, sort alphabetically; avoid unused imports.

3. Formatting
   - Two-space indentation.
   - Single quotes for strings, template literals for interpolation.
   - Trailing commas in multi-line objects/arrays/params when supported.
   - Wrap lines around 100 characters; break up complex expressions for readability.
   - Use `async`/`await` instead of bare promises or callbacks.

4. Naming
   - Types/interfaces: `PascalCase` (`CommunityGraph`, `BridgeEdge`).
   - Variables, functions, methods: `camelCase` (`computeHealthMetrics`).
   - Constants: `SCREAMING_SNAKE_CASE` only for truly global configuration or environment keys.
   - File names: `kebab-case` for web assets, `camelCase` or `kebab-case` for TS/JS modules; keep consistent within a folder.

5. Comments and documentation
   - Keep code self-explanatory; use comments only where logic or domain context is non-obvious.
   - Prefer short function-level doc comments describing behavior and invariants over inline noise.
   - When implementing research-backed logic, include the paper or concept family name from `BRIEF.md` in a short comment.

---

### 4. Error Handling and Logging

Error handling must reflect Communitas.xyz’s emphasis on transparency, auditability, and user agency:

1. Error strategy
   - Fail fast on programmer errors (invalid assumptions, unreachable states); surface clear stack traces in development.
   - For user- or data-facing errors (e.g., missing permissions, invalid input), return structured, typed error objects.
   - Never silently ignore errors; either handle them explicitly or propagate with context.

2. Error types
   - Introduce domain-specific error classes (`GraphBuildError`, `InterventionPolicyError`, `PrivacyViolationError`) rather than throwing raw strings.
   - Include machine-readable codes and human-readable messages.

3. Logging
   - Log at appropriate levels (`debug`, `info`, `warn`, `error`); avoid logging sensitive or personally identifiable information.
   - For any agentic intervention, ensure the system can emit an audit log entry (who/what/why/when) inspired by the principles in `BRIEF.md`.

4. Resilience
   - Prefer graceful degradation to total failure, especially around external APIs; wrap calls with timeouts and retries where appropriate.
   - Avoid catching errors only to rethrow without additional context; use error wrapping or cause-chaining.

---

### 5. Domain-Driven Design Hints

To keep the code aligned with the research brief:

- Keep community graph modeling concerns (entities, edges, metrics) separate from interface layers (CLI, HTTP API, UI).
- Encapsulate research concepts (bridges, diffusion, interventions, governance) in dedicated modules or packages.
- Avoid prematurely optimizing for scale; optimize first for clarity and experimentability of metrics and interventions.
- Always preserve a clear boundary between raw community data, derived graphs/metrics, and recommendations/interventions.

---

### 6. Testing Guidelines

Once tests exist, they should reflect the product’s emphasis on safety and legitimacy:

1. Unit tests
   - Cover graph construction, metric calculations, and intervention selection logic.
   - Test boundary conditions and failure cases (fragmented networks, missing data, adversarial inputs).

2. Property- and scenario-based tests
   - Use small synthetic graphs to validate qualitative behaviors (e.g., removing a bridge node increases fragmentation).
   - Encode invariants from the research literature as tests where feasible.

3. Agent behavior tests
   - For agent workflows, include tests that assert opt-in behavior, audit log entries, and respect for policy constraints.

4. Single-test runs
   - Prefer test runners that support filtering by file and by test name, and document the exact commands in this file when configured.

---

### 7. Repository and Tooling Rules

Cursor and Copilot-specific instruction files (`.cursor/rules/`, `.cursorrules`, `.github/copilot-instructions.md`) are not present yet. When they are added:

- Always read and obey those files in addition to `AGENTS.md`.
- Mirror any non-obvious constraints or preferences from them into this file so all agentic tools share a single mental model.
- If multiple instruction sources conflict, prefer the more specific, repo-local rules over generic defaults, and note the resolution here.

Until such files exist, treat this `AGENTS.md` as the primary guide for AI coding agents.

---

### 8. Process for Agentic Changes

When making non-trivial changes (new modules, new services, migrations):

1. Re-read `BRIEF.md` to confirm alignment with the product’s research-informed goals and ethical constraints.
2. Search the repo for existing patterns before adding new dependencies or architectural motifs.
3. Prefer incremental, composable changes over monolithic rewrites; keep PRs focused.
4. Explain how your change supports at least one of the four loops (sensemaking, health, intervention, learning) in your commit/PR description.
5. When introducing new configuration, tests, or style rules, update `AGENTS.md` accordingly.

This file is intentionally forward-looking. As the codebase grows, agents should refine and extend it to describe the actual build, lint, test, and style rules in use.
