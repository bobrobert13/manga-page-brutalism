<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-23 | Updated: 2026-08-23 -->

# config/

## Purpose

Configuración centralizada del sitio. `index.config.ts` es la fachada pública — todo el código importa desde aquí, nunca desde archivos internos de `domain/` o `ui/`.

## Subdirectories

| Directory | Purpose                              | Files                                                                       |
| --------- | ------------------------------------ | --------------------------------------------------------------------------- |
| `domain/` | Reglas de negocio, rutas, auth, HTTP | `routes.config.ts`, `catalog.config.ts`, `auth.config.ts`, `http.config.ts` |
| `ui/`     | Comportamiento visual, viewer, sitio | `site.config.ts`, `viewer.config.ts`                                        |

## Key Files

| File                       | Description                                                           |
| -------------------------- | --------------------------------------------------------------------- |
| `index.config.ts`          | Barrel re-export — TODO import de config debe pasar por aquí          |
| `domain/routes.config.ts`  | `ROUTES` con paths tipados y helpers `encodePathSegment`              |
| `domain/catalog.config.ts` | `CATALOG_CONFIG`, `CATALOG_SORT`, `CATALOG_PAGE_SIZE`                 |
| `domain/auth.config.ts`    | `AUTH_CONFIG` — rutas Clerk, redirects                                |
| `domain/http.config.ts`    | `HTTP_CONFIG` — base URL, timeout, `catalogSource`                    |
| `ui/site.config.ts`        | `SITE` — url, locale, nombre, `SERIES_STATUS`                         |
| `ui/viewer.config.ts`      | `VIEWER_CONFIG`, `READING_MODE`, `AUTO_SCROLL_CONFIG`, `STORAGE_KEYS` |

## For AI Agents

### Working In This Directory

- NUNCA importar desde `domain/` o `ui/` directamente — siempre usar `@/config/index.config`
- `domain/` = lógica de negocio y transporte; `ui/` = presentación y comportamiento visual
- Dudas de categorización: si afecta la experiencia visual → `ui/`; si afecta datos/comunicación → `domain/`
- Constantes exportadas como `as const` para tipos literales

### Testing Requirements

- Solo `routes.config.test.ts` tiene tests dedicados
- Otras constantes se prueban indirectamente en tests de features y servicios

### Common Patterns

- `export const X = { ... } as const` — garantiza tipos literales
- `export type XKey = (typeof X)[keyof typeof X]` — deriva tipo de las claves
- Tipos se re-exportan desde `index.config.ts` y también desde `types/` para consumidores

## Dependencies

### Internal

- Ninguna — `config/` es la capa más baja, no importa de otras partes de `src/`

### External

- Ninguna — solo TypeScript y valores literales

<!-- MANUAL: -->
