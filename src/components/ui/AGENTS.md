<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-23 | Updated: 2026-08-23 -->

# components/ui/

## Purpose

Kit UI categorizado por tipo de elemento visual. Cada subcarpeta agrupa componentes por su función visual, no por dominio de negocio.

## Subdirectories

| Directory     | Purpose                       | Files                                                                                         |
| ------------- | ----------------------------- | --------------------------------------------------------------------------------------------- |
| `navigators/` | Navegación y chrome del sitio | `Logo.astro`, `SiteHeader.astro`, `SiteFooter.astro`, `Breadcrumb.astro`, `ThemeToggle.astro` |
| `texts/`      | Tipografía decorativa         | `SectionHeading.astro`                                                                        |
| `effects/`    | Efectos visuales y motion     | `Marquee.astro`                                                                               |

## Key Components

| Component                      | Type  | Description                               |
| ------------------------------ | ----- | ----------------------------------------- |
| `navigators/Logo.astro`        | Astro | Logo INK/PXL con enlace al home           |
| `navigators/SiteHeader.astro`  | Astro | Header global con nav, auth y ThemeToggle |
| `navigators/SiteFooter.astro`  | Astro | Footer con enlaces y créditos             |
| `navigators/Breadcrumb.astro`  | Astro | Migas de pan generadas desde `Astro.url`  |
| `navigators/ThemeToggle.astro` | Astro | Botón square sun/moon para dark mode      |
| `texts/SectionHeading.astro`   | Astro | Título de sección con layout brutalista   |
| `effects/Marquee.astro`        | Astro | Carrusel infinito para géneros o stats    |

## For AI Agents

### Working In This Directory

- Categorizar nuevo componente en la subcarpeta que corresponda según su función visual
- Si ninguna categoría encaja, crear nueva subcarpeta (ej. `overlays/`, `inputs/`, `indicators/`)
- Props deben ser mínimas: solo lo necesario para que el componente sea reutilizable
- No importar desde `features/`, `composables/services/`, ni `data/`

### Testing Requirements

- Componentes Astro puros no requieren tests unitarios — se prueban indirectamente en tests de página
- Si un componente futuro incluye lógica JS, co-ubicar `*.dom.test.ts`

### Common Patterns

- Alias de import: `@ui/navigators/Logo.astro`
- Estilos via Tailwind utility classes inline (no CSS modules)
- Sin estado reactivo — renderizado puro SSR

## Dependencies

### Internal

- `src/types/` — tipos compartidos (si se necesitan)

### External

- `astro` — `Astro.props`, `Astro.url`
- `@fontsource/*` — tipografías cargadas via `styles/global.css`

<!-- MANUAL: -->
