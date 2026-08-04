<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import { useInjectedViewerAutoScroll } from '@/composables/viewer/useViewerAutoScroll';
import {
  AUTO_SCROLL_CONFIG,
  AUTO_SCROLL_MOTION,
  type AutoScrollMotion,
} from '@/config/index.config';

const emit = defineEmits<{
  close: [];
}>();

const autoScroll = useInjectedViewerAutoScroll();
const panelElement = ref<HTMLElement | null>(null);
const playButton = ref<HTMLButtonElement | null>(null);

const intervalSeconds = computed(() => autoScroll.intervalMs.value / 1_000);
const paceLabel = computed(() => {
  if (intervalSeconds.value <= 5) return 'Rápido';
  if (intervalSeconds.value >= 15) return 'Lento';
  return 'Normal';
});
const statusLabel = computed(() => {
  switch (autoScroll.status.value) {
    case 'playing':
      return 'AUTO · ACTIVO';
    case 'paused':
      return 'AUTO · PAUSADO';
    case 'completed':
      return 'AUTO · FIN';
    default:
      return 'AUTO · DETENIDO';
  }
});
const toggleLabel = computed(() =>
  autoScroll.isPlaying.value ? 'Pausar auto-scroll' : 'Iniciar auto-scroll'
);

function setInterval(event: Event): void {
  const input = event.target as HTMLInputElement;
  autoScroll.setIntervalMs(Number(input.value) * 1_000);
}

function setMotion(motion: AutoScrollMotion): void {
  autoScroll.setMotion(motion);
}

function close(): void {
  emit('close');
}

onMounted(() => {
  void nextTick(() => playButton.value?.focus());
});

defineExpose({ panelElement });
</script>

<template>
  <section
    id="vp-auto-scroll-panel"
    ref="panelElement"
    class="vp-auto-panel"
    role="region"
    aria-labelledby="vp-auto-scroll-title"
    @keydown.escape.stop.prevent="close"
  >
    <header class="vp-auto-panel__header">
      <div>
        <p class="vp-auto-panel__eyebrow">Reproducción</p>
        <h2 id="vp-auto-scroll-title">{{ statusLabel }}</h2>
      </div>
      <button type="button" class="vp-auto-panel__close" aria-label="Cerrar ajustes" @click="close">
        ×
      </button>
    </header>

    <button
      ref="playButton"
      type="button"
      class="vp-auto-panel__play"
      :class="{ 'vp-auto-panel__play--active': autoScroll.isPlaying.value }"
      :disabled="!autoScroll.isPlaying.value && !autoScroll.canPlay.value"
      :aria-pressed="autoScroll.isPlaying.value"
      @click="autoScroll.toggle()"
    >
      <span aria-hidden="true">{{ autoScroll.isPlaying.value ? 'Ⅱ' : '▶' }}</span>
      {{ toggleLabel }}
    </button>

    <div class="vp-auto-panel__section">
      <div class="vp-auto-panel__label-row">
        <label for="vp-auto-interval">Tiempo por página</label>
        <output for="vp-auto-interval">{{ intervalSeconds }} s · {{ paceLabel }}</output>
      </div>
      <input
        id="vp-auto-interval"
        class="vp-auto-panel__range"
        type="range"
        :min="AUTO_SCROLL_CONFIG.minIntervalMs / 1_000"
        :max="AUTO_SCROLL_CONFIG.maxIntervalMs / 1_000"
        :step="AUTO_SCROLL_CONFIG.intervalStepMs / 1_000"
        :value="intervalSeconds"
        :aria-valuetext="intervalSeconds + ' segundos por página, ' + paceLabel"
        @input="setInterval"
      />
      <div class="vp-auto-panel__limits" aria-hidden="true">
        <span>{{ AUTO_SCROLL_CONFIG.minIntervalMs / 1_000 }} s</span>
        <span>{{ AUTO_SCROLL_CONFIG.maxIntervalMs / 1_000 }} s</span>
      </div>
    </div>

    <fieldset class="vp-auto-panel__section">
      <legend>Movimiento</legend>
      <div class="vp-auto-panel__segments">
        <button
          type="button"
          :aria-pressed="autoScroll.motion.value === AUTO_SCROLL_MOTION.direct"
          @click="setMotion(AUTO_SCROLL_MOTION.direct)"
        >
          Directo
        </button>
        <button
          type="button"
          :aria-pressed="autoScroll.motion.value === AUTO_SCROLL_MOTION.smooth"
          @click="setMotion(AUTO_SCROLL_MOTION.smooth)"
        >
          Suave
        </button>
      </div>
      <p v-if="autoScroll.prefersReducedMotion.value" class="vp-auto-panel__notice" role="status">
        Animación suave desactivada por tu sistema.
      </p>
    </fieldset>

    <p class="vp-auto-panel__hint"><kbd>A</kbd> iniciar/pausar · interacción manual pausa</p>
  </section>
</template>

<style scoped>
.vp-auto-panel {
  position: absolute;
  right: 64px;
  bottom: 0;
  width: min(320px, calc(100vw - 96px));
  padding: 16px;
  overflow-y: auto;
  background: var(--color-paper);
  color: var(--color-ink);
  border: 3px solid var(--color-ink);
  box-shadow: 8px 8px 0 0 var(--color-red);
  font-family: var(--font-mono);
}

.vp-auto-panel__header,
.vp-auto-panel__label-row,
.vp-auto-panel__limits {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.vp-auto-panel__header {
  align-items: flex-start;
  padding-bottom: 12px;
  border-bottom: 3px solid var(--color-ink);
}

.vp-auto-panel__eyebrow,
.vp-auto-panel__hint,
.vp-auto-panel__notice,
.vp-auto-panel__limits {
  font-size: 10px;
  font-weight: 700;
  line-height: 1.4;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.vp-auto-panel__eyebrow {
  margin: 0 0 4px;
  opacity: 0.65;
}

.vp-auto-panel h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 20px;
  line-height: 1;
}

.vp-auto-panel__close {
  flex: 0 0 auto;
  width: 44px;
  height: 44px;
  background: var(--color-paper);
  color: var(--color-ink);
  border: 3px solid var(--color-ink);
  font-size: 24px;
  font-weight: 900;
  line-height: 1;
  cursor: pointer;
}

.vp-auto-panel__close:hover,
.vp-auto-panel__close:active {
  background: var(--color-ink);
  color: var(--color-paper);
}

.vp-auto-panel__play {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  min-height: 48px;
  margin-top: 12px;
  padding: 8px 12px;
  background: var(--color-paper);
  color: var(--color-ink);
  border: 3px solid var(--color-ink);
  box-shadow: 4px 4px 0 0 var(--color-ink);
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
}

.vp-auto-panel__play:hover:not(:disabled) {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 0 var(--color-ink);
}

.vp-auto-panel__play--active {
  background: var(--color-red);
  color: var(--color-paper);
}

.vp-auto-panel__play:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.vp-auto-panel__section {
  min-width: 0;
  margin: 16px 0 0;
  padding: 0;
  border: 0;
}

.vp-auto-panel__section label,
.vp-auto-panel__section legend {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.vp-auto-panel__label-row output {
  font-size: 11px;
  white-space: nowrap;
}

.vp-auto-panel__range {
  width: 100%;
  min-height: 44px;
  margin: 4px 0 0;
  accent-color: var(--color-red);
  cursor: pointer;
}

.vp-auto-panel__limits {
  margin-top: -8px;
  opacity: 0.65;
}

.vp-auto-panel__segments {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-top: 8px;
  border: 3px solid var(--color-ink);
}

.vp-auto-panel__segments button {
  min-height: 44px;
  padding: 8px;
  background: var(--color-paper);
  color: var(--color-ink);
  border: 0;
  border-left: 3px solid var(--color-ink);
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
}

.vp-auto-panel__segments button:first-child {
  border-left: 0;
}

.vp-auto-panel__segments button[aria-pressed='true'] {
  background: var(--color-ink);
  color: var(--color-paper);
}

.vp-auto-panel__notice {
  margin: 8px 0 0;
  padding: 8px;
  background: var(--color-yellow);
  color: var(--color-ink);
  border: 2px solid var(--color-ink);
}

.vp-auto-panel__hint {
  margin: 16px 0 0;
  opacity: 0.7;
}

.vp-auto-panel__hint kbd {
  padding: 1px 4px;
  border: 2px solid currentColor;
}

@media (max-width: 479px) {
  .vp-auto-panel {
    position: fixed;
    inset: auto 8px 8px;
    width: auto;
    max-height: calc(100dvh - 80px);
    padding: 12px;
    box-shadow: 6px 6px 0 0 var(--color-red);
  }
}

@media (prefers-reduced-motion: reduce) {
  .vp-auto-panel__play:hover:not(:disabled) {
    transform: none;
  }
}
</style>
