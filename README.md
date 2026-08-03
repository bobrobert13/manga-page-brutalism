# INK/PXL — Manga Brutalism UI

Sitio de lectura de manga y cómic construido con Astro 7, Vue 3 y Tailwind CSS 4. Usa SSR sobre Node, autenticación con Clerk e islas Vue para el catálogo y el visor.

## Requisitos

- Node.js 22.12 o superior
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
├─ components/          Componentes Astro, islas Vue y UI del visor
├─ composables/
│  ├─ catalog/          Filtros y estrategias reactivas
│  ├─ viewer/           Estado y coordinación del lector
│  └─ shared/           Comportamientos Vue reutilizables
├─ config/              Constantes, rutas y defaults tipados
├─ data/
│  ├─ catalog/          Fixtures de mangas, capítulos y géneros
│  └─ marketing/        Contenido estático de presentación
├─ layouts/             Layout base y composición de autenticación
├─ pages/               Rutas Astro SSR
├─ services/
│  ├─ account/          Acceso server-only a Clerk
│  ├─ catalog/          Contrato y servicios fixture/API
│  ├─ marketing/        Fachada de contenido estático
│  └─ shared/           Axios, Result y errores normalizados
├─ styles/              Tokens y estilos globales
└─ types/               Tipos compartidos de UI
```

Principios principales:

- `src/config/index.config.ts` es la fachada pública de constantes.
- Las páginas y componentes no importan fixtures directamente.
- Los servicios son factorías funcionales, no clases ni repositories.
- Los fallos externos esperables usan `ServiceResult<T>`.
- Los tokens se resuelven por operación y nunca se guardan en defaults globales de Axios.
- Astro renderiza por servidor de forma predeterminada; solo las rutas inmutables se prerenderizan.
- Los composables están agrupados por bounded context.

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
- TypeScript estricto
- ESLint 9 con plugins de Astro y Vue
- Prettier
- Vitest

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
