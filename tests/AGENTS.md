<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-23 | Updated: 2026-08-23 -->

# tests/

## Purpose

Infraestructura de testing compartida: contratos, fixtures, mocks, harness y setup. Los tests de unidad/componente viven co-locados en `src/` junto a su archivo fuente.

## Subdirectories

| Directory    | Purpose                                                  | Files                                             |
| ------------ | -------------------------------------------------------- | ------------------------------------------------- |
| `contracts/` | Contratos de servicio compartidos entre implementaciones | `catalogService.contract.ts`                      |
| `fixtures/`  | Datos de prueba para tests de viewer                     | `viewerState.ts`, `viewer.ts`                     |
| `harness/`   | Utilidades de montaje para tests Vue                     | `mountComposable.ts`, `viewerProvide.ts`          |
| `mocks/`     | Handlers MSW para API mock                               | `catalog.handlers.ts`, `handlers.ts`, `server.ts` |
| `setup/`     | Configuración global de vitest                           | `node.setup.ts`, `dom.setup.ts`                   |

## Key Files

| File                                   | Description                                                                                           |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `contracts/catalogService.contract.ts` | Suite compartida que ejecuta los mismos tests contra `useCatalogService` y `useCatalogFixtureService` |
| `fixtures/viewerState.ts`              | Factory `createViewerStateMock` para tests de viewer                                                  |
| `harness/viewerProvide.ts`             | `viewerProvide` — inyecta estado mock en tests de componentes viewer                                  |
| `harness/mountComposable.ts`           | Helper para montar composables Vue en tests                                                           |
| `mocks/server.ts`                      | MSW server con `failOnUnhandledRequest: true`                                                         |
| `mocks/catalog.handlers.ts`            | Handlers MSW para endpoints del catálogo                                                              |

## For AI Agents

### Working In This Directory

- `contracts/`: tests que se ejecutan contra múltiples implementaciones del mismo contrato
- `fixtures/`: funciones factory, no datos estáticos — `createX()` no `const X`
- `harness/`: wrappers alrededor de `@vue/test-utils` para reducir boilerplate
- `mocks/`: handlers MSW siguen el contrato HTTP definido en `catalog.endpoints.ts`
- `setup/`: NO poner lógica de tests aquí — solo configuración global (mocks, timers, cleanup)

### Testing Requirements

- MSW usa `failOnUnhandledRequest: true` — todo request no mockeado rompe el test
- Nuevos endpoints del API requieren handlers en `mocks/catalog.handlers.ts`
- Tests de viewer usan `createViewerStateMock` + `viewerProvide` — no mockear manualmente

### Common Patterns

- Contrato: `catalogServiceContract('HTTP', () => useCatalogService(...))` y `catalogServiceContract('Fixture', () => useCatalogFixtureService(...))`
- Fixtures: `createViewerStateMock(overrides)` — factory con overrides parciales
- Harness: `mountComposable(() => useMiComposable())` — wrapper tipado

## Dependencies

### Internal

- `composables/services/` — servicios bajo test
- `features/viewer/` — componentes y composables bajo test

### External

- `vitest` — test runner
- `@vue/test-utils` — montaje de componentes Vue
- `msw` — API mocking
- `happy-dom` — entorno DOM para tests de componentes

<!-- MANUAL: -->
