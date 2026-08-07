# Estrategia de pruebas

Esta base valida lógica, HTTP, servicios, composables y la integración funcional de las islas Vue sin abrir un navegador real. Playwright, pruebas visuales y CI quedan fuera del alcance actual; la verificación visual continúa siendo manual.

## Objetivos

- Convertir cada requerimiento en ejemplos ejecutables antes de implementar la solución.
- Mantener intercambiables el catálogo fixture, una API externa y futuros endpoints de Astro.
- Probar comportamiento observable, no detalles internos de implementación.
- Detectar errores de contrato en la frontera HTTP antes de conectarla con la UI.
- Ejecutar la suite completa de forma local, aislada y repetible.

## Capas

| Capa | Entorno | Qué se prueba | Dobles permitidos |
| --- | --- | --- | --- |
| Funciones puras y configuración | Node | parsing, mappers, rutas, estrategias y errores | datos explícitos |
| Cliente y servicios HTTP | Node + MSW | request real de Axios, headers, query, abort, respuestas y fallos | servidor MSW |
| Servicios fixture | Node | mismo contrato público que el servicio HTTP | fixtures locales |
| Composables Vue | happy-dom | refs, watchers, eventos, storage, URL y cleanup | APIs del navegador puntuales |
| Componentes Vue | happy-dom + Vue Test Utils | props, eventos, estados y coordinación con composables | hijos cuando se prueba el contenedor |
| Endpoint Astro futuro | Node | método, autorización, validación y traducción HTTP | dependencias de dominio inyectadas |

Los nombres `*.test.ts` seleccionan el proyecto `unit`. Los nombres `*.dom.test.ts` seleccionan `dom`. La prueba vive junto al archivo fuente cuando cubre una unidad concreta; `tests/` contiene infraestructura y contratos compartidos.

## Ciclo TDD por funcionalidad

### 1. Expresar el requerimiento

Escribir escenarios con resultado verificable, incluyendo al menos el camino exitoso y el fallo de negocio relevante.

```text
Dado un catálogo con mangas de varios géneros
Cuando la persona selecciona "Seinen"
Entonces solo aparecen mangas de ese género
Y el resto de filtros conserva su valor
```

Evitar escenarios sobre nombres de funciones privadas, cantidad de llamadas internas o estructura del DOM que no comunique comportamiento.

### 2. Elegir la frontera más pequeña

- Regla sin Vue: función pura.
- Estado reactivo: composable.
- Transporte o backend: servicio con `ServiceResult<T>`.
- Integración de estado con controles: componente montado.
- Código propio de una ruta Astro: handler fino y lógica delegada a servicios.

Una feature puede necesitar varias pruebas pequeñas. No debe comenzar por un test de componente si la mayor parte del comportamiento pertenece a un mapper o servicio.

### 3. Red

Agregar una prueba que falle por la ausencia del comportamiento, no por configuración incompleta. Ejecutar el archivo o proyecto mínimo:

```bash
npx vitest run src/services/catalog/useCatalogService.test.ts
npm run test:unit
npm run test:dom
```

### 4. Green

Implementar el cambio mínimo que satisfaga el escenario. Mantener las fronteras existentes:

- componentes y páginas consumen servicios;
- servicios no dependen del ciclo de vida Vue;
- errores esperados se expresan como `ServiceResult`;
- autenticación se resuelve por operación;
- el estado reactivo permanece en composables.

### 5. Refactor

Eliminar duplicación y mejorar nombres con la suite verde. Después ejecutar cobertura y las validaciones completas. Si una refactorización cambia únicamente estructura interna, las pruebas de comportamiento deberían permanecer estables.

## Contratos de servicio

Las implementaciones fixture y HTTP de un mismo servicio deben ejecutar una suite de contrato compartida. El contrato comprueba resultados, valores ausentes y reglas de consulta; cada adaptador agrega sus propios casos de transporte.

Para una operación externa se esperan, según aplique:

- respuesta exitosa mapeada al modelo de UI;
- `404` convertido en resultado esperado;
- `401` o `403` conservando semántica de autorización;
- error de red y timeout normalizados a `ServiceError`;
- `AbortSignal` propagado y cancelación normalizada;
- token consultado en cada operación;
- ausencia de mutación en defaults compartidos de Axios.

El mapper de DTO se prueba de manera independiente. Un cambio en la forma del backend debe romper primero esa frontera, no un componente lejano.

## HTTP con MSW

`tests/mocks/server.ts` intercepta solicitudes reales del cliente Axios en memoria. Cada prueba declara solo el handler que necesita mediante `mockServer.use(...)`; el setup común reinicia handlers después de cada caso y rechaza requests no manejados.

Reglas:

- no hacer requests a Internet ni a un backend local;
- no mockear Axios en pruebas del cliente o servicio HTTP;
- verificar URL, método, query y headers desde el handler;
- devolver payloads representativos y mínimos;
- probar estados HTTP y payload inválido por separado;
- usar URLs absolutas cuando la prueba corre en Node.

Cuando se conecte la API externa, sus ejemplos sanitizados pueden convertirse en fixtures tipados. No se guardan tokens, cookies ni respuestas con datos personales.

## Endpoints internos de Astro

Una ruta de `src/pages/api/` debe ser un adaptador pequeño. La lógica de autorización, validación y negocio se coloca en funciones o servicios inyectables para probarla en Node sin levantar `astro dev`.

La prueba del adaptador debe construir un `Request`, invocar el handler exportado con un contexto mínimo y verificar:

- status y headers;
- cuerpo serializado;
- parámetros y datos validados;
- traducción de `ServiceError` a respuesta HTTP;
- llamada a la dependencia con identidad y `AbortSignal` correctos.

MSW se reserva para dependencias HTTP salientes. No se usa para simular el endpoint Astro que está bajo prueba.

## Composables

Montar composables con el harness mínimo cuando utilicen hooks de Vue. Validar valores expuestos y efectos visibles:

- transición de estado;
- watchers y precedencia entre URL/storage;
- listeners registrados al montar y retirados al desmontar;
- timers con `vi.useFakeTimers()` y avance explícito;
- fallos de APIs opcionales del navegador sin romper la feature.

Cada prueba desmonta su wrapper. El setup limpia storage, DOM, handlers de MSW y mocks entre casos.

## Componentes

Montar el componente real cuando se prueban controles, contenido condicional o emisiones. Stubear hijos al probar un contenedor cuya responsabilidad es conectar props y eventos.

Preferir consultas por rol, texto, label o atributos de contrato. Las clases se consultan solo cuando expresan un estado funcional, por ejemplo zoom activo. No afirmar estilos, tamaños ni layout: happy-dom no realiza renderizado visual.

No abusar de snapshots amplios. Una aserción específica explica mejor qué requerimiento cambió y evita aprobar ruido de markup.

## Determinismo

- No depender del orden de ejecución entre archivos.
- No compartir estado mutable entre casos.
- Fijar tiempo, aleatoriedad o identificadores cuando afecten el resultado.
- Esperar `nextTick`, promesas y timers de forma explícita.
- Restaurar globals y spies creados por la prueba.
- Mantener `onUnhandledRequest: 'error'` en MSW.
- Evitar delays reales y reintentos que oculten condiciones de carrera.

Si un conjunto grande de casos se deriva de una tabla, puede generarse con un script pequeño y determinista. El script o la tabla fuente debe quedar junto a la prueba cuando sea necesario regenerarla.

## Cobertura

`npm run test:coverage` genera reportes de texto, HTML y LCOV en `coverage/`. Los umbrales globales son:

| Métrica | Mínimo |
| --- | ---: |
| Líneas | 85% |
| Ramas | 75% |
| Funciones | 85% |
| Sentencias | 80% |

La cobertura es una alarma de regresión, no una meta para escribir aserciones vacías. Código declarativo puede aparecer con instrumentación parcial; la prioridad sigue siendo cubrir decisiones y contratos.

## Matriz mínima por cambio

| Cambio | Casos mínimos antes de integrar |
| --- | --- |
| Función pura | ejemplo nominal y cada rama de borde con significado de negocio |
| Mapper de DTO | payload completo, opcionales ausentes y payload inválido si se valida |
| Servicio fixture | contrato compartido, ausencia y filtros soportados |
| Servicio HTTP | contrato compartido, request, error HTTP, red y cancelación |
| Composable | estado inicial, transición principal, borde y cleanup |
| Componente interactivo | contenido inicial, acción de usuario, emisión o estado resultante |
| Endpoint Astro | success, input inválido, autorización y error del servicio |

No todos los cambios necesitan un caso de cada fila. La matriz identifica el mínimo de la frontera modificada y evita trasladar toda la cobertura a componentes.

## Diagnóstico de fallos

Cuando una prueba falla, confirmar en este orden:

1. El escenario describe todavía el requerimiento vigente.
2. El test usa el proyecto correcto según su sufijo.
3. No existe una request MSW sin handler o con URL distinta.
4. Las promesas, `nextTick` y timers fueron avanzados explícitamente.
5. El wrapper, observer, listener o spy se limpia después del caso.
6. El fallo ocurre también al ejecutar el archivo de forma aislada.

Un test que solo falla dentro de la suite indica estado compartido o cleanup incompleto. Un test que solo falla en watch suele indicar mocks restaurados de forma incorrecta o módulos con estado capturado en scope global.

## Comandos

| Propósito | Comando |
| --- | --- |
| Watch local | `npm run test:watch` |
| Unitarias Node | `npm run test:unit` |
| Vue/happy-dom | `npm run test:dom` |
| Toda la suite | `npm run test` |
| Cobertura y umbrales | `npm run test:coverage` |
| Tipos Astro/Vue | `npm run check` |
| Validación final | `npm run format:check && npm run lint && npm run check && npm run test:coverage && npm run build` |

## Criterio de terminado

Una funcionalidad queda lista cuando:

- sus escenarios de aceptación están reflejados en pruebas;
- los caminos de éxito y fallo esperado están cubiertos en la capa correcta;
- no hay requests reales ni estado residual;
- fixture y HTTP conservan el mismo contrato, si ambos existen;
- cobertura permanece sobre los umbrales;
- formato, lint, tipos, pruebas y build terminan correctamente;
- la verificación visual manual no descubre una contradicción con el comportamiento probado.

## Evolución posterior

Cuando se decida automatizar navegador, Playwright debe enfocarse en pocos flujos críticos completos y no repetir toda la matriz de unitarias. Cuando se habilite CI, debe ejecutar los mismos scripts locales sin introducir una configuración de pruebas paralela.
