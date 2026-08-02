<script setup lang="ts">
import { computed, ref } from 'vue';
import { useInjectedViewer } from '@/composables/useViewerState';
import { useViewerChromeVisible } from '@/composables/useViewerChromeVisible';

const state = useInjectedViewer();
const isChromeVisible = useViewerChromeVisible();

const total = computed(() => state.totalPages.value);
const cur = computed(() => state.currentIndex.value);
const progress = computed(() => {
  if (total.value === 0) return 0;
  return ((cur.value + 1) / total.value) * 100;
});

const chipRef = ref<HTMLButtonElement | null>(null);

function goPage(n: number) {
  const clamped = Math.max(0, Math.min(n, total.value - 1));
  if (clamped !== cur.value) state.goToPage(clamped);
}

function onChipKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
    e.preventDefault();
    goPage(cur.value - 1);
  } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
    e.preventDefault();
    goPage(cur.value + 1);
  } else if (e.key === 'Home') {
    e.preventDefault();
    goPage(0);
  } else if (e.key === 'End') {
    e.preventDefault();
    goPage(total.value - 1);
  }
}

const isCascade = computed(() => state.mode.value === 'cascade');
</script>

<template>
  <nav
    :data-mode="state.mode.value"
    :aria-label="'Selector de página, modo ' + state.mode.value"
    aria-live="polite"
    aria-atomic="true"
    class="vp-indicator"
    :class="{ 'vp-chrome--hidden': !isChromeVisible }"
  >
    <!-- Screen-reader-only page announcement (forces re-announce on change) -->
    <span class="sr-only" aria-live="polite">Página {{ cur + 1 }} de {{ total }}</span>
    <!-- Cascade mode: thin progress bar only -->
    <div v-if="isCascade" class="vp-indicator__edge">
      <div class="vp-indicator__edge-fill" :style="{ width: progress + '%' }" />
    </div>

    <template v-else>
      <button
        type="button"
        class="vp-indicator__nav"
        data-nav="prev"
        aria-label="Página anterior"
        :disabled="cur === 0"
        @click="goPage(cur - 1)"
      >
        ◀
      </button>

      <button
        ref="chipRef"
        type="button"
        class="vp-indicator__chip"
        :aria-label="'Página actual ' + (cur + 1) + ' de ' + total + '. Activar para escuchar posición.'"
        @keydown="onChipKeydown"
      >
        <span class="vp-indicator__chip-label">
          <span class="vp-indicator__cur">{{ cur + 1 }}</span>
          <span aria-hidden="true">/</span>
          <span class="vp-indicator__tot">{{ total }}</span>
        </span>
        <span class="vp-indicator__chip-bar" aria-hidden="true">
          <span class="vp-indicator__chip-fill" :style="{ width: progress + '%' }" />
        </span>
      </button>

      <button
        type="button"
        class="vp-indicator__nav"
        data-nav="next"
        aria-label="Página siguiente"
        :disabled="cur >= total - 1"
        @click="goPage(cur + 1)"
      >
        ▶
      </button>
    </template>
  </nav>
</template>

<style scoped>
.vp-indicator {
  display: flex;
  align-items: stretch;
  gap: 8px;
  padding: 8px 12px;
  background: var(--color-paper);
  border-top: 3px solid var(--color-ink);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  transition: opacity 200ms ease;
}

.vp-indicator.vp-chrome--hidden {
  opacity: 0;
  pointer-events: none;
}

/* Cascade: thin edge bar */
.vp-indicator[data-mode='cascade'] {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 6;
  height: 3px;
  padding: 0;
  background: var(--color-ink-alpha-08);
  border-top: 0;
  overflow: hidden;
  pointer-events: none;
}

.vp-indicator__edge {
  position: absolute;
  inset: 0;
}
.vp-indicator__edge-fill {
  position: absolute;
  inset: 0 auto 0 0;
  background: var(--color-ink);
  transition: width 220ms ease;
}

.vp-indicator__nav {
  appearance: none;
  background: var(--color-paper);
  color: var(--color-ink);
  border: 3px solid var(--color-ink);
  width: 44px;
  min-height: 44px;
  display: grid;
  place-items: center;
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  flex: 0 0 auto;
}
.vp-indicator__nav:hover:not([disabled]) {
  background: var(--color-ink);
  color: var(--color-paper);
}
.vp-indicator__nav[disabled] {
  opacity: 0.35;
  cursor: not-allowed;
}

.vp-indicator__chip {
  flex: 1 1 auto;
  appearance: none;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 12px;
  min-height: 44px;
  background: var(--color-paper);
  color: var(--color-ink);
  border: 3px solid var(--color-ink);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  cursor: pointer;
  text-align: left;
}
.vp-indicator__chip:hover {
  background: var(--color-ink-alpha-08);
}

.vp-indicator__chip-label {
  flex: 0 0 auto;
  white-space: nowrap;
}
.vp-indicator__chip-bar {
  flex: 1 1 auto;
  position: relative;
  height: 8px;
  background: var(--color-ink-alpha-08);
  border: 2px solid var(--color-ink);
}
.vp-indicator__chip-fill {
  position: absolute;
  inset: 0 auto 0 0;
  background: var(--color-ink);
  transition: width 220ms ease;
}

@media (max-width: 479px) {
  .vp-indicator {
    padding: 6px 8px;
    gap: 6px;
  }
  .vp-indicator__chip {
    padding: 4px 8px;
    font-size: 11px;
    gap: 8px;
  }
  .vp-indicator__chip-bar {
    height: 6px;
  }
  .vp-indicator__nav {
    width: 36px;
    min-height: 36px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .vp-indicator__edge-fill,
  .vp-indicator__chip-fill {
    transition: none;
  }
}
</style>