<script setup lang="ts">
import { useInjectedViewer } from '@/composables/viewer/useViewerState';
import { READING_MODE } from '@/config/index.config';
import type { ReadingMode } from '@/types/viewer';

const props = defineProps<{
  mangaTitle: string;
  chapterTitle: string;
  chapterNumber: number;
  prevChapterHref?: string | null;
  nextChapterHref?: string | null;
  prevChapterLabel?: string | null;
  nextChapterLabel?: string | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const state = useInjectedViewer();

const tabs: { id: ReadingMode; label: string }[] = [
  { id: READING_MODE.cascade, label: 'Cascada' },
  { id: READING_MODE.page, label: 'Página' },
  { id: READING_MODE.slider, label: 'Slider' },
];

function pickMode(mode: ReadingMode) {
  state.setMode(mode);
  state.showFeedback('Modo ' + mode);
}

function onTabKeydown(e: KeyboardEvent, idx: number) {
  const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
  if (!dir) return;
  e.preventDefault();
  const next = tabs[(idx + dir + tabs.length) % tabs.length];
  pickMode(next.id);
  // Focus the newly-selected tab
  const btn = document.getElementById('vp-tab-' + next.id);
  btn?.focus();
}
</script>

<template>
  <header class="vp-header">
    <nav class="vp-header__crumb" aria-label="Ruta del capítulo">
      <span>Inicio / </span>
      <b>{{ props.mangaTitle }}</b>
      <span> / Cap. </span>
      <span>{{ props.chapterNumber }}</span>
    </nav>

    <div class="vp-header__tabs" role="tablist" aria-label="Modo de lectura">
      <button
        v-for="(tab, i) in tabs"
        :key="tab.id"
        :id="'vp-tab-' + tab.id"
        type="button"
        role="tab"
        :aria-selected="state.mode.value === tab.id"
        :tabindex="state.mode.value === tab.id ? 0 : -1"
        @click="pickMode(tab.id)"
        @keydown="onTabKeydown($event, i)"
      >
        {{ tab.label }}
      </button>
    </div>

    <nav class="vp-header__chapters" aria-label="Navegación entre capítulos">
      <a
        v-if="props.prevChapterHref"
        :href="props.prevChapterHref"
        class="vp-header__chapter"
        :aria-label="'Capítulo anterior: ' + (props.prevChapterLabel || '')"
        title="Capítulo anterior"
      >
        ‹
      </a>
      <a
        v-if="props.nextChapterHref"
        :href="props.nextChapterHref"
        class="vp-header__chapter"
        :aria-label="'Capítulo siguiente: ' + (props.nextChapterLabel || '')"
        title="Capítulo siguiente"
      >
        ›
      </a>
    </nav>

    <button
      type="button"
      class="vp-header__close"
      aria-label="Cerrar visor y volver atrás"
      title="Cerrar (Esc)"
      @click="emit('close')"
    >
      Cerrar
    </button>
  </header>
</template>

<style scoped>
.vp-header {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  min-height: 56px;
  background: var(--color-paper);
  border-bottom: 3px solid var(--color-ink);
  transition:
    background-color 200ms ease,
    color 200ms ease;
}

.vp-header__crumb {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--color-ink);
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.vp-header__crumb b {
  font-family: var(--font-display);
  letter-spacing: -0.02em;
}

.vp-header__tabs {
  display: inline-flex;
  flex: 0 0 auto;
  border: 3px solid var(--color-ink);
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
}
.vp-header__tabs [role='tab'] {
  appearance: none;
  background: var(--color-paper);
  color: var(--color-ink);
  border: 0;
  border-left: 3px solid var(--color-ink);
  padding: 8px 12px;
  min-width: 44px;
  min-height: 44px;
  cursor: pointer;
  font: inherit;
  text-transform: inherit;
  letter-spacing: inherit;
  transition:
    background-color 120ms ease,
    color 120ms ease;
}
.vp-header__tabs [role='tab']:first-child {
  border-left: 0;
}
.vp-header__tabs [role='tab'][aria-selected='true'] {
  background: var(--color-ink);
  color: var(--color-paper);
}
.vp-header__tabs [role='tab']:hover:not([aria-selected='true']) {
  background: var(--color-ink-alpha-08);
}

.vp-header__close {
  flex: 0 0 auto;
  min-width: 44px;
  min-height: 44px;
  padding: 8px 12px;
  background: var(--color-paper);
  color: var(--color-ink);
  border: 3px solid var(--color-ink);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  cursor: pointer;
  transition:
    background-color 120ms ease,
    color 120ms ease;
}
.vp-header__close:hover {
  background: var(--color-ink);
  color: var(--color-paper);
}

@media (max-width: 479px) {
  .vp-header {
    padding: 6px 8px;
    gap: 8px;
  }
  .vp-header__crumb {
    display: none;
  }
}

@media (min-width: 480px) {
  .vp-header {
    padding: 8px 16px;
  }
}

@media (min-width: 768px) {
  .vp-header__tabs [role='tab'] {
    padding: 10px 16px;
  }
}
</style>
e>
