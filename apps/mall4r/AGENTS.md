# Repository Guidelines

## Background & Goals
This repo is the React/TypeScript rewrite of the Vue-based `mall4j/front-end/mall4v` client that lives in `D:\dev\darkingtail\mall4j`. Treat the Vue codebase as the functional reference while you learn React patterns and keep parity with the Java backend modules in the parent project. When copying features, confirm APIs and payload contracts against the backend services in `mall4j` to avoid regressions.

## Project Structure & Module Organization
Vite drives the workspace. Colocate reusable UI in `src/components`, route-facing pages in `src/pages`, and navigation wiring in `src/router`. App-wide state belongs to `src/store`. Mock data plus MSW handlers for backend simulation sit inside `src/_mock`, while public assets live under `public/` and app-specific icons or illustrations under `src/assets/`. Shared utilities stay in `src/utils`, theming tokens in `src/theme/`, and any multi-page legacy experiments in `src-multi-page/`. CI helpers such as `scripts/build.js` sit inside `scripts/`.

## Build, Test, and Development Commands
- `pnpm install` — install or refresh dependencies after syncing with `mall4j`.
- `pnpm dev` — launch the Vite dev server (http://localhost:5173) to compare React pages with their Vue counterparts.
- `pnpm build` — run type checks and produce the production bundle; execute before opening a PR.
- `pnpm preview` — serve the production build locally for smoke testing.
- `pnpm scripts:build` — run the custom multi-target build used by CI or when you need to mirror mall4j deployment outputs.

## Coding Style & Naming Conventions
Biome (`biome.json`) enforces tabs, double quotes, and sorted imports; run `pnpm biome check .` or rely on the Lefthook pre-commit to auto-fix. Use PascalCase for React components, camelCase for functions and hooks (prefix hooks with `use`), and SCREAMING_SNAKE_CASE for shared constants. Keep Tailwind utilities or CSS modules next to their components and update shared tokens only through `src/theme/`.

## Testing Guidelines
Formal automated tests are not yet wired into `package.json`, but default to Vitest + Testing Library. Place tests alongside features in `src/<feature>/__tests__/*.test.tsx`. Reuse `src/_mock` handlers to stub mall4j APIs so React screens can be validated without the backend. Document manual and automated coverage in each PR until numeric targets are established.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `revert`, `build`, `ci`, `types`, `wip`) with lowercase subjects under 72 characters and a blank line before any body text. PRs must describe the Vue feature being ported, link related mall4j issues, list validation steps (`pnpm build`, `pnpm preview`, and any backend integration checks), plus include screenshots or screencasts for UI deltas. Highlight noteworthy differences from the Vue implementation so reviewers can cross-check behaviour quickly.
