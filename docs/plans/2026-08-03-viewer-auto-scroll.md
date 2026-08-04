# Plan de desplazamiento automático del visor

| Campo | Valor |
| --- | --- |
| Estado | Propuesta confirmada en alcance; implementación pendiente de aprobación final |
| Rama propuesta | `feat/viewer-auto-scroll` |
| Base | `develop` |
| Fecha | 2026-08-03 |
| Implementación | No iniciada |

## 1. Contexto y objetivo

Agregar reproducción automática a los tres modos de lectura del visor sin alterar su arquitectura SSR ni iniciar movimiento sin una acción explícita del usuario.

El comportamiento aprobado será:

- **Cascada:** avanzar verticalmente a la siguiente página.
- **Página:** cambiar a la siguiente página mediante la transición del modo.
- **Slider:** avanzar horizontalmente al siguiente punto de `scroll-snap`.
- ofrecer un único control `AUTO` con reproducción/pausa y un panel compacto;
- permitir ajustar el intervalo por página y escoger movimiento directo o suave;
- pausar ante interacción manual, zoom, onboarding, cambio de modo o pestaña oculta;
- detenerse al final del capítulo, sin navegar automáticamente al capítulo siguiente;
- recordar las preferencias, pero nunca restaurar una reproducción activa;
- respetar `prefers-reduced-motion` y mantener navegación completa por teclado.

La primera versión será un **avance automático por página**, no un desplazamiento continuo a velocidad de píxeles. Esta decisión ofrece una configuración temporal coherente para los tres modos, conserva el `scroll-snap` del Slider y evita tres motores con semánticas incompatibles.

## 2. Línea base y hallazgos

El visor actual está compuesto por `MangaViewer.vue`, un controlador local y componentes Vue inyectados mediante `provide/inject`. No se necesita cambiar rutas Astro, servicios de catálogo ni datos.

Hallazgos relevantes:

1. `ViewerStage.vue` ya reacciona a `currentIndex` y usa `scrollIntoView({ behavior: 'smooth' })` en Cascada y Slider; este comportamiento debe hacerse configurable y acotarse al contenedor del visor para evitar desplazar ancestros.
2. Slider actualiza `currentIndex` al hacer scroll, pero Cascada no sincroniza la página visible. Esa sincronización es necesaria para pausar y reanudar desde la posición real.
3. `ViewerControls.vue` ya contiene tres botones flotantes. Añadir varios botones nuevos saturaría la esquina superior móvil; se añadirá solo `AUTO` y el resto vivirá en un panel desplegable.
4. `useViewerChromeAutoHide` escucha actividad en fullscreen. El nuevo panel debe convivir con ese comportamiento y permanecer visible mientras esté abierto.
5. Vitest usa entorno `node` y no existen dependencias de montaje Vue/DOM. El motor temporal se diseñará con lógica pura e inyección de reloj para probarlo sin añadir una librería de componentes.
6. `.codegraph/` existe, pero la CLI y la herramienta MCP de CodeGraph no estuvieron disponibles durante el análisis. El mapa se obtuvo mediante inspección focalizada del código.
7. No hubo un navegador conectado para validar visualmente el prototipo. La ejecución deberá incluir QA real en viewport móvil y desktop antes de aceptar la UI.

## 3. Decisiones funcionales

### 3.1 Controles y valores predeterminados

- Botón principal: `AUTO`, con estado apagado/encendido mediante `aria-pressed` y cambio visual explícito.
- Acción primaria: reproducir, pausar o reanudar.
- Intervalo configurable: **3–30 segundos por página**, paso de 1 segundo y valor inicial de **8 segundos**.
- Movimiento configurable:
  - `Directo`: cambio sin desplazamiento o transición animada;
  - `Suave`: desplazamiento/transition animado usando la duración centralizada del visor.
- Atajo propuesto: tecla `A` para reproducir o pausar, documentada en onboarding.
- Cambiar el intervalo mientras se reproduce reinicia la cuenta desde el momento del cambio.
- Cambiar la suavidad se aplica al siguiente avance sin pausar.

No se añadirá un segundo control de “velocidad”: en un lector paginado sería redundante con segundos por página. La UI puede mostrar una etiqueta derivada (`Rápido`, `Normal`, `Lento`) sin guardar otro valor.

### 3.2 Ciclo de reproducción

```text
detenido/pausado
       │ acción explícita: AUTO o tecla A
       ▼
   reproduciendo ── temporizador ──> avanzar una página ──> rearmar
       │
       ├─ interacción / zoom / onboarding / cambio de modo / tab oculta ─> pausado
       └─ última página ─────────────────────────────────────────────────> finalizado
```

Reglas:

- nunca iniciar automáticamente al cargar, restaurar storage o cambiar de capítulo;
- rearmar el temporizador después de cada avance, no con un `setInterval` susceptible a acumular retrasos;
- permitir como máximo un temporizador y una animación activos;
- cancelar timers, listeners y frames al desmontar;
- si se intenta reproducir en la última página, mantenerlo detenido y anunciar “Fin del capítulo”;
- no cambiar de capítulo automáticamente;
- pausar, sin reanudación implícita, al volver de una pestaña oculta;
- pausar al cambiar modo para evitar un movimiento inmediato con otra orientación;
- pausar cuando se activa zoom u onboarding;
- tratar rueda, touch, pointer y navegación manual por teclado como intención de control del usuario;
- no pausar por modificar un ajuste dentro del propio panel.

### 3.3 Persistencia

Persistir globalmente para el visor:

- intervalo validado y limitado al rango permitido;
- preferencia `direct` o `smooth`.

No persistir:

- `playing`, `paused` o `completed`;
- tiempo restante;
- razón de pausa;
- timers o posición de animación.

La lectura de `localStorage` ocurrirá únicamente en `onMounted`; el módulo seguirá siendo seguro para SSR y continuará funcionando si storage no está disponible.

## 4. Arquitectura propuesta

### 4.1 Configuración y tipos

Extender la fachada existente mediante `src/config/viewer.config.ts` y su reexportación actual en `src/config/index.config.ts`:

- `AUTO_SCROLL_CONFIG.defaultIntervalMs`;
- `AUTO_SCROLL_CONFIG.minIntervalMs`;
- `AUTO_SCROLL_CONFIG.maxIntervalMs`;
- `AUTO_SCROLL_CONFIG.intervalStepMs`;
- `AUTO_SCROLL_CONFIG.smoothDurationMs`;
- nueva clave estable de storage para preferencias;
- enum/objeto constante para `direct` y `smooth`.

Añadir en `src/types/viewer.ts` los tipos compartidos mínimos: preferencias, estado de reproducción y razón de pausa. No introducir clases, servicios ni un store global.

### 4.2 Composable de reproducción

Crear `src/composables/viewer/useViewerAutoScroll.ts` como controlador funcional y seguro para SSR. Recibirá:

- `ViewerState` para leer modo, página actual, total, zoom y onboarding;
- referencia al stage;
- un callback de avance que permita elegir el comportamiento de movimiento;
- reloj/temporizador opcional inyectable para pruebas.

Responsabilidades:

- exponer `status`, `intervalMs`, `motion`, `effectiveMotion`, `play`, `pause`, `toggle` y setters validados;
- usar `setTimeout` rearmable y evitar ticks superpuestos;
- escuchar `visibilitychange` y actividad manual relevante;
- observar modo, zoom y onboarding para pausar;
- detectar fin de capítulo y emitir feedback una sola vez;
- leer/escribir preferencias de forma fail-soft;
- detectar `prefers-reduced-motion` y forzar `effectiveMotion = direct` sin borrar la preferencia del usuario;
- limpiar completamente recursos en `onUnmounted`.

El composable se creará desde `useViewerController.ts` y se compartirá con los componentes mediante una clave de inyección específica. No se ampliará `ViewerState` con callbacks mutables ni se creará un event bus.

### 4.3 Integración con el stage

Actualizar `ViewerStage.vue` para:

- exponer una operación estable `advanceToPage(index, motion)` o equivalente, sin depender desde el composable de selectores CSS privados;
- desplazar el contenedor interno mediante offsets propios, evitando que `scrollIntoView` mueva el documento o el header;
- aplicar movimiento directo o suave en Cascada y Slider;
- aplicar duración cero o la transición configurada en Página;
- sincronizar `currentIndex` en Cascada con la página más cercana al centro del viewport mediante scroll con throttle por `requestAnimationFrame`;
- distinguir movimiento programático de interacción manual para no pausar el propio avance automático;
- conservar lazy rendering e indicador de progreso;
- cancelar cualquier frame pendiente al desmontar o cambiar de modo.

La sincronización de Cascada forma parte del alcance porque, sin ella, el autoavance podría saltar desde un índice persistido que no coincide con la página visible.

### 4.4 Integración de entradas

Actualizar:

- `useViewerController.ts` para componer y proveer auto-scroll;
- `useViewerKeyboard.ts` para añadir `A`, pausar antes de navegación manual y mantener exclusión de inputs/editables;
- el manejo de actividad del stage para pausar con rueda, pointer o touch reales;
- `ViewerOnboarding.vue` para documentar el nuevo atajo y la pausa automática.

No se debe cambiar el comportamiento de las teclas existentes, navegación entre capítulos, fullscreen, tema o zoom más allá de la pausa aprobada.

## 5. Reglas visuales y del componente

### 5.1 Tokens y fundamentos

La UI debe reutilizar el sistema existente:

- colores semánticos `--color-paper`, `--color-ink`, `--color-red` y alphas existentes;
- `--font-mono` para controles y valores;
- ritmo de 4/8/12/16 px;
- borde de 3 px y sombra brutalista de 4 px;
- objetivos táctiles mínimos de 44 × 44 px;
- sin gradientes, blur, glassmorphism, bordes redondeados nuevos ni colores literales.

### 5.2 Anatomía

`ViewerControls.vue` conservará el contenedor flotante y añadirá un solo botón `AUTO`. Un nuevo `ViewerAutoScrollPanel.vue` contendrá:

1. título y estado (`Auto-scroll detenido`, `reproduciendo` o `pausado`);
2. acción reproducir/pausar;
3. control de intervalo con valor textual en segundos;
4. selector segmentado `Directo / Suave`;
5. aviso de movimiento reducido cuando aplique;
6. cierre explícito.

Estados requeridos:

- default, hover, `focus-visible`, active/pressed y disabled;
- reproducción activa con fondo de acento y texto de alto contraste;
- disabled si solo existe una página, se está en la última página o el zoom impide iniciar;
- sin estado loading: la operación es local y síncrona;
- feedback de error solo si una API del navegador falla de forma recuperable.

### 5.3 Responsive

- Desktop/tablet: panel compacto de aproximadamente 280–320 px, anclado a la izquierda del FAB sin tapar el botón activo.
- Mobile: panel tipo hoja inferior con margen de 8 px, ancho disponible y altura acotada; no debe quedar debajo del indicador ni del header.
- El botón `AUTO` debe mantener 44 px mínimos aun cuando el texto se reduzca a un icono visual; el nombre accesible seguirá siendo completo.
- Etiquetas largas deben envolver dentro del panel; los valores numéricos no deben desbordar.

El panel será no modal: no atrapará el foco ni bloqueará la lectura. `Escape` lo cerrará y devolverá foco al botón; abrirlo no iniciará la reproducción.

## 6. Accesibilidad y copy

### 6.1 Criterios WCAG verificables

- La reproducción solo empieza tras activación de botón o tecla `A`.
- Debe existir un mecanismo visible y accesible para pausar en todo momento.
- `aria-pressed` refleja exactamente si se está reproduciendo.
- El botón usa `aria-expanded` y `aria-controls` para el panel.
- Inputs y selectores tienen etiquetas programáticas y valores anunciables.
- `Escape` cierra el panel sin activar la acción global de cerrar visor.
- El foco visible cumple contraste y no depende solo del color.
- Con `prefers-reduced-motion: reduce`, la opción guardada puede seguir siendo `Suave`, pero el comportamiento efectivo debe ser directo y la UI debe explicarlo.
- El avance anuncia la nueva página mediante la región viva existente sin duplicar anuncios.
- Al pausar por interacción o llegar al final, el feedback se anuncia una sola vez y no en cada evento de rueda/touch.
- Todas las acciones funcionan con teclado, pointer y touch.

### 6.2 Copy propuesto

- Botón detenido: `Iniciar desplazamiento automático`.
- Botón activo: `Pausar desplazamiento automático`.
- Estado: `AUTO · ACTIVO`, `AUTO · PAUSADO`, `AUTO · FIN`.
- Ajuste: `Tiempo por página` y valor `8 s`.
- Movimiento: `Directo` / `Suave`.
- Feedback: `Auto-scroll iniciado`, `Auto-scroll pausado`, `Fin del capítulo`.
- Movimiento reducido: `Animación suave desactivada por tu sistema`.

Se evitarán etiquetas ambiguas como `Velocidad 5` o iconos sin nombre accesible.

## 7. Archivos afectados y estimación de líneas

Las cifras son líneas cambiadas aproximadas, incluyendo adiciones, modificaciones y pruebas. El rango se revisará con `git diff --stat` durante la ejecución.

| Archivo | Cambio | Estimación |
| --- | --- | ---: |
| `src/config/viewer.config.ts` | Defaults, límites, movimiento y storage key | 25–40 |
| `src/types/viewer.ts` | Tipos de preferencias/estado/pausa | 15–30 |
| `src/composables/viewer/useViewerAutoScroll.ts` | Nuevo motor, lifecycle, preferencias y accesibilidad | 180–240 |
| `src/composables/viewer/useViewerAutoScroll.test.ts` | Timers, límites, fin, pausas, reduced motion y cleanup | 150–220 |
| `src/composables/viewer/useViewerController.ts` | Composición, provide y adaptador del stage | 20–40 |
| `src/composables/viewer/useViewerKeyboard.ts` | Atajo y pausas por navegación manual | 15–30 |
| `src/components/viewer/ViewerStage.vue` | API de avance, motion y tracking de Cascada | 70–120 |
| `src/components/viewer/ViewerControls.vue` | Botón AUTO y apertura/cierre del panel | 35–65 |
| `src/components/viewer/ViewerAutoScrollPanel.vue` | Nuevo panel responsive y accesible | 200–280 |
| `src/components/viewer/ViewerOnboarding.vue` | Ayuda y atajo | 10–25 |
| **Total estimado** | **Producción + pruebas** | **720–1.050** |

Estimación probable: **850–950 líneas cambiadas**. No se esperan dependencias nuevas ni cambios en páginas Astro, endpoints, fixtures o servicios.

## 8. Estimación de tiempo

| Trabajo | Estimación |
| --- | ---: |
| Motor, estado, storage y pruebas unitarias | 3–4 h |
| Integración con los tres modos y tracking de Cascada | 2,5–3,5 h |
| Panel responsive, estados, copy y teclado | 2,5–3,5 h |
| QA manual, accesibilidad, ajustes y validaciones completas | 2,5–4 h |
| **Total** | **10,5–15 h** |

Equivale aproximadamente a **1,5–2 jornadas de desarrollo**, suponiendo que no aparezcan incompatibilidades relevantes de scroll en Safari/iOS. La estimación no incluye una ronda extensa de rediseño visual posterior.

## 9. Fases de implementación

### Fase 1 — dominio y motor temporal

- añadir configuración y tipos;
- implementar codecs validados de preferencias;
- implementar máquina de reproducción y temporizador rearmable;
- cubrir inicio, pausa, reanudación, cambio de intervalo, fin, visibilidad, reduced motion y cleanup con Vitest.

**Salida:** motor determinista, probado y sin DOM en scope de módulo.

### Fase 2 — adaptación a los modos

- integrar el composable en `useViewerController`;
- exponer una API estable desde `ViewerStage`;
- implementar comportamiento directo/suave en Cascada, Página y Slider;
- sincronizar la página visible de Cascada;
- pausar por entradas manuales, modo, zoom, onboarding y tab oculta;
- añadir atajo `A`.

**Salida:** los tres modos se reproducen y se detienen correctamente sin UI de ajustes final.

### Fase 3 — UI y accesibilidad

- añadir botón único `AUTO` al FAB;
- crear panel responsive;
- implementar foco, Escape, etiquetas y estados disabled/pressed/expanded;
- actualizar onboarding y feedback;
- revisar solapamientos con header, indicador, fullscreen y chrome auto-hide.

**Salida:** experiencia completa usable con teclado, pointer y touch.

### Fase 4 — revalidación

- ejecutar suite automatizada completa;
- probar los tres modos en móvil y desktop;
- probar movimiento reducido, pestaña oculta, zoom, onboarding y fin de capítulo;
- inspeccionar listeners/timers después de cambiar modo y desmontar;
- revisar diff final y límites de commit.

## 10. Estrategia de commits

Objetivo: **250–400 líneas cambiadas por commit**; máximo absoluto solicitado: **800**. Si un corte funcional supera 400, se separarán pruebas o UI en otro commit antes de continuar.

1. `feat(viewer): add auto-scroll playback controller`
   - configuración, tipos, composable y primeras pruebas puras;
   - objetivo: 320–400 líneas.
2. `feat(viewer): integrate auto-scroll reading modes`
   - controller, stage, Cascada tracking, teclado e integración;
   - objetivo: 220–350 líneas.
3. `feat(viewer): add accessible auto-scroll controls`
   - botón, panel, responsive, onboarding y copy;
   - objetivo: 280–400 líneas.
4. `test(viewer): cover auto-scroll lifecycle edge cases`
   - solo si las pruebas hacen superar el primer o segundo corte;
   - objetivo: 120–250 líneas.

Antes de cada commit se revisará `git diff --stat`; no se mezclará formateo global ni cambios ajenos.

## 11. Pruebas y criterios de aceptación

### Automatizadas

- no inicia al montar ni al restaurar preferencias;
- inicia solo por acción explícita;
- avanza exactamente una página por tick;
- el temporizador se rearma sin duplicarse;
- cambiar intervalo reinicia la espera;
- directo/suave se valida y persiste;
- valores corruptos de storage vuelven a defaults;
- pausa por interacción, cambio de modo, zoom, onboarding y visibilidad;
- no se reanuda automáticamente al volver a la pestaña;
- se detiene en la última página y no navega de capítulo;
- reduced motion fuerza movimiento efectivo directo;
- desmontar elimina timer, media-query listeners y eventos;
- una página o lista vacía no permite reproducción.

### Smoke/visual

- Cascada avanza y mantiene índice/progreso correctos después de scroll manual;
- Página conserva sus transiciones y navegación existente;
- Slider termina centrado en el snap siguiente;
- AUTO no tapa header, indicador, página ni controles en 320, 375, 768 y 1280 px;
- fullscreen conserva auto-hide, pero el panel abierto permanece operable;
- zoom pausa antes de transformar contenido;
- abrir onboarding pausa y no deja movimiento detrás del diálogo;
- `A`, Tab, Shift+Tab, Enter, Space y Escape siguen una secuencia de foco predecible;
- no hay anuncios ARIA duplicados ni feedback repetido por eventos continuos;
- light/dark mantienen contraste AA y estados perceptibles sin depender solo del color.

### Validación del repositorio

Ejecutar, en este orden:

1. `npm run format:check`
2. `npm run lint`
3. `npm run check`
4. `npm run test`
5. `npm run build`
6. smoke test con `astro dev --background`, seguido de `astro dev stop`

## 12. Riesgos y mitigaciones

| Riesgo | Mitigación |
| --- | --- |
| Timers ralentizados en background | Pausar con `visibilitychange`; nunca intentar recuperar ticks perdidos |
| `scrollIntoView` mueve el documento | Desplazar explícitamente el scrollport del visor mediante offsets propios |
| Índice incorrecto en Cascada | Tracking de página visible con un único frame pendiente |
| Eventos programáticos se interpretan como manuales | Marcar avance interno y pausar solo ante eventos confiables del usuario |
| Acumulación de timer/animación | Un único owner, cancelación antes de rearmar y cleanup al desmontar |
| Conflicto con reduced motion | Movimiento efectivo directo y mensaje visible en el panel |
| FAB saturado en móvil | Un botón adicional y ajustes dentro de hoja inferior |
| Panel oculto por auto-hide | Mantener chrome visible mientras el panel esté abierto |
| Scope creep hacia navegación de capítulos | Detención estricta al final; sin click automático en “siguiente capítulo” |

## 13. Anti-patrones prohibidos

- `setInterval` sin control de solapamiento;
- acceso a `window`, `document`, `localStorage` o `matchMedia` en scope de módulo;
- tres implementaciones separadas del scheduler por modo;
- persistir o restaurar `playing=true`;
- velocidad expresada con números sin unidad;
- animación suave obligatoria cuando el sistema pide movimiento reducido;
- añadir controles flotantes independientes para tiempo, suavidad y play/pause;
- selectores CSS privados desde el composable cuando el stage puede exponer una API;
- `scrollIntoView` que pueda desplazar el documento completo;
- cambio automático al siguiente capítulo.

## 14. QA de revisión de código

- [ ] La implementación permanece dentro de `config`, `types`, `composables/viewer` y `components/viewer`.
- [ ] No se añadieron dependencias ni estado global.
- [ ] El motor tiene un solo timer y cleanup demostrable.
- [ ] Los tres modos comparten contrato de intervalo y movimiento.
- [ ] Cascada mantiene `currentIndex` correcto después de scroll manual.
- [ ] Todas las pausas aprobadas están cubiertas.
- [ ] El estado activo nunca se restaura desde storage.
- [ ] El panel no bloquea navegación ni requiere mouse.
- [ ] Reduced motion funciona en lógica y CSS.
- [ ] Los commits respetan el objetivo de 400 líneas y nunca exceden 800.
- [ ] Format, lint, check, test y build pasan.
- [ ] Se realizó QA visual real en móvil, desktop y fullscreen.

## 15. Fuera de alcance

- reproducción continua basada en píxeles por segundo;
- control de curva Bézier o duración arbitraria por el usuario;
- navegación automática al siguiente capítulo;
- sincronización de preferencias con cuenta/backend;
- telemetría de lectura;
- descarga offline;
- rediseño general del visor;
- corrección de incidencias preexistentes no necesarias para esta función.

## 16. Puerta de aprobación

Este documento no autoriza todavía cambios en `src/`. La implementación empezará únicamente cuando el usuario confirme expresamente este plan. Cualquier cambio posterior de avance por página a scroll continuo requiere reestimar arquitectura, líneas y tiempo antes de programar.
