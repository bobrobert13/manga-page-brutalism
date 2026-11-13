# INK/PXL — Manga Brutalism UI

Sitio de lectura de manga y cómic construido con Astro 7, Vue 3 y Tailwind CSS 4. Usa SSR sobre Node, autenticación con Clerk e islas Vue para el catálogo y el visor.

## Requisitos

- Node.js 24.16 o superior (LTS Krypton; `.nvmrc` fija 24.22.3, usar `fnm use`)
- npm
- claves de Clerk para las rutas de autenticación

## Inicio rápido

```bash
npm install
npm run dev
```

El servidor local escucha en `http://localhost:4321`.

Por instrucciones del proyecto, cuando un agente inicie el servidor debe usar el modo background de Astro:

```bash
npx astro dev --background
npx astro dev status
npx astro dev logs
npx astro dev stop
```

## Scripts

| Script                 | Acción                                      |
| ---------------------- | ------------------------------------------- |
| `npm run dev`          | Inicia Astro en desarrollo.                 |
| `npm run build`        | Genera el servidor Node standalone.         |
| `npm run preview`      | Ejecuta una vista previa del build.         |
| `npm run check`        | Valida TypeScript, Astro y Vue.             |
| `npm run lint`         | Ejecuta ESLint sobre TS, Astro y Vue.       |
| `npm run test`         | Ejecuta las pruebas con Vitest.             |
| `npm run format`       | Formatea el repositorio con Prettier.       |
| `npm run format:check` | Verifica el formato sin modificar archivos. |

## Variables de entorno

Copia `.env.example` a `.env`. Astro valida las variables `PUBLIC_*` en `astro.config.mjs`:

```dotenv
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# fixture | api
PUBLIC_CATALOG_SOURCE=fixture
PUBLIC_API_BASE_URL=/api
PUBLIC_API_TIMEOUT_MS=10000
```

La fuente `fixture` es el valor predeterminado. `api` activa el servicio Axios contra el contrato descrito en [docs/architecture.md](./docs/architecture.md).

## Arquitectura

```text
src/
├─ components/ui/       Kit genérico: navigators/, texts/, effects/
├─ features/            Dominio por feature: catalog/, viewer/, detail/, home/, auth/
│  └─ <feature>/        components/, composables/, lib/
├─ composables/
│  ├─ services/         account/, catalog/, marketing/, shared/
│  └─ shared/           Comportamientos Vue reutilizables (useFocusTrap)
├─ config/              domain/, ui/ e index.config.ts como fachada
├─ data/
│  ├─ catalog/          Fixtures de mangas, capítulos y géneros
│  └─ marketing/        Contenido estático de presentación
├─ layouts/             BaseLayout y AuthLayout
├─ pages/               Rutas Astro SSR
├─ styles/              Tokens y estilos globales
├─ types/               Tipos compartidos de UI
└─ middleware.ts        Protección de rutas con Clerk
```

Principios principales:

- `src/config/index.config.ts` es la fachada pública de constantes.
- Las páginas y componentes no importan fixtures directamente.
- Los servicios son factorías funcionales, no clases ni repositories.
- Los fallos externos esperables usan `ServiceResult<T>`.
- Los tokens se resuelven por operación y nunca se guardan en defaults globales de Axios.
- Astro renderiza por servidor de forma predeterminada; solo las rutas inmutables se prerenderizan.
- La lógica reactiva vive en `features/<feature>/composables/`; los servicios, en `composables/services/`.

La explicación completa está en [docs/architecture.md](./docs/architecture.md). El plan y diagnóstico del refactor están en [docs/plans/2026-08-03-codebase-architecture-refactor.md](./docs/plans/2026-08-03-codebase-architecture-refactor.md).

## Rutas principales

| Ruta                                      | Renderizado    | Descripción                       |
| ----------------------------------------- | -------------- | --------------------------------- |
| `/`                                       | SSR            | Landing y títulos destacados.     |
| `/catalogo`                               | SSR + isla Vue | Búsqueda, filtros y ordenamiento. |
| `/titulo/[slug]`                          | SSR            | Detalle y capítulos del título.   |
| `/titulo/[slug]/[chapter]`                | SSR + isla Vue | Visor de lectura.                 |
| `/og/[slug].svg`                          | Endpoint SSR   | Open Graph dinámico.              |
| `/login`, `/registro`, `/recuperar-clave` | SSR            | Flujos Clerk.                     |
| `/cuenta`                                 | SSR protegido  | Perfil del lector.                |
| `/404`                                    | Prerender      | Página de recurso no encontrado.  |

## Stack

- Astro 7 con `@astrojs/node`
- Vue 3
- Tailwind CSS 4
- Clerk
- Axios
- TypeScript 6 estricto
- ESLint 10 con plugins de Astro y Vue
- Prettier
- Vitest 5 + MSW 3

## Validación

Antes de abrir un PR:

```bash
npm run format:check
npm run lint
npm run check
npm run test
npm run build
```

## Licencia

El sistema de diseño y el código del prototipo se distribuyen bajo CC0. Los títulos, autores y datos editoriales usados como demostración pertenecen a sus respectivos titulares.
