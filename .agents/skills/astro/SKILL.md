---
name: astro
description: "Trigger: Astro, .astro, SSR, routes, islands, adapters, or Astro tests. Apply this repository's Astro architecture and verification rules."
license: MIT
metadata:
  author: Astro Team
  version: '0.1.0'
---

## Activation Contract

Use this skill for Astro pages, components, routes, middleware, adapters, islands, SSR behavior, or testing that crosses an Astro boundary.

## Hard Rules

- Read `../../../AGENTS.md` and the relevant local reference before editing.
- Keep SSR as the default; prerender only intentionally static routes.
- Access catalog data through `src/services/`, never directly from `src/data/` in pages or components.
- Keep Astro API handlers thin and move business logic into testable services or functions.
- Start development only with `astro dev --background`; manage it with `astro dev status|logs|stop`.
- Do not introduce browser E2E or CI unless the user expands the current testing scope.

## Decision Gates

| Change                              | Required reference               |
| ----------------------------------- | -------------------------------- |
| Data flow, service, auth, SSR       | `../../../docs/architecture.md`  |
| Unit, DOM, HTTP, or endpoint test   | `../../../docs/testing.md`       |
| Generic Astro CLI or project layout | `references/framework-basics.md` |

## Execution Steps

1. Inspect the target route or component and its service/composable dependencies.
2. Select Node tests for pure/HTTP logic or happy-dom for Vue and browser APIs.
3. Add the failing behavior test before implementation when building a feature.
4. Preserve the config facade, functional service, `ServiceResult`, and per-request auth boundaries.
5. Run the focused test, then formatting, lint, Astro check, coverage, and build before handoff.

## Output Contract

Report changed Astro boundaries, test layer used, SSR/prerender impact, commands executed, and any remaining manual visual verification.

## References

- `../../../AGENTS.md`
- `../../../docs/architecture.md`
- `../../../docs/testing.md`
- `references/framework-basics.md`
