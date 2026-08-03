<script setup lang="ts">
import { useInjectedViewer } from '@/composables/viewer/useViewerState';
import { useViewerChromeVisible } from '@/composables/viewer/useViewerChromeVisible';

const state = useInjectedViewer();
const isChromeVisible = useViewerChromeVisible();
</script>

<template>
  <div
    class="vp-fab"
    :class="{ 'vp-chrome--hidden': !isChromeVisible }"
    aria-label="Controles del visor"
  >
    <button
      type="button"
      class="vp-fab__btn"
      @click="state.toggleZoom()"
      :aria-label="'Zoom: ' + (state.isZoomed.value ? '2×' : '1×')"
      :aria-pressed="state.isZoomed.value"
      :title="'Zoom (Z)'"
    >
      {{ state.isZoomed.value ? '1×' : '2×' }}
    </button>
    <button
      type="button"
      class="vp-fab__btn"
      @click="state.toggleTheme()"
      :aria-label="'Tema: ' + (state.isDark.value ? 'oscuro' : 'claro')"
      :title="'Tema (T)'"
    >
      {{ state.isDark.value ? '◑' : '◐' }}
    </button>
    <button
      type="button"
      class="vp-fab__btn"
      @click="state.toggleFullscreen()"
      :aria-label="state.isFullscreen.value ? 'Salir de pantalla completa' : 'Pantalla completa'"
      :aria-pressed="state.isFullscreen.value"
      :title="'Pantalla completa (F)'"
    >
      ⛶
    </button>
  </div>
</template>

<style scoped>
.vp-fab {
  position: fixed;
  right: 16px;
  bottom: 96px;
  z-index: 40;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vp-fab__btn {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  background: var(--color-paper);
  color: var(--color-ink);
  border: 3px solid var(--color-ink);
  box-shadow: 4px 4px 0 0 var(--color-ink);
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
}

.vp-fab__btn:hover {
  transform: translate(2px, 2px);
  box-shadow: 0 0 0 0 var(--color-ink);
  background: var(--color-ink);
  color: var(--color-paper);
}

.vp-fab__btn[aria-pressed='true'] {
  background: var(--color-ink);
  color: var(--color-paper);
}

@media (max-width: 479px) {
  .vp-fab {
    /* Top-right under the sticky header on mobile to avoid indicator overlap */
    right: 8px;
    top: 64px;
    bottom: auto;
    gap: 6px;
  }
}

@media (min-width: 480px) {
  .vp-fab {
    right: 24px;
    bottom: 110px;
  }
}
</style>
