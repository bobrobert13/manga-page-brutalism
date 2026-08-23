<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useInjectedViewerAutoScroll } from '@/features/viewer/composables/useViewerAutoScroll';
import { useInjectedViewer } from '@/features/viewer/composables/useViewerState';
import { useViewerChromeVisible } from '@/features/viewer/composables/useViewerChromeVisible';
import ViewerAutoScrollPanel from './ViewerAutoScrollPanel.vue';

const state = useInjectedViewer();
const autoScroll = useInjectedViewerAutoScroll();
const isChromeVisible = useViewerChromeVisible();
const autoButton = ref<HTMLButtonElement | null>(null);

function closePanel(restoreFocus = true): void {
  if (!autoScroll.isPanelOpen.value) return;
  autoScroll.setPanelOpen(false);
  if (restoreFocus) void nextTick(() => autoButton.value?.focus());
}

function togglePanel(): void {
  autoScroll.setPanelOpen(!autoScroll.isPanelOpen.value);
}

function onDocumentPointerDown(event: PointerEvent): void {
  if (!autoScroll.isPanelOpen.value) return;
  const target = event.target;
  if (!(target instanceof Node)) return;
  const panel = document.getElementById('vp-auto-scroll-panel');
  if (autoButton.value?.contains(target) || panel?.contains(target)) return;
  closePanel(false);
}

onMounted(() => document.addEventListener('pointerdown', onDocumentPointerDown));
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown);
  autoScroll.setPanelOpen(false);
});
</script>

<template>
  <div
    class="vp-fab"
    :class="{ 'vp-chrome--hidden': !isChromeVisible && !autoScroll.isPanelOpen.value }"
    data-auto-scroll-controls
    aria-label="Controles del visor"
  >
    <button
      ref="autoButton"
      type="button"
      class="vp-fab__btn vp-fab__btn--auto"
      :class="{ 'vp-fab__btn--active': autoScroll.isPlaying.value }"
      aria-controls="vp-auto-scroll-panel"
      :aria-expanded="autoScroll.isPanelOpen.value"
      :aria-label="
        autoScroll.isPanelOpen.value
          ? 'Cerrar ajustes de desplazamiento automático'
          : 'Abrir ajustes de desplazamiento automático'
      "
      title="Auto-scroll (A para iniciar o pausar)"
      @click="togglePanel"
    >
      AUTO
    </button>

    <ViewerAutoScrollPanel v-if="autoScroll.isPanelOpen.value" @close="closePanel" />

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

.vp-fab__btn--auto {
  font-size: 10px;
  letter-spacing: 0.08em;
}

.vp-fab__btn--active {
  background: var(--color-red);
  color: var(--color-paper);
}

.vp-fab__btn--auto[aria-expanded='true'] {
  transform: translate(2px, 2px);
  box-shadow: 0 0 0 0 var(--color-ink);
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
