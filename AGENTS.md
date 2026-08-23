## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Application architecture

- Use `src/config/index.config.ts` as the public facade for stable site constants, routes, statuses, storage keys, and behavior defaults. Domain config lives in `src/config/domain/`; UI config in `src/config/ui/`.
- Keep fixtures in `src/data/`; pages and components must access catalog data through `src/composables/services/`.
- Services are small functional factories (`useXService`), not classes or repositories. They must remain independent from Vue lifecycle APIs.
- External operations return `ServiceResult<T>` for expected failures and normalize transport errors to `ServiceError`.
- Never capture a user token or initialize a user store at module scope. Resolve authentication per operation/request.
- Do not mutate shared Axios authorization defaults during SSR.
- Keep reactive UI state in feature-scoped composables (`src/features/<feature>/composables/`) and shared Vue behavior in `src/composables/shared/`.
- Astro pages are SSR by default. Add `prerender = true` only to routes that are intentionally static.
- Run `npm run format:check`, `npm run lint`, `npm run check`, `npm run test`, and `npm run build` before handoff.

### Folder structure

```
src/
├── components/ui/          ← generic, domain-agnostic pieces
│   ├── navigators/         ← Logo, SiteHeader, SiteFooter, Breadcrumb
│   ├── texts/              ← SectionHeading
│   └── effects/            ← Marquee
├── features/               ← feature folders (components + composables + lib)
│   ├── catalog/            ← CatalogBrowser, MangaCard, GenreChip, filters
│   ├── viewer/             ← MangaViewer, Viewer*, useViewer*, scroll-animation
│   ├── detail/             ← ChapterList, CoverArt, RelatedMangas
│   ├── home/               ← TrendingStrip, StatsGrid, FinalCTA
│   └── auth/               ← AuthCard, AuthSidePanel, clerk-appearance
├── composables/
│   ├── shared/             ← useFocusTrap
│   └── services/           ← api.client, service-error, catalog, account, marketing
├── config/                 ← domain/ + ui/ + index.config.ts facade
├── data/                   ← static fixtures
├── layouts/                ← BaseLayout, AuthLayout
├── pages/                  ← Astro routes (thin shells)
├── styles/                 ← global.css, clerk.css
├── types/                  ← shared TypeScript types
└── middleware.ts
```

## Testing

### Test-First Mandate

- **Every feature starts with a failing test.** Write the test first (red), implement the minimum (green), refactor with the suite passing.
- **Every logic change updates tests first.** If a behavior change breaks existing tests, the test must be updated to reflect the new contract before the implementation is marked done.
- **No untested code in services, composables, or utilities.** `composables/services/`, `features/*/composables/`, `features/*/lib/`, and `config/` must maintain ≥85% line coverage with no file below 75% branches.
- **UI components are testable in isolation.** Every interactive `.vue` component must have a co-located `*.dom.test.ts` that mounts the component with mocked dependencies.

### Test Matrix by Layer

| Layer                  | Test file       | Environment | Mock strategy         |
| ---------------------- | --------------- | ----------- | --------------------- |
| Pure function / config | `*.test.ts`     | Node        | Explicit data         |
| Service HTTP           | `*.test.ts`     | Node + MSW  | MSW handlers          |
| Service fixture        | `*.test.ts`     | Node        | Fixtures              |
| Composable Vue         | `*.dom.test.ts` | happy-dom   | mountComposable       |
| Component Vue          | `*.dom.test.ts` | happy-dom   | mount + viewerProvide |

### Coverage Thresholds

| Métrica    | Mínimo                      |
| ---------- | --------------------------- |
| Líneas     | 85% global                  |
| Ramas      | 75% global, 75% por archivo |
| Funciones  | 85%                         |
| Sentencias | 80%                         |

### Pre-Handoff Checklist

```bash
npm run format:check  # Prettier
npm run lint          # ESLint
npm run check         # astro check (types)
npm run test          # Vitest (all projects)
npm run test:coverage # Coverage thresholds
npm run build         # Production build
```

- Follow `docs/testing.md` for test placement, TDD flow, HTTP contracts, and determinism rules.
- Use `*.test.ts` for Node tests and `*.dom.test.ts` for Vue or browser-API behavior in happy-dom.
- Exercise Axios through MSW; do not mock Axios in HTTP client or service tests.
- Keep MSW requests local and fail every unhandled request.
- Share contract tests between fixture and HTTP implementations of the same service.
- Run a focused file while iterating, then `npm run test:coverage` before handoff.

### Known Test Debt

| File                                                   | Gap             | Priority                                                        |
| ------------------------------------------------------ | --------------- | --------------------------------------------------------------- |
| `features/catalog/components/RecentMangas.vue`         | No DOM test     | Low — component is simple, tested via `useRecentMangas.test.ts` |
| `features/viewer/composables/useViewerGestures`        | Branches 67.3%  | Medium — pinch-zoom + double-tap paths                          |
| `features/viewer/composables/useViewerState`           | Branches 69.56% | Low — fullscreen storage edge cases                             |
| `features/viewer/composables/useViewerAutoScroll`      | Branches 70.12% | Medium — complete + boundary states                             |
| `composables/shared/useFocusTrap`                      | Branches 70.83% | Low — shift-tab + empty container                               |
| `features/catalog/composables/catalog-sort.strategies` | Branches 75%    | Low — boundary at threshold                                     |

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Testing strategy](docs/testing.md)
- [Application architecture](docs/architecture.md)
- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
