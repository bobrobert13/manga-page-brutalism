# Plan de refactor arquitectónico y buenas prácticas

**Estado:** implementado y revalidado  
**Rama:** `refactor/codebase-architecture`  
**Base:** `develop` (incluye un commit local por delante de `origin/develop`)  
**Fecha:** 2026-08-03

## 1. Objetivo

Mejorar legibilidad, mantenibilidad y capacidad de evolución hacia un backend real sin convertir el prototipo en una arquitectura ceremonial. El resultado debe:

- centralizar constantes estables y configuración pública en `src/config/index.config.ts`;
- separar datos de prueba, tipos de aplicación y servicios externos;
- encapsular Axios, endpoints, tokens y errores en servicios/composables pequeños por dominio;
- representar fallos esperables con `Result` y errores normalizados;
- organizar composables por contexto (`catalog`, `viewer`, `shared`);
- conservar el comportamiento visual y funcional existente;
- trabajar correctamente con SSR y evitar filtrar secretos o estado entre solicitudes;
- incorporar validación automatizada suficiente para hacer el refactor con seguridad.

No se propone un framework DDD, Repository pattern, CQRS, un contenedor de inyección de dependencias ni un event bus global.

## 2. Línea base verificada

| Validación | Estado actual |
| --- | --- |
| `npm run check` | Pasa: 0 errores y 0 advertencias |
| `npm run build` | Pasa; SSR Node con `output: 'server'` |
| `npm run lint` | Pasa, incluyendo archivos Vue |
| `npm run format:check` | Pasa en todo el repositorio |
| Pruebas automatizadas | 11 pruebas Vitest sobre servicios, queries, sort y codecs |
| Smoke SSR | Pasa en home, catálogo, detalle, capítulo, OG, auth y casos 404 |
| Auditoría runtime | 0 altas/críticas; queda 1 moderada transitiva en PostCSS |
| CodeGraph | Existe `.codegraph/`, pero no hay CLI ni herramienta MCP disponible en la sesión; el diagnóstico usó inspección local como fallback |

## 3. Hallazgos priorizados

### Prioridad alta

1. **La estrategia de renderizado no refleja el objetivo declarado.** `astro.config.mjs` usa `output: 'static'`; solo algunas rutas tienen `prerender = false`. Si la mayoría de páginas consumirá datos actuales o personalizados, conviene `output: 'server'` y prerender explícito de las pocas rutas inmutables.
2. **`src/data/mangas.ts` mezcla responsabilidades.** En 381 líneas conviven fixtures, contenido de marketing, estadísticas, capítulos, conteos de páginas, selectores y reglas de fallback. Las páginas dependen directamente de esta implementación.
3. **No existe frontera de servicios.** Páginas y componentes importan arrays y ejecutan búsquedas, ordenamientos y relaciones. Tampoco existe un lugar único para Axios, endpoints, autenticación o normalización de errores.
4. **Los modelos actuales están orientados a presentación, no a backend.** `rating`, `volumeCount`, `publishedAt` y `number` son textos de UI; `publishedAt` incluso contiene fechas relativas. Los estados y tipos usan etiquetas localizadas como identidad de dominio.
5. **Se ocultan estados inválidos.** `BERSERK` usa `as Manga`; `getChapterPageCount()` inventa 12 páginas si no hay datos; varias rutas redirigen a `/404` o al catálogo en vez de responder con el estado HTTP correcto.
6. **Configuración duplicada y hardcoded.** Marca, URL, locale, rutas de autenticación, rutas de navegación, claves de `localStorage`, timeouts y estados están repartidos entre `astro.config.mjs`, `src/lib/site.ts`, middleware, layouts, páginas, componentes y composables. `src/config/index.config.ts` está vacío.
7. **Acceso de cuenta con tipos inseguros.** `cuenta.astro` fuerza `Astro.locals` mediante `unknown` y vuelve a definir parcialmente el shape de usuario dentro de la página.

### Prioridad media

1. **La opción “Más recientes” no está implementada.** En `CatalogBrowser.vue`, `recent` cae en la estrategia por defecto de popularidad.
2. **Persistencia con falso genérico.** `useViewerPersistence.read<T>()` devuelve siempre texto de `localStorage` y lo fuerza a `T`; el número de página depende de coerción implícita.
3. **El visor concentra estado y efectos del navegador.** `useViewerState` mezcla navegación, fullscreen, tema, onboarding, feedback y almacenamiento. El import de `useViewerUrlSync` en `MangaViewer.vue` no se ejecuta.
4. **Fullscreen es optimista.** El estado cambia antes de confirmar la promesa del navegador y no escucha `fullscreenchange`; puede desincronizarse al salir con controles nativos.
5. **Errores silenciados sin observabilidad.** Varias operaciones de storage, history y fullscreen tragan cualquier error. El fail-soft es válido para UX, pero no debe impedir clasificación, diagnóstico o feedback cuando corresponda.
6. **Lógica de presentación duplicada.** Estado→clase CSS, SVG patterns, luminosidad y escape XML aparecen en más de una ubicación.
7. **No hay caracterización automática.** El refactor de filtros, rutas, mappers, persistencia y navegación carece de red de seguridad.

### Prioridad baja / limpieza

- `CatalogBrowser.vue` tiene un `onMounted` sin efecto.
- `useViewerChromeVisible.ts` importa `ref` después de las declaraciones.
- `_enabled` nunca cambia en `useViewerKeyboard.ts`.
- Las páginas construyen rutas mediante interpolación repetida.
- `AuthLayout` duplica head, canonical y script de tema de `BaseLayout`.

## 4. Arquitectura objetivo pragmática

Se mantendrán las páginas Astro y los componentes actuales. La separación nueva será ligera: servicios/composables por contexto, un cliente Axios compartido y datos estáticos segregados. No habrá capas Repository/Domain/Application.

```text
src/
├─ config/
│  ├─ index.config.ts          # punto único de importación
│  ├─ site.config.ts
│  ├─ routes.config.ts
│  ├─ auth.config.ts
│  ├─ catalog.config.ts
│  └─ viewer.config.ts
├─ services/
│  ├─ shared/
│  │  ├─ api.client.ts         # instancia/factoría Axios
│  │  ├─ service-result.ts
│  │  ├─ service-error.ts
│  │  └─ service-error.mapper.ts
│  ├─ catalog/
│  │  ├─ catalog.endpoints.ts
│  │  ├─ catalog.types.ts
│  │  ├─ catalog-service.contract.ts
│  │  ├─ catalog.mapper.ts     # solo si el DTO difiere de la UI
│  │  ├─ useCatalogService.ts
│  │  └─ useCatalogFixtureService.ts
│  ├─ reader/
│  │  ├─ reader.endpoints.ts
│  │  └─ useReaderService.ts
│  └─ account/
│     ├─ account.types.ts
│     └─ useAccountService.ts
├─ data/
│  ├─ catalog/
│  │  ├─ mangas.fixture.ts
│  │  └─ chapters.fixture.ts
│  └─ marketing/
│     ├─ home.fixture.ts
│     └─ stats.fixture.ts
└─ composables/
   ├─ catalog/
   │  ├─ useCatalogFilters.ts
   │  └─ catalog-sort.strategies.ts
   ├─ viewer/
   │  ├─ useViewerController.ts
   │  ├─ useViewerState.ts
   │  ├─ useViewerPersistence.ts
   │  └─ ...
   └─ shared/
      └─ useFocusTrap.ts
```

Los nombres finales podrán reducirse si un folder queda con un único archivo sin expectativa real de crecimiento.

Un “servicio” será una factoría de funciones, similar al ejemplo aportado, no una clase. Su API esperada será de este estilo:

```ts
export function useCatalogService(options: CatalogServiceOptions = {}) {
  const client = options.client ?? api;

  async function getManga(
    slug: string,
    request: ServiceRequestOptions = {},
  ): Promise<ServiceResult<Manga>> {
    try {
      const token = await options.getToken?.();
      const response = await client.get<MangaDto>(CATALOG_ENDPOINTS.detail(slug), {
        signal: request.signal,
        headers: buildAuthHeaders(token),
      });

      return success(mapManga(response.data));
    } catch (error) {
      return failure(toServiceError(error));
    }
  }

  return { getManga };
}
```

Las dependencias opcionales (`client`, `getToken`) permiten probar el servicio sin mocks globales. Las opciones propias de cada petición, como `signal`, se pasan a la operación para no conservar estado entre llamadas. En producción se usan defaults centralizados.

Cada contexto tendrá un contrato TypeScript ligero para que las implementaciones fixture y HTTP no diverjan. Es únicamente un objeto de funciones tipado, no un Repository ni una capa adicional. Los servicios serán agnósticos a Vue y seguros para SSR; los composables de `src/composables` sí concentrarán estado reactivo, loading y coordinación de UI.

## 5. Uso deliberado de patrones

### Result pattern

Se usará en llamadas externas y parseo de respuestas. La forma será una unión discriminada simple:

```ts
type ServiceResult<T, E extends ServiceError = ServiceError> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

No se envolverán en `Result` funciones puras triviales ni APIs de Vue. Los errores de programación seguirán fallando rápido. Las funciones de servicio no harán `console.error` y después `throw` para fallos esperables: devolverán un resultado tipado para que la página o componente decida el mensaje, status o retry.

Categorías mínimas de error: `validation`, `not_found`, `unauthorized`, `forbidden`, `network`, `timeout`, `unavailable` y `unknown`. `ServiceError` tendrá código estable, mensaje seguro para UI, causa opcional, status HTTP opcional y bandera `retryable`.

### Servicios funcionales por dominio

Cada bounded context tendrá un `useXService` que devuelve las operaciones disponibles. El servicio centraliza endpoints, Axios, headers, cancelación, mapeo y errores. No dependerá directamente de componentes ni accederá a un store en el scope del módulo.

Mientras no exista backend, `useCatalogFixtureService` ofrecerá el mismo conjunto pequeño de funciones que `useCatalogService`. La selección se hará en un único punto de composición/configuración; no se crearán repositorios ni clases.

El orden del catálogo sí se implementará como mapa de funciones puras (`popular`, `az`, `za`, `recent`, `rating`) y tendrá pruebas. Es un Strategy sencillo, sin jerarquías de clases.

### Mapper de respuesta

Los DTO del backend no se exportarán a componentes. Cuando su forma sea distinta, un mapper pequeño convertirá IDs, fechas ISO, rating numérico, status codes y cover data al tipo consumido por la aplicación. Si DTO y modelo coinciden, no se añadirá un mapper artificial.

### Mediator ligero

El `provide/inject` existente es suficiente como mediador local del visor. Se renombrará/concentrará la coordinación en `useViewerController`, que compondrá keyboard, gestures, URL sync, persistence, fullscreen y feedback. No se creará un bus global.

## 6. Política para `index.config.ts`

`src/config/index.config.ts` será el punto público y tipado de configuración, preferentemente reexportando configuraciones cohesionadas. Contendrá o expondrá:

- `SITE_CONFIG`: nombre, descripción, locale, autor y metadata;
- `ROUTES`: constantes y builders (`title(slug)`, `chapter(slug, number)`, login con redirect);
- `AUTH_CONFIG`: rutas públicas/protegidas y redirects;
- `CATALOG_CONFIG`: status codes, media types, opciones de sort, paginación y límites;
- `VIEWER_CONFIG`: modos, timeouts, thresholds, defaults y claves de storage;
- mensajes de error estáticos que deban ser consistentes.

No se volcarán allí fixtures, copy editorial extenso, datos que vienen del backend ni clases CSS. Las URLs/secretos variables por ambiente usarán el esquema tipado de `astro:env`; los secretos serán solo de servidor.

Se eliminará la duplicación entre `astro.config.mjs` y `src/lib/site.ts`. Durante la ejecución se verificará que el config compartido se pueda importar de forma segura desde `astro.config.mjs`; si el ciclo de carga de Astro lo impide, se mantendrá un módulo neutral compartido y `index.config.ts` seguirá siendo la fachada de `src`.

## 7. Capa HTTP y SSR

1. Añadir `axios` como dependencia de runtime.
2. Crear una instancia Axios base para peticiones públicas y una factoría por request solo cuando transporte cookies/tokens o metadata del usuario.
3. Resolver el token al ejecutar la operación, no una sola vez al crear/importar el módulo.
4. Aceptar `AbortSignal` para cancelación.
5. Normalizar `AxiosError` en `ServiceError`; nunca exponer bodies internos, tokens o stack traces al cliente.
6. No reintentar mutaciones automáticamente. Un eventual retry de GET será acotado y solo para errores transitorios.
7. Preferir BFF same-origin para islas Vue: Vue llama a un endpoint Astro; el endpoint Astro llama al backend. Así credenciales y URL privadas no entran al bundle cliente.
8. Definir cache por ruta: catálogo público con política explícita; cuenta y datos personalizados con `private/no-store`.

Por compatibilidad SSR, se evitará este patrón en el scope superior del módulo:

```ts
const store = useUserStore();
const token = store.getCode;
```

En Vue, el store se obtendrá dentro de `setup`/la función composable y el token se leerá al momento de cada llamada. En frontmatter Astro, middleware o endpoints, el token/contexto se pasará explícitamente al servicio. El proyecto usa Clerk, por lo que no se añadirá Pinia únicamente para imitar el ejemplo.

La recomendación inicial es `output: 'server'`, ya que el producto se describe como mayoritariamente SSR. Las páginas realmente estáticas (`404`, páginas editoriales si aparecen) podrán declarar `prerender = true`. Esta decisión requiere aprobación porque afecta despliegue, coste y caching.

## 8. Refactor de modelos y datos

- Introducir identificadores estables (`id`, `slug`) y status codes no localizados (`ongoing`, `completed`, `hiatus`). Las etiquetas españolas serán presentación/configuración.
- Convertir `rating` a número y `publishedAt` a ISO; formatear con `Intl` usando el locale del sitio.
- Separar `MangaSummary`, `MangaDetail`, `Chapter` y `ReaderPage` para no enviar payloads completos donde no hacen falta.
- Reemplazar `volumeCount: 'Completo'` por datos estructurados; el estado de publicación no debe esconderse en un contador.
- Mover fixtures a archivos por agregado/contexto. `src/data` no contendrá búsquedas ni reglas de fallback.
- Mover selecciones (`featured`, `trending`, `related`) al servicio/query correspondiente.
- Mover estadísticas y copy de home a `data/marketing`, ya que no son entidades del catálogo.
- Reemplazar fallbacks inventados por `Result.err(not_found)` o un estado vacío explícito.

La normalización del modelo se hará después de segregar los fixtures y cubrir el comportamiento actual con pruebas. No se mezclarán en un mismo cambio el movimiento físico de datos y la transformación de todos sus campos.

No se migrará todavía a Content Collections: el catálogo objetivo provendrá de API y duplicar una segunda infraestructura no aporta valor en esta fase.

## 9. Fases de ejecución

### Fase 0 — decisiones y protección de línea base

- Confirmar `output: 'server'` y contrato inicial del backend.
- Registrar decisiones breves en el propio plan o ADR si cambian el alcance.
- Corregir el lint preexistente sin mezclar cambios funcionales.
- Añadir Vitest para lógica pura y servicios; habilitar ESLint para Vue con su plugin oficial.
- Crear tests de caracterización para filtros, queries actuales, rutas y navegación básica del viewer.

**Salida:** baseline verde y comportamiento actual documentado.

### Fase 1 — configuración y core compartido

- Implementar configs cohesionadas y la fachada `index.config.ts`.
- Migrar marca, locale, rutas, estados, storage keys y timeouts hardcoded.
- Implementar `ServiceResult`, `ServiceError`, helpers y mensajes seguros dentro de `services/shared`.
- Añadir esquema de variables de entorno para API y timeouts.

**Salida:** una sola fuente de verdad sin alterar UI.

### Fase 2 — datos segregados y servicio fixture

- Crear tipos claros de aplicación para catálogo, capítulos y lector.
- Segregar `src/data/mangas.ts` en fixtures de catálogo, capítulos y marketing.
- Implementar `useCatalogFixtureService` como fachada funcional sobre los fixtures.
- Migrar primero `/titulo/[slug]` como ruta vertical piloto y validar éxito, 404 y SSR.
- Después migrar home, catálogo, capítulos y OG para consumir funciones del servicio, nunca arrays directos.
- Responder 404 real para recursos inexistentes.

**Salida:** frontend desacoplado de la fuente de datos y comportamiento equivalente.

### Fase 3 — Axios y servicios externos

- Añadir cliente Axios, normalizador de errores, DTOs y mapper.
- Implementar `useCatalogService` contra el contrato aprobado.
- Añadir pruebas de success, timeout, 4xx, 5xx, payload inválido y cancelación.
- Centralizar endpoints en funciones tipadas y seleccionar fixture/HTTP en un único punto, no dentro de componentes.

**Salida:** cambio de fuente sin cambio de UI.

Si aún no existe contrato backend, se completarán el cliente Axios, los tipos compartidos y el servicio fixture. El servicio HTTP no inventará URLs o payloads productivos.

### Fase 4 — SSR y páginas

- Cambiar a server-first en un commit independiente después de validar la ruta piloto.
- Cargar datos en frontmatter Astro mediante servicios.
- Pasar a Vue solo datos serializables necesarios.
- Mantener filtros locales para datasets pequeños; para paginación real, exponer endpoint Astro/BFF y composable de catálogo.
- Establecer status, redirects y headers de cache correctos.

**Salida:** flujo SSR explícito, seguro y observable.

### Fase 5 — composables por contexto y visor

- Mover composables a `catalog`, `viewer` y `shared` con barrels locales solo donde faciliten imports.
- Extraer `useCatalogFilters` y estrategias de ordenamiento; implementar `recent` con una fecha real.
- Crear `useViewerController` como composition root/mediador local.
- Activar realmente URL sync y definir precedencia documentada: URL > progreso persistido > default.
- Tipar codecs de storage; sincronizar fullscreen con el evento real; limpiar timers y listeners.
- Consolidar helpers SVG/luma/escape sin acoplarlos a Vue.

**Salida:** composables pequeños, cohesionados y verificables.

### Fase 6 — cuenta y autenticación

- Eliminar casts manuales de `Astro.locals`.
- Encapsular lectura/mapeo de perfil en `useAccountService` o helper server-only tipado.
- Centralizar rutas de auth y redirects.
- Mantener Clerk separado del cliente Axios del catálogo salvo que el backend requiera token explícito.

**Salida:** página SSR de cuenta sin tipos inventados ni exposición accidental de datos.

### Fase 7 — documentación y limpieza

- Actualizar `README.md` con configuración, variables de entorno, comandos y fuente de datos.
- Actualizar `AGENTS.md` solo con reglas estables que ya sean verdaderas: estructura por contexto, fronteras de servicio, política de config, SSR y comandos de validación.
- Añadir documentación del contrato API y decisiones de error/caching.
- Eliminar módulos obsoletos (`src/lib/site.ts`, barrel viejo de datos, tipos duplicados) únicamente después de migrar todos los consumidores.

**Salida:** documentación alineada con el código implementado.

## 10. Estrategia de commits

Commits pequeños y reversibles, siguiendo Conventional Commits:

1. `chore(quality): establish refactor safety baseline`
2. `refactor(config): centralize application constants`
3. `feat(core): add result and application error contracts`
4. `refactor(catalog): introduce repository and fixture adapter`
5. `feat(http): add axios client and catalog api adapter`
6. `refactor(ssr): load catalog data through services`
7. `refactor(viewer): organize composables by context`
8. `refactor(auth): isolate server account access`
9. `docs(architecture): document service and ssr conventions`

No se hará un commit masivo de Prettier junto al refactor funcional; cualquier formateo global irá aislado o se limitará a archivos tocados.

## 11. Revalidación obligatoria después de implementar

La fase de implementación no se considerará terminada hasta ejecutar una segunda revisión completa:

1. `npm run format:check`
2. `npm run lint` incluyendo `.vue`
3. `npm run check`
4. `npm run test` (nueva suite)
5. `npm run build`
6. Smoke test del servidor generado y de rutas clave: `/`, `/catalogo`, detalle válido/inválido, capítulo válido/inválido, `/login`, `/cuenta` autenticada/no autenticada y OG endpoint.
7. Pruebas de los servicios fixture/HTTP contra la misma API funcional cuando existan ambos.
8. Revisión de bundle cliente para confirmar que secretos, servicios server-only y fixtures innecesarios no se serializan.
9. Revisión de status HTTP, redirects, cache headers y mensajes de error.
10. Revisión del diff por legibilidad, riesgo, resiliencia y confiabilidad antes del PR.

## 12. Criterios de aceptación

- Ninguna página o componente importa fixtures directamente.
- Cambiar fixture ↔ HTTP requiere modificar solo el punto de composición/configuración.
- Todos los fallos esperables de servicios se expresan como `Result` tipado.
- Los servicios son funciones/composables pequeños; no existen repositorios, clases o capas ceremoniales.
- Axios, endpoints, auth headers y normalización de errores no se duplican entre servicios.
- No existen `as unknown as` para acceder a datos de runtime.
- No hay status, rutas, storage keys ni timeouts relevantes duplicados.
- Los DTO HTTP no llegan a la UI.
- Las rutas inexistentes responden con 404 real.
- La estrategia `recent` está implementada y probada.
- URL, storage, fullscreen y navegación del viewer tienen precedencia y cleanup verificables.
- SSR no comparte tokens o clientes con estado mutable entre requests.
- Format, lint, Astro check, tests y build pasan.
- README, AGENTS y documentación de arquitectura describen el estado real, no el deseado.

## 13. Decisiones aprobadas y aplicadas

1. Se cambió a `output: 'server'`; solo `/404` se prerenderiza.
2. Como todavía no existe un backend confirmado, `fixture` es la fuente predeterminada y el contrato HTTP quedó documentado sin activarse en producción.
3. `src/data` conserva solo fixtures/contenido estático y sus consumidores pasan por servicios funcionales.
