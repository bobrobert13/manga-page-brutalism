<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-23 | Updated: 2026-08-23 -->

# src/

## Purpose

Código fuente de la aplicación Astro SSR + Vue islands. Organizado por capas: páginas (rutas), layouts, features (dominio), componentes UI genéricos, composables, servicios, configuración, datos estáticos y tipos compartidos.

## Subdirectories

| Directory      | Purpose                                                                         |
| -------------- | ------------------------------------------------------------------------------- |
| `components/`  | Kit UI genérico sin dominio (see `components/AGENTS.md`)                        |
| `features/`    | Feature folders por dominio (see `features/AGENTS.md`)                          |
| `composables/` | Comportamientos Vue reactivos + capa de servicios (see `composables/AGENTS.md`) |
| `config/`      | Constantes del sitio, rutas, auth, viewer (see `config/AGENTS.md`)              |
| `data/`        | Fixtures estáticos de catálogo y marketing (see `data/AGENTS.md`)               |
| `layouts/`     | Plantillas Astro (BaseLayout, AuthLayout)                                       |
| `pages/`       | Rutas Astro — shells delgados sin lógica de datos                               |
| `styles/`      | CSS global (`global.css` + `clerk.css`)                                         |
| `types/`       | Tipos TypeScript compartidos (`manga.ts`, `viewer.ts`, `recent-manga.ts`)       |

## Key Files

| File            | Description                             |
| --------------- | --------------------------------------- |
| `middleware.ts` | Clerk SSR middleware para autenticación |
| `env.d.ts`      | Declaraciones de tipos de entorno       |

## For AI Agents

### Working In This Directory

- `pages/` son rutas por archivo Astro — solo `*.astro` y `*.svg.ts` se renderizan como páginas
- `layouts/` envuelven páginas con `<html>`, metadatos, header/footer
- `styles/` carga `@fontsource` y Tailwind; no requiere imports manuales
- `types/` define interfaces de dominio; re-exporta tipos desde `config/` para consumidores

### Testing Requirements

- Tests co-locados con extensión `*.test.ts` (Node) o `*.dom.test.ts` (happy-dom)
- Los tests son movidos junto con su archivo fuente; no hay carpeta `__tests__/`
- Ejecutar `npm run test` antes de commit

### Common Patterns

- Imports: usar alias `@features/*`, `@ui/*`, `@/*` para paths absolutos; relativos dentro del mismo feature
- Páginas: solo importan layouts + features; cero lógica de datos directa
- Servicios: factorías funcionales `useXService`, sin estado reactivo Vue
- Components: Astro para SSR, `.vue` para islas interactivas

## Dependencies

### Internal

- `config/index.config.ts` — fachada única de todas las constantes del sitio
- `types/` — tipos compartidos entre features y servicios

### External

- `astro` 7.x — framework SSR
- `vue` 3.x — islas interactivas
- `@clerk/astro` — autenticación
- `tailwindcss` 4.x — estilos utilitarios
- `axios` — cliente HTTP

<!-- MANUAL: -->
