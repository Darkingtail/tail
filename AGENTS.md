# Repository Guidelines

## Project Structure & Module Organization
The app is a Vite-powered React/TypeScript workspace. Core UI pieces live in `src/components`, route-facing screens in `src/pages`, navigation wiring in `src/router`, and global state in `src/store`. Mock data and MSW handlers sit in `src/_mock`, while static assets are in `public/` and `src/assets/`. Shared utilities are grouped under `src/utils`, and the legacy multi-page experiment is kept in `src-multi-page/` for reference. Build helpers such as `scripts/build.js` support CI packaging.

## Build, Test, and Development Commands
`pnpm install` resolves dependencies; run it after cloning or when lockfile changes. Use `pnpm dev` to boot the local server (default http://localhost:5173). `pnpm build` compiles TypeScript and creates the production bundle, and `pnpm preview` serves that bundle for smoke checks. `pnpm scripts:build` executes the custom build orchestrator—reserve this for CI parity or multi-target builds.

## Coding Style & Naming Conventions
Biome (`biome.json`) enforces tabs for indentation, double quotes, and import sorting; let Lefthook’s pre-commit hook apply fixes or run `pnpm biome check .` before committing. Prefer PascalCase for React components, camelCase for variables and hooks (prefix hooks with `use`), and SCREAMING_SNAKE_CASE for shared constants. Co-locate component styles and Tailwind utilities; keep theme tokens in `src/theme/`.

## Testing Guidelines
Automated tests are not yet wired into `package.json`. When introducing them, follow Vite defaults (Vitest + @testing-library/react pairs well) and mirror feature folders using `src/<feature>/__tests__/*.test.tsx`. Reuse the MSW handlers in `src/_mock` for API isolation, and document any coverage targets in the PR until a numeric threshold is adopted.

## Commit & Pull Request Guidelines
Commit messages must follow Conventional Commits; allowed types mirror `commitlint.config.js` (`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `revert`, `build`, `ci`, `types`, `wip`). Start subjects in lowercase, keep them under 72 characters, and add a blank line before the body. PRs should summarize intent, link issues, list validation steps (`pnpm build`, `pnpm preview`), and attach UI screenshots or recordings when front-end changes are visible.
