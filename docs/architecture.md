# Arquitectura de aplicación

INK/PXL usa Astro con SSR por defecto, islas Vue para interacción y una capa ligera de servicios funcionales. La arquitectura evita clases y Repository pattern: cada contexto expone un objeto de funciones tipado.

## Flujo de datos

```text
Página Astro / composable Vue
            ↓
      servicio funcional
            ↓
 fixture local o cliente Axios
            ↓
 ServiceResult<T> + ServiceError
```

Las páginas y componentes no importan fixtures. `src/data` solo almacena datos estáticos; `src/services` decide cómo obtenerlos.

## Carpetas principales

- `src/config`: constantes cohesionadas. `index.config.ts` es la fachada pública.
- `src/data/catalog`: fixtures del catálogo y capítulos.
- `src/data/marketing`: contenido estático de presentación.
- `src/services/shared`: Axios, `ServiceResult` y normalización de errores.
- `src/services/catalog`: contrato, endpoints y servicios fixture/API.
- `src/services/account`: acceso server-only a Clerk y mapeo de perfil.
- `src/composables/catalog`: estado reactivo y estrategias de filtrado/orden.
- `src/composables/viewer`: coordinación del lector.
- `src/composables/shared`: comportamientos Vue reutilizables.

## Servicios

Un servicio es una factoría sin estado reactivo:

```ts
const service = useCatalogService({
  client: api,
  getToken: async () => tokenActual,
});

const result = await service.getBySlug('berserk', { signal });
if (!result.ok) {
  // La página decide status, mensaje o retry.
}
```

Reglas:

- resolver tokens en cada llamada;
- no modificar globalmente `api.defaults.headers`;
- no acceder a stores en el scope superior de un módulo;
- aceptar `AbortSignal` en operaciones externas;
- devolver `ServiceResult` para fallos esperables;
- no registrar y relanzar el mismo error en cada servicio;
- mantener DTOs fuera de componentes y mapearlos solo cuando difieran del modelo usado.

## Fuente del catálogo

La variable `PUBLIC_CATALOG_SOURCE` selecciona `fixture` o `api`. Ambas implementaciones cumplen `CatalogService`.

Variables disponibles:

```dotenv
PUBLIC_CATALOG_SOURCE=fixture
PUBLIC_API_BASE_URL=/api
PUBLIC_API_TIMEOUT_MS=10000
```

El contrato HTTP inicial espera:

- `GET /mangas`
- `GET /mangas/:slug`
- `GET /genres`
- `GET /mangas/:slug/chapters`
- `GET /mangas/:slug/chapters/:chapter/page-count`

La fuente por defecto sigue siendo `fixture` hasta que un backend implemente este contrato.

## SSR y autenticación

`output: 'server'` hace SSR por defecto. Solo rutas realmente inmutables declaran `prerender = true`.

Clerk se ejecuta desde middleware. Las páginas protegidas usan `Astro.locals.auth()` y `useAccountService(Astro)`. Los datos personalizados envían `Cache-Control: private, no-store`; el catálogo público declara su política de caché en `HTTP_CONFIG`.

## Validación

Antes de entregar cambios:

```bash
npm run format:check
npm run lint
npm run check
npm run test
npm run build
```
