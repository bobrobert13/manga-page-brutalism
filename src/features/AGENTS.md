<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-23 | Updated: 2026-08-23 -->

# features/

## Purpose

Feature folders — cada uno encapsula un dominio de la aplicación con sus componentes, composables y utilidades. Las páginas Astro son shells delgados que importan desde aquí.

## Subdirectories

| Directory  | Purpose                                          | Components                                                                                                                                                                       | Composables                                                                                                                                                                                               |
| ---------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `catalog/` | Catálogo, filtros, búsqueda, géneros             | `CatalogBrowser.vue`, `MangaCard.astro`, `GenreChip.astro`, `GenreGrid.astro`, `RecentMangas.vue`                                                                                | `useCatalogFilters`, `useRecentMangas`, `catalog-sort.strategies`                                                                                                                                         |
| `viewer/`  | Lector de manga con auto-scroll, gestos, teclado | `MangaViewer.vue`, `ViewerStage.vue`, `ViewerControls.vue`, `ViewerHeader.vue`, `ViewerIndicator.vue`, `ViewerOnboarding.vue`, `ViewerFeedback.vue`, `ViewerAutoScrollPanel.vue` | `useViewerController`, `useViewerAutoScroll`, `useViewerGestures`, `useViewerKeyboard`, `useViewerState`, `useViewerPersistence`, `useViewerUrlSync`, `useViewerChromeAutoHide`, `useViewerChromeVisible` |
| `detail/`  | Página de detalle de manga                       | `ChapterList.astro`, `ChapterRow.astro`, `CoverArt.astro`, `RelatedMangas.astro`, `RelatedMangas.vue`                                                                            | —                                                                                                                                                                                                         |
| `home/`    | Landing page                                     | `TrendingStrip.astro`, `TrendingCard.astro`, `StatsGrid.astro`, `StatsTile.astro`, `FinalCTA.astro`                                                                              | —                                                                                                                                                                                                         |
| `auth/`    | Autenticación Clerk                              | `AuthCard.astro`, `AuthSidePanel.astro`                                                                                                                                          | —                                                                                                                                                                                                         |

### Viewer: subdirectorios adicionales

| Directory     | Purpose                        | Files                                        |
| ------------- | ------------------------------ | -------------------------------------------- |
| `viewer/lib/` | Funciones puras sin estado Vue | `page-placeholder.ts`, `scroll-animation.ts` |

### Auth: subdirectorios adicionales

| Directory   | Purpose             | Files                 |
| ----------- | ------------------- | --------------------- |
| `auth/lib/` | Configuración Clerk | `clerk-appearance.ts` |

## For AI Agents

### Working In This Directory

- Cada feature es autónoma: sus componentes y composables solo dependen de `composables/services/`, `config/`, `types/` y `components/ui/`
- Un feature NO importa de otro feature — si surge acoplamiento, el componente compartido debe moverse a `ui/` o `composables/shared/`
- Crear nuevo feature: `src/features/<nombre>/{components/, composables/, lib/}`
- `lib/` dentro de un feature es para funciones puras (sin estado reactivo Vue)

### Feature Structure Pattern

```
features/<feature>/
├── components/       ← .astro (SSR) + .vue (islas interactivas)
├── composables/      ← composables Vue con estado reactivo
└── lib/              ← funciones puras (opcional)
```

### Testing Requirements

- Tests co-locados: `*.test.ts` (Node) junto a composables, `*.dom.test.ts` (happy-dom) junto a componentes Vue
- Contar tests por feature: `catalog` (3 test files), `viewer` (15 test files), `detail` (0), `home` (0), `auth` (0)
- `viewer` es el feature más testeado; respetar cobertura existente al modificar

### Common Patterns

- Componentes `.vue` reciben props tipadas; estado interno vía composables locales
- Componentes `.astro` reciben datos via `Astro.props` desde la página
- Composable `useX` exporta estado reactivo + métodos; se inyecta via `provide/inject` en viewer
- Viewer: patrón `useViewerController` como orquestador; sub-composables para gestos, teclado, persistencia

## Dependencies

### Internal

- `composables/services/catalog/` — acceso a datos de mangas
- `composables/services/account/` — perfil de usuario (auth feature)
- `config/index.config.ts` — constantes (ROUTES, VIEWER_CONFIG, READING_MODE, etc.)
- `types/` — interfaces de dominio
- `components/ui/` — kit genérico (importado por pages, no directamente por features)

### External

- `vue` 3.x — reactivity, composables
- `@clerk/astro` — auth (feature auth)
- `@vue/test-utils` — tests de componentes

<!-- MANUAL: -->
