# INK/PXL — Manga Brutalism UI

> Landing + catálogo + detalle de mangas y cómics. **Brutalismo al 20%** — lo
> suficientemente crudo para sentirse, lo suficientemente refinado para
> enviarse. Construido con [Astro](https://astro.build) + Vue 3 + Tailwind 4.

![status](https://img.shields.io/badge/status-migrated-FFB703?style=for-the-badge)
![stack](https://img.shields.io/badge/stack-Astro%207%20%C2%B7%20Vue%203%20%C2%B7%20Tailwind%204-0A0A0A?style=for-the-badge)
![render](<https://img.shields.io/badge/render-SSR%20(Node)-E63946?style=for-the-badge>)
![pages](https://img.shields.io/badge/pages-4-0A0A0A?style=for-the-badge)

> **Nota:** el prototipo HTML original se conserva como referencia de diseño en
> [`docs/prototype/`](./docs/prototype/). Todo el código vivo vive en
> [`src/`](./src/) y se construye con Astro.

---

## Tabla de contenidos

1. [Stack](#stack)
2. [Inicio rápido](#inicio-rápido)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Sistema de diseño](#sistema-de-dise%C3%B1o)
5. [Branding](#branding)
6. [Paleta de colores](#paleta-de-colores)
7. [Árbol de páginas](#%C3%A1rbol-de-p%C3%A1ginas)
8. [Tipografía](#tipograf%C3%ADa)
9. [Componentes](#componentes)
10. [Patrones](#patrones)
11. [Animaciones](#animaciones)
12. [Estrategia responsive](#estrategia-responsive)
13. [Convenciones](#convenciones)
14. [Migración desde el prototipo](#migraci%C3%B3n-desde-el-prototipo)

---

## Stack

| Capa           | Herramienta                                                              | Por qué                                                         |
| -------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------- |
| Framework      | **Astro 7** (`output: 'server'`)                                         | SSR por defecto, hidratación selectiva, multi-framework.        |
| Render         | **@astrojs/node** (standalone)                                           | Adapter Node para correr en cualquier host.                     |
| Interactividad | **Vue 3** (`@astrojs/vue`)                                               | Solo en islas (catálogo). El resto es HTML estático + Tailwind. |
| Estilos        | **Tailwind CSS 4** (vía `@tailwindcss/vite`)                             | CSS-first config, tokens como variables, JIT sin config JS.     |
| Tipografía     | **Google Fonts**                                                         | Archivo Black, Space Mono, Noto Sans JP, Inter.                 |
| Animaciones    | **CSS keyframes** nativas                                                | `marquee` y `rise` en `global.css`, sin librerías.              |
| Linter         | **ESLint 9** (flat config) + `typescript-eslint` + `eslint-plugin-astro` | Tipos estrictos, plugins Astro-aware.                           |
| Formateador    | **Prettier 3** + `prettier-plugin-astro`                                 | Un solo estilo, archivos `.astro` incluidos.                    |

### Lo que **no** usamos (intencionadamente)

- React/Next/Vite por sí solos
- Webpack/PostCSS
- Librería de iconos (los glifos bastan)
- Color libraries (CVA / Stitches) — son tokens CSS

---

## Inicio rápido

```bash
# Requisitos: Node ≥ 22.12
npm install
npm run dev        # http://localhost:4321
npm run build      # SSR (Node) → dist/server + dist/client
npm run preview    # sirve el build
npm run check      # astro check (TS + Astro)
npm run lint       # ESLint
npm run format     # Prettier --write
```

| Script                 | Acción                                        |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Dev server con HMR en `localhost:4321`.       |
| `npm run build`        | Compila cliente + servidor Node (standalone). |
| `npm run preview`      | Sirve `dist/server/entry.mjs`.                |
| `npm run check`        | `astro check` — types + Astro diagnostics.    |
| `npm run lint`         | ESLint sobre archivos `.ts/.astro/.mjs`.      |
| `npm run lint:fix`     | Igual + `--fix`.                              |
| `npm run format`       | Prettier `--write` sobre todo el repo.        |
| `npm run format:check` | Solo verifica el formato.                     |

---

## Estructura del proyecto

```
manga-brutalism-ui/
├── src/                          ← código fuente
│   ├── components/               ← componentes reutilizables (.astro / .vue)
│   │   ├── Breadcrumb.astro
│   │   ├── CatalogBrowser.vue    ← isla Vue (filtros + grid)
│   │   ├── ChapterList.astro
│   │   ├── ChapterRow.astro
│   │   ├── CoverArt.astro
│   │   ├── FinalCTA.astro
│   │   ├── GenreChip.astro
│   │   ├── GenreGrid.astro
│   │   ├── Logo.astro
│   │   ├── MangaCard.astro
│   │   ├── Marquee.astro
│   │   ├── RelatedMangas.astro
│   │   ├── SectionHeading.astro
│   │   ├── SiteFooter.astro
│   │   ├── SiteHeader.astro
│   │   ├── StatsGrid.astro
│   │   ├── StatsTile.astro
│   │   ├── TrendingCard.astro
│   │   └── TrendingStrip.astro
│   ├── data/
│   │   └── mangas.ts             ← data layer (migrable a Content Collections)
│   ├── layouts/
│   │   └── BaseLayout.astro      ← HTML wrapper, SEO, fuentes, schema.org
│   ├── lib/
│   │   └── site.ts               ← constantes de marca + navegación
│   ├── pages/                    ← file-based routing
│   │   ├── 404.astro
│   │   ├── catalogo.astro
│   │   ├── detalle.astro
│   │   └── index.astro
│   ├── styles/
│   │   └── global.css            ← tokens + @layer base/components/utilities
│   ├── types/
│   │   └── manga.ts              ← interfaces compartidas
│   └── env.d.ts
├── public/                       ← assets estáticos servidos as-is
│   ├── favicon.svg
│   └── og-default.svg
├── docs/
│   └── prototype/                ← HTML estático original (referencia)
├── astro.config.mjs              ← SSR + Vue + Tailwind + Node adapter
├── eslint.config.js              ← ESLint 9 flat config
├── tsconfig.json                 ← strict + path aliases
├── .prettierrc.json
├── .editorconfig
├── AGENTS.md
└── package.json
```

### Aliases de TypeScript (`tsconfig.json`)

| Alias           | Apunta a           |
| --------------- | ------------------ |
| `@/*`           | `src/*`            |
| `@components/*` | `src/components/*` |
| `@layouts/*`    | `src/layouts/*`    |
| `@data/*`       | `src/data/*`       |
| `@lib/*`        | `src/lib/*`        |
| `@styles/*`     | `src/styles/*`     |
| `@types/*`      | `src/types/*`      |

---

## Sistema de diseño

Todo el design system vive en **un solo archivo**: [`src/styles/global.css`](./src/styles/global.css).

### Tokens (Tailwind 4 CSS-first)

Los tokens viven dentro de `@theme { … }` y se exponen automáticamente como
utilidades de Tailwind (`bg-paper`, `text-ink`, `border-yellow`,
`font-display`, `text-[clamp(3.5rem,12vw,11rem)]`, etc.) sin archivo JS de
configuración.

- **Brand (4):** paper `#F2EDE4`, ink `#0A0A0A`, red `#E63946`,
  yellow `#FFB703`.
- **Covers (12):** ver tabla completa en el archivo — uno por título del
  catálogo actual (`--color-cover-berserk`, etc.).
- **Patrones:** `--pattern-dots`, `--pattern-dots-dark`, `--pattern-lines`,
  `--pattern-cross`, `--pattern-wash`.
- **Fuentes:** `--font-display`, `--font-mono`, `--font-jp`, `--font-body`.
- **Type scale:** `--text-hero`, `--text-page`, `--text-final`.
- **Spacing:** `--spacing: 4px`.

### Utilidades brutalistas

| Utilidad                                                              | Definición                                 | Uso                    |
| --------------------------------------------------------------------- | ------------------------------------------ | ---------------------- |
| `brutal-border`                                                       | `border: 3px solid var(--color-ink)`       | Borde universal        |
| `brutal-shadow`                                                       | `box-shadow: 6px 6px 0 0 var(--color-ink)` | CTA secundaria + cards |
| `brutal-shadow-red`                                                   | `box-shadow: 6px 6px 0 0 var(--color-red)` | CTA primaria           |
| `halftone` / `halftone-red`                                           | dot pattern radial                         | texturas de fondo      |
| `grid-bg`                                                             | líneas 48px a 6% ink                       | secciones              |
| `pat-dots` / `pat-dots-dark` / `pat-lines` / `pat-cross` / `pat-wash` | overlay en cada cover                      | ver `Patrones`         |
| `font-display` / `font-mono` / `font-jp` / `font-body`                | font stacks                                | tipografía             |
| `vertical-rl`                                                         | `writing-mode: vertical-rl`                | acentos kanji          |
| `marquee-track`                                                       | animación de desplazamiento                | ticker                 |
| `rise` + `d1`-`d5`                                                    | entrada escalonada                         | secciones              |
| `card-hover`                                                          | lift -3/-3 con sombra 9/9                  | cards                  |

### `@layer components` (compuestos)

`chip`, `btn-invert`, `cta-primary`, `tile-lift`, `logo-mark`,
`logo-mark__plate`, `logo-mark__glyph`, `trend-card`, `trend-scroll`,
`chapter-row`, `cover-frame`, `no-scrollbar`.

### Accesibilidad (`@layer base`)

- `html { scroll-behavior: smooth }` + `prefers-reduced-motion` honrado.
- `body { font-family: font-body }` con `font-feature-settings`.
- `::selection { background: ink; color: paper }`.
- `:focus-visible { outline: 3px solid var(--color-red); outline-offset: 2px }`.
- **Skip link** "Saltar al contenido principal" en `BaseLayout`.

---

## Branding

**Nombre:** `INK/PXL`

- `INK` → analógico (tinta del manga, tinta del cómic)
- `PXL` → digital (píxeles, lectura en pantalla)

**Sistema de volumenes:** cada página es un número (`Vol. 001 / 2026`).

**Logo mark:** cuadrado con borde 3px negro; un `#FFB703` se asienta 3px
detrás de un cuadrado `#F2EDE4` (mima el registro de tinta del print).
El cuadrado crema renderiza `!` en Archivo Black.

**Voz:** confiada, editorial, ligeramente rebelde. Registro magazine.

**Tagline (primario):** _Páginas que mueven al mundo._
**Tagline (secundario):** _Lee lo nuevo, lo clásico y lo que aún no sabes
que necesitas._

Definido en [`src/lib/site.ts`](./src/lib/site.ts) como constante `SITE`.

---

## Paleta de colores

### Tokens UI (4 colores)

| Token            | Hex       | Uso                                              |
| ---------------- | --------- | ------------------------------------------------ |
| `--color-paper`  | `#F2EDE4` | fondo, surface primaria                          |
| `--color-ink`    | `#0A0A0A` | texto, bordes, CTAs primarias, secciones oscuras |
| `--color-red`    | `#E63946` | acento manga, live indicators, primary CTA       |
| `--color-yellow` | `#FFB703` | acento cómic, covers destacados, stats           |

Las portadas individuales viven en `--color-cover-*` (ver `global.css`).

---

## Árbol de páginas

```
/
├── /                          ← landing (era hero-mangas-comics.html)
│   ├── Marquee
│   ├── SiteHeader
│   ├── Hero block
│   ├── TrendingStrip
│   ├── Catálogo destacado (8 cards)
│   ├── StatsGrid
│   ├── GenreGrid
│   ├── FinalCTA
│   └── SiteFooter
├── /catalogo                  ← era catalogo.html
│   ├── Marquee · SiteHeader (sticky)
│   ├── Page header
│   ├── Sticky filter bar (Vue island)
│   ├── Card grid (rendered by Vue)
│   ├── Paginación
│   └── SiteFooter
├── /detalle?slug=berserk      ← era detalle.html (Berserk canónico)
│   ├── Marquee · SiteHeader · Breadcrumb
│   ├── Cover + info (split 3/9)
│   ├── StatsGrid
│   ├── ChapterList
│   ├── RelatedMangas (4 mini cards, ordered by genre overlap)
│   └── SiteFooter
└── /404                       ← custom not-found
```

---

## Tipografía

Cuatro familias vía Google Fonts, declaradas en `BaseLayout`:

| Familia       | Variable         | Uso                        |
| ------------- | ---------------- | -------------------------- |
| Archivo Black | `--font-display` | titles, display, headlines |
| Space Mono    | `--font-mono`    | meta, labels, badges       |
| Noto Sans JP  | `--font-jp`      | acentos kanji              |
| Inter         | `--font-body`    | body copy                  |

### Type scale (fluid)

| Rol          | Móvil → Desktop       | Implementación                    |
| ------------ | --------------------- | --------------------------------- |
| Hero H1      | `3.5rem → 11rem`      | `text-[clamp(3.5rem,12vw,11rem)]` |
| Catálogo H1  | `2.8rem → 7rem`       | `text-[clamp(2.8rem,8vw,7rem)]`   |
| Final CTA H2 | `2rem → 5rem`         | `text-[clamp(2rem,6vw,5rem)]`     |
| Card title   | `1rem → 1.25rem`      | `text-base md:text-xl`            |
| Caption mono | `0.6875rem → 0.75rem` | `text-[11px]` / `text-xs`         |
| Micro tag    | `0.5rem → 0.625rem`   | `text-[8px]` / `text-[9px]`       |

**Tracking:** todos los labels mono usan `tracking-[0.18em]` a
`tracking-[0.22em]`. Display usa `tracking-tighter` (-0.05em). Body usa
default.

---

## Componentes

| Componente       | Tipo                           | Ubicación                                   |
| ---------------- | ------------------------------ | ------------------------------------------- |
| `BaseLayout`     | layout                         | `src/layouts/`                              |
| `Logo`           | astro                          | `src/components/`                           |
| `Marquee`        | astro                          | `src/components/`                           |
| `SiteHeader`     | astro                          | `src/components/`                           |
| `SiteFooter`     | astro                          | `src/components/`                           |
| `SectionHeading` | astro                          | `src/components/`                           |
| `Breadcrumb`     | astro                          | `src/components/`                           |
| `CoverArt`       | astro                          | `src/components/`                           |
| `MangaCard`      | astro                          | `src/components/` (var. `default` / `mini`) |
| `TrendingCard`   | astro                          | `src/components/`                           |
| `TrendingStrip`  | astro                          | `src/components/`                           |
| `ChapterRow`     | astro                          | `src/components/`                           |
| `ChapterList`    | astro                          | `src/components/`                           |
| `RelatedMangas`  | astro                          | `src/components/`                           |
| `StatsTile`      | astro                          | `src/components/`                           |
| `StatsGrid`      | astro                          | `src/components/`                           |
| `GenreChip`      | astro                          | `src/components/`                           |
| `GenreGrid`      | astro                          | `src/components/`                           |
| `FinalCTA`       | astro                          | `src/components/`                           |
| `CatalogBrowser` | **vue island** (`client:load`) | `src/components/`                           |

---

## Patrones

Cinco overlays reusables para portadas. Siempre apilados sobre un color sólido:

| Patrón          | Efecto                       | Mejor para                               |
| --------------- | ---------------------------- | ---------------------------------------- |
| `pat-dots`      | dots blancos 15%             | covers brillantes (rojo, amarillo, azul) |
| `pat-dots-dark` | dots negros 20%              | covers amarillas con contraste invertido |
| `pat-lines`     | stripes 45° 10% blanco       | covers cálidos (naranja, marrón, teal)   |
| `pat-cross`     | crosshatch 0/90 8% blanco    | covers oscuras (negro, púrpura, slate)   |
| `pat-wash`      | gradient diagonal 15% blanco | covers muted (cocoa, forest, charcoal)   |

Para fondos de sección:

| Patrón         | Uso                                      |
| -------------- | ---------------------------------------- |
| `grid-bg`      | Hero / catálogo (líneas 48px al 6% ink)  |
| `halftone`     | `FinalCTA` (dots negros 32% sobre paper) |
| `halftone-red` | Card featured "Leyendo ahora"            |

---

## Animaciones

### Marquee — news ticker

```css
@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}
```

`marquee-track { animation: marquee 38s linear infinite; }` aplicado al
contenedor que tiene el doble del contenido (duplicado con `aria-hidden`).

### Rise on load — entrada de página

```css
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.rise {
  animation: rise 0.7s ease-out both;
}
```

Stagger vía `.d1`-`.d5` (50–450ms).

### Hover

| Elemento            | Hover                                           |
| ------------------- | ----------------------------------------------- |
| `.card-hover`       | `translate(-3px,-3px)` + shadow `9px 9px 0`     |
| `.cta-primary`      | `translate(2px,2px)` + shadow `0 0 transparent` |
| `.btn-invert`       | invierte paper ↔ ink                            |
| `.logo-mark__plate` | offset 3/3 → 5/5                                |
| `.chip`             | invierte a bg-ink                               |

### Reduced motion

Honrado vía `@media (prefers-reduced-motion: reduce)` que anula todas las
animaciones y el smooth scroll.

---

## Estrategia responsive

Breakpoints de Tailwind 4 (default):

| Breakpoint | px                      |
| ---------- | ----------------------- |
| `sm`       | 640                     |
| `md`       | 768 (shift primario)    |
| `lg`       | 1024 (shift secundario) |
| `xl`       | 1280                    |

### Shifts clave

| Elemento          | Móvil      | Desktop                   |
| ----------------- | ---------- | ------------------------- |
| Nav links         | oculto     | inline (`lg:flex`)        |
| Hero grid         | 12 stacked | `8 + 4` split             |
| Catalog grid      | 2 cols     | 3 cols (md) / 4 cols (lg) |
| Trend cards       | 150px      | 170px (md+)               |
| Cover/info        | 12 stacked | `3 + 9` (lg)              |
| Container padding | `px-6`     | `md:px-12`                |

Mobile-first: cada clase base vale en móvil y los modificadores `md:` / `lg:`
escalan.

---

## Convenciones

Verificá esto antes de mergear:

- [ ] HTML semántico: `<header>`, `<nav>`, `<main>`, `<section>` con
      `<h1>` único por página, `<h2>` por sección, `<h3>` por item.
- [ ] Astro components terminan en `.astro`, Vue components en `.vue`.
- [ ] Solo se importa Vue cuando hay estado cliente; el resto es Astro estático.
- [ ] Cover images: `aspect-[3/4]` + uno de `pat-dots | pat-lines | pat-cross | pat-wash`.
- [ ] Todos los badges mono llevan `tracking-[0.15em]` y `text-[9px]`–`text-[10px]`.
- [ ] Body copy con `max-w-md` (párrafo) o `max-w-3xl` (long form).
- [ ] Sin raw hex en componentes — usá `bg-paper`, `text-red`, etc.
- [ ] Una variante por archivo: si dos sitios lo necesitan, va a
      `src/components/`.
- [ ] Tipos en `src/types/`. Constantes de marca en `src/lib/site.ts`. Data
      en `src/data/`.
- [ ] Sin `console.log` en commit (`no-console` warn activo).
- [ ] Ejecutar `npm run lint && npm run format && npm run check` antes de abrir PR.

---

## Migración desde el prototipo

1. **HTML estático** preservado en [`docs/prototype/`](./docs/prototype/)
   como referencia de copy y patrones visuales. No se sirve al cliente.
2. **Pages** migradas 1:1:
   - `hero-mangas-comics.html` → `src/pages/index.astro`
   - `catalogo.html` → `src/pages/catalogo.astro`
   - `detalle.html` → `src/pages/detalle.astro`
3. **Componentes reusables** detectados durante la migración:
   - `<header>` del prototipo → `SiteHeader` (logo + nav + CTA).
   - `<footer>` → `SiteFooter`.
   - Marquee bar → `Marquee` (contenido en `MARQUEE_ITEMS`).
   - Stats tile (4 variantes) → `StatsTile` + `StatsGrid` con prop `tone`.
   - Card (4 variantes — featured/trending/catalog/related) → `MangaCard`
     con `variant` o `TrendingCard`.
   - Genre chip → `GenreChip` + `GenreGrid`.
   - Chapter row → `ChapterRow` + `ChapterList`.
   - Breadcrumb → `Breadcrumb`.
   - Final CTA banner → `FinalCTA`.
   - Filtros del catálogo → `CatalogBrowser.vue` (isla Vue interactiva).

---

## Licencia

El sistema de diseño, el código y los patrones CSS están liberados bajo
**CC0** (dominio público).

Los títulos de manga, autores y datos referenciados son propiedad de sus
titulares (Shueisha, Kodansha, Hakusensha, DC Comics, Image Comics, etc.) y
se usan aquí solo como demo de diseño.

---

> Hecho con tinta y píxeles. Vol. 001 / 2026.
# manga-page-brutalism
#   m a n g a - p a g e - b r u t a l i s m  
 #   m a n g a - p a g e - b r u t a l i s m  
 