<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-23 | Updated: 2026-08-23 -->

# components/

## Purpose

Contenedor del kit UI genérico. Todas las piezas aquí son agnósticas al dominio (sin referencias a `manga`, `chapter`, `catalog`). Componentes de dominio viven en `src/features/<feature>/components/`.

## Subdirectories

| Directory | Purpose                                                       |
| --------- | ------------------------------------------------------------- |
| `ui/`     | Kit UI categorizado por tipo de elemento (see `ui/AGENTS.md`) |

## For AI Agents

### Working In This Directory

- No crear componentes de dominio aquí — usar `src/features/<feature>/components/`
- Cada componente en `ui/` debe ser auto-contenido: sin imports de features, servicios, ni fixtures
- Usar alias `@ui/` para importar desde otras partes del código

### Testing Requirements

- No hay tests directos aquí (los componentes UI son puramente presentacionales Astro)
- ThemeToggle se prueba indirectamente via SiteHeader

### Common Patterns

- Componentes Astro (`.astro`) para renderizado SSR sin hidratación
- Props via `Astro.props` con interfaz tipada inline o importada de `@/types/`

## Dependencies

### Internal

- Ninguna — `ui/` es la capa más baja de componentes

### External

- `astro` — framework de componentes
- `tailwindcss` — clases utilitarias

<!-- MANUAL: -->
