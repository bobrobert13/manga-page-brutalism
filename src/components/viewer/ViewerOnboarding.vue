<script setup lang="ts">
import { ref } from 'vue';
import { useInjectedViewer } from '@/composables/useViewerState';
import { useFocusTrap } from '@/composables/useFocusTrap';

const state = useInjectedViewer();

const overlayRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);

// Focus trap: Tab cycles within the panel while onboarding is visible
useFocusTrap(panelRef, state.isOnboardingVisible);

function close() {
  state.dismissOnboarding();
}

function onOverlayClick(e: MouseEvent) {
  if (e.target === overlayRef.value) close();
}
</script>

<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div
        v-if="state.isOnboardingVisible.value"
        ref="overlayRef"
        class="vp-onboard"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vp-onboard-title"
        @click="onOverlayClick"
        @keydown.escape="close"
      >
        <div ref="panelRef" class="vp-onboard__panel">
          <h2 id="vp-onboard-title" class="font-display text-2xl md:text-3xl">
            Tres modos, una sola obra
          </h2>
          <p class="text-sm md:text-base leading-relaxed mt-2">
            Elegí cómo leer este capítulo. Cambiá cuando quieras desde la barra superior.
          </p>

          <svg
            class="vp-onboard__graph"
            viewBox="0 0 520 200"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Conexión entre modos de lectura"
          >
            <defs>
              <marker id="arr" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L8,5 L0,10 z" fill="var(--color-ink)" />
              </marker>
            </defs>
            <path d="M150,100 L220,100" stroke="var(--color-ink)" stroke-width="3" marker-end="url(#arr)" />
            <path d="M300,100 L370,100" stroke="var(--color-ink)" stroke-width="3" marker-end="url(#arr)" />
            <rect x="20" y="60" width="130" height="80" fill="var(--color-red)" stroke="var(--color-ink)" stroke-width="3" />
            <text x="85" y="95" text-anchor="middle" font-family="Archivo Black,Impact" font-size="18" fill="var(--color-paper)">CASCADA</text>
            <text x="85" y="118" text-anchor="middle" font-family="Space Mono" font-size="10" fill="var(--color-paper)" letter-spacing="2">SCROLL</text>
            <rect x="220" y="60" width="80" height="80" fill="var(--color-paper)" stroke="var(--color-ink)" stroke-width="3" />
            <text x="260" y="95" text-anchor="middle" font-family="Archivo Black,Impact" font-size="18" fill="var(--color-ink)">PÁG.</text>
            <text x="260" y="118" text-anchor="middle" font-family="Space Mono" font-size="10" fill="var(--color-ink)" letter-spacing="2">1/12</text>
            <rect x="370" y="60" width="130" height="80" fill="var(--color-yellow)" stroke="var(--color-ink)" stroke-width="3" />
            <text x="435" y="95" text-anchor="middle" font-family="Archivo Black,Impact" font-size="18" fill="var(--color-ink)">SLIDER</text>
            <text x="435" y="118" text-anchor="middle" font-family="Space Mono" font-size="10" fill="var(--color-ink)" letter-spacing="2">SNAP</text>
          </svg>

          <p class="text-sm leading-relaxed mt-2">
            <b>Cascada</b>: scroll vertical cómodo en mobile. <b>Página</b>: una por viewport, con click y swipe. <b>Slider</b>: carrusel horizontal con snap.
          </p>

          <div class="font-mono text-[11px] uppercase tracking-[0.14em] leading-relaxed opacity-70 mt-3 space-y-1">
            <p><kbd>← →</kbd> Navegar páginas</p>
            <p><kbd>1 2 3</kbd> Cambiar modo</p>
            <p><kbd>Z</kbd> Zoom · <kbd>T</kbd> Tema · <kbd>F</kbd> Pantalla completa</p>
            <p><kbd>?</kbd> Mostrar esta ayuda · <kbd>Esc</kbd> Cerrar</p>
          </div>

          <button type="button" class="vp-onboard__close" @click="close">
            Empezar a leer
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.vp-onboard {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgb(10 10 10 / 0.78);
  backdrop-filter: blur(2px);
}

.vp-onboard__panel {
  width: min(560px, 100%);
  background: var(--color-paper);
  color: var(--color-ink);
  border: 3px solid var(--color-ink);
  box-shadow: 10px 10px 0 0 var(--color-red);
  padding: 24px;
}

.vp-onboard__graph {
  width: 100%;
  height: auto;
  margin: 12px 0;
}

.vp-onboard__close {
  margin-top: 16px;
  padding: 10px 16px;
  background: var(--color-ink);
  color: var(--color-paper);
  border: 3px solid var(--color-ink);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  cursor: pointer;
}
.vp-onboard__close:hover {
  opacity: 0.85;
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 250ms ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>
