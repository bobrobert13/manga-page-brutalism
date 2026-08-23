<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-08-23 | Updated: 2026-08-23 -->

# composables/

## Purpose

Comportamientos Vue reutilizables y capa de servicios funcionales. Dividido en dos zonas: `shared/` para utilidades Vue genéricas, `services/` para acceso a datos y comunicación externa.

## Subdirectories

| Directory   | Purpose                                                       | Files                      |
| ----------- | ------------------------------------------------------------- | -------------------------- |
| `shared/`   | Comportamientos Vue reutilizables entre features              | `useFocusTrap.ts` (+ test) |
| `services/` | Capa de acceso a datos — factorías funcionales sin estado Vue | (see below)                |

## Services Breakdown

### `services/shared/` — Infraestructura HTTP

| File                      | Description                                     |
| ------------------------- | ----------------------------------------------- |
| `api.client.ts`           | Cliente Axios base con interceptores            |
| `service-result.ts`       | Tipo `ServiceResult<T>` — éxito/fallo tipado    |
| `service-error.ts`        | Tipo `ServiceError` con código HTTP             |
| `service-error.mapper.ts` | Normalización de errores Axios → `ServiceError` |

### `services/catalog/` — Catálogo de Mangas

| File                          | Description                                                                                    |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| `catalog-service.contract.ts` | Interfaz `CatalogService` — contrato para fixture y API                                        |
| `catalog.endpoints.ts`        | URLs y parámetros del API REST                                                                 |
| `catalog.mapper.ts`           | Mapeo DTOs → modelos de dominio (`isManga`, etc.)                                              |
| `catalog.queries.ts`          | Funciones de consulta sobre datos locales                                                      |
| `useCatalogService.ts`        | Implementación HTTP del contrato                                                               |
| `useCatalogFixtureService.ts` | Implementación con fixtures locales                                                            |
| `index.ts`                    | Factory `useConfiguredCatalogService` — selecciona fixture o API según `PUBLIC_CATALOG_SOURCE` |

### `services/account/` — Autenticación

| File                   | Description                                        |
| ---------------------- | -------------------------------------------------- |
| `useAccountService.ts` | Acceso server-only a Clerk (`Astro.locals.auth()`) |
| `account.types.ts`     | Tipos de perfil de usuario                         |

### `services/marketing/` — Contenido Estático

| File                     | Description                          |
| ------------------------ | ------------------------------------ |
| `useMarketingContent.ts` | Datos de landing page desde fixtures |

## For AI Agents

### Working In This Directory

- `shared/`: solo comportamientos Vue puros (sin HTTP, sin fixtures)
- `services/`: factorías `useXService` que devuelven objetos de funciones tipadas
- Servicios NUNCA usan APIs reactivas de Vue (`ref`, `computed`, `watch`)
- Todo acceso externo devuelve `ServiceResult<T>` — nunca lanzar excepciones sin capturar
- Siempre aceptar `AbortSignal` en operaciones de red
- Resolver token de auth por llamada, no cachear en scope de módulo

### Service Pattern

```ts
// Factory recibe dependencias, devuelve objeto de funciones
const service = useCatalogService({ client: api, getToken });
const result = await service.getBySlug('berserk', { signal });
if (!result.ok) {
  /* manejar result.error */
}
```

### Testing Requirements

- Tests de servicios HTTP usan MSW — no mockear Axios directamente
- `useCatalogService.test.ts` y `useCatalogFixtureService.test.ts` comparten contrato via `tests/contracts/catalogService.contract.ts`
- El test de contrato se ejecuta contra ambas implementaciones (fixture y HTTP)
- Servicios sin tests: `useMarketingContent.ts`

### Common Patterns

- `ServiceResult<T>` = `{ ok: true, data: T }` | `{ ok: false, error: ServiceError }`
- `ServiceError` = `{ status: number, code: string, detail: string }`
- `toServiceError(error: unknown): ServiceError` — normaliza cualquier error
- `createServiceError(status, code, detail)` — factory para errores de negocio

## Dependencies

### Internal

- `config/index.config.ts` — `HTTP_CONFIG`, `PUBLIC_CATALOG_SOURCE`
- `data/` — fixtures (solo `useCatalogFixtureService` y `useMarketingContent`)
- `types/` — interfaces de dominio

### External

- `axios` — HTTP client
- `@clerk/astro` — server-side auth (solo `useAccountService`)
- `msw` — testing (solo tests)

<!-- MANUAL: -->
