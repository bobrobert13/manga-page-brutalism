<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-23 | Updated: 2026-08-23 -->

# data/

## Purpose

Datos estáticos (fixtures) para desarrollo y tests. Páginas y componentes NUNCA importan directamente de aquí — siempre acceden via `composables/services/`.

## Subdirectories

| Directory    | Purpose                                 | Files                                                           |
| ------------ | --------------------------------------- | --------------------------------------------------------------- |
| `catalog/`   | Fixtures de mangas, capítulos y géneros | `mangas.fixture.ts`, `chapters.fixture.ts`, `genres.fixture.ts` |
| `marketing/` | Contenido estático de landing           | `stats.fixture.ts`                                              |

## Key Files

| File                          | Description                              |
| ----------------------------- | ---------------------------------------- |
| `catalog/mangas.fixture.ts`   | Array `MANGAS` con ~12 mangas de ejemplo |
| `catalog/chapters.fixture.ts` | Capítulos asociados a mangas             |
| `catalog/genres.fixture.ts`   | Array `GENRES` con todos los géneros     |
| `marketing/stats.fixture.ts`  | Estadísticas decorativas para landing    |

## For AI Agents

### Working In This Directory

- Los fixtures son datos estáticos — no incluir lógica de negocio
- Tipos deben coincidir con interfaces en `src/types/`
- Agregar nuevos mangas de prueba aquí, no en los servicios
- Si `PUBLIC_CATALOG_SOURCE=api`, estos fixtures no se usan en runtime

### Testing Requirements

- No hay tests directos aquí — se prueban via `useCatalogFixtureService.test.ts`
- Si se modifica un fixture, verificar que los snapshots de tests sigan pasando

### Common Patterns

- `export const X = [ ... ] as const` para arrays
- Tipos importados de `@/types/manga`

## Dependencies

### Internal

- `types/` — interfaces de dominio

### External

- Ninguna

<!-- MANUAL: -->
