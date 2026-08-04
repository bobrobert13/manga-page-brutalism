<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useInjectedViewer } from '@/composables/viewer/useViewerState';
import { READING_MODE } from '@/config/index.config';

const state = useInjectedViewer();

const streamRef = ref<HTMLElement | null>(null);
defineExpose({ stageElement: streamRef });

const cur = computed(() => state.currentIndex.value);
const pages = computed(() => state.pages.value);
const isCascade = computed(() => state.mode.value === READING_MODE.cascade);
const isPage = computed(() => state.mode.value === READING_MODE.page);
const isSlider = computed(() => state.mode.value === READING_MODE.slider);
const isZoom = computed(() => state.isZoomed.value);
const currentPage = computed(() => pages.value[cur.value]);

// Track which pages should render their SVG content (for cascade lazy load)
const renderedPages = ref<Set<number>>(new Set());
let renderIO: IntersectionObserver | null = null;

function setupObserver() {
  if (!streamRef.value) return;
  renderIO?.disconnect();
  renderIO = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        const n = parseInt(el.dataset.page || '0', 10);
        if (entry.isIntersecting && !isNaN(n)) {
          renderedPages.value.add(n);
        }
      }
      // Force reactivity update
      renderedPages.value = new Set(renderedPages.value);
    },
    { root: streamRef.value, rootMargin: '200px 0px', threshold: 0 }
  );
  streamRef.value
    .querySelectorAll('.vp-page, .vp-page__slide')
    .forEach((el) => renderIO!.observe(el));
}

onMounted(() => {
  // Always render first 2 pages immediately
  renderedPages.value.add(1);
  if (pages.value.length > 1) renderedPages.value.add(2);
  setupObserver();
});
onUnmounted(() => renderIO?.disconnect());
watch(
  () => state.mode.value,
  () => setTimeout(setupObserver, 50)
);

function onSliderScroll() {
  if (!isSlider.value || !streamRef.value) return;
  const container = streamRef.value;
  const rect = container.getBoundingClientRect();
  const center = rect.left + rect.width / 2;
  const cells = container.querySelectorAll<HTMLElement>('.vp-page__slide');
  let best = { idx: cur.value, dist: Infinity };
  cells.forEach((cell) => {
    const r = cell.getBoundingClientRect();
    const d = Math.abs(r.left + r.width / 2 - center);
    if (d < best.dist) best = { idx: parseInt(cell.dataset.page || '0', 10) - 1, dist: d };
  });
  if (best.idx !== cur.value && !isNaN(best.idx)) state.goToPage(best.idx);
}

// Sync scroll position when state changes programmatically (button click, keyboard)
watch(
  () => state.currentIndex.value,
  (newIdx) => {
    if (!streamRef.value) return;
    const container = streamRef.value;
    if (isSlider.value) {
      const cell = container.querySelector<HTMLElement>(
        `.vp-page__slide[data-page="${newIdx + 1}"]`
      );
      cell?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    } else if (isCascade.value) {
      const cell = container.querySelector<HTMLElement>(`.vp-page[data-page="${newIdx + 1}"]`);
      cell?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
);

function shouldRender(n: number): boolean {
  return renderedPages.value.has(n);
}
</script>

<template>
  <div ref="streamRef" class="vp-stage" :class="{ 'vp-stage--zoom': isZoom }">
    <div v-if="isCascade" class="vp-stage__cascade">
      <figure
        v-for="page in pages"
        :key="page.number"
        class="vp-page"
        :data-page="page.number"
        role="img"
        :aria-label="'Pg ' + page.number"
      >
        <div class="vp-page-frame" v-html="shouldRender(page.number) ? page.svgContent : ''" />
      </figure>
    </div>

    <div v-else-if="isPage" class="vp-stage__page">
      <Transition name="slide" mode="out-in">
        <div v-if="currentPage" :key="cur" class="vp-page__wrap" :data-page="cur + 1">
          <div class="vp-page-frame vp-page-frame--page" v-html="currentPage.svgContent" />
        </div>
      </Transition>
      <span class="vp-stage__hint" aria-hidden="true"
        >&#x2190; &#x2192; &middot; swipe &middot; doble click zoom</span
      >
    </div>

    <div v-else-if="isSlider" class="vp-stage__slider" @scroll="onSliderScroll">
      <figure
        v-for="page in pages"
        :key="page.number"
        class="vp-page__slide"
        :data-page="page.number"
        role="img"
        :aria-label="'Pg ' + page.number"
      >
        <div
          class="vp-page-frame vp-page-frame--slide"
          v-html="shouldRender(page.number) ? page.svgContent : ''"
        />
      </figure>
    </div>
  </div>
</template>

<style scoped>
.vp-stage {
  position: relative;
  width: 100%;
  height: calc(100vh - 56px - 59px);
  overflow: hidden;
  background: var(--color-paper);
  border-bottom: 3px solid var(--color-ink);
}
.vp-stage--zoom .vp-stage__cascade {
  transform: scale(1.4);
  transform-origin: top center;
}
.vp-stage--zoom .vp-stage__slider .vp-page__slide {
  width: calc(min(80vw, 600px) * 1.4);
}
.vp-stage--zoom .vp-page-frame--page {
  transform: scale(1.4);
  transform-origin: center center;
}

/* Cascade */
.vp-stage__cascade {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  max-width: 900px;
  margin: 0 auto;
  height: 100%;
  overflow-y: auto;
}
.vp-stage__cascade .vp-page {
  flex: 0 0 auto;
  display: block;
  width: 100%;
  border: 3px solid var(--color-ink);
  box-shadow: 6px 6px 0 0 var(--color-ink);
  background: var(--color-paper);
  min-height: 480px;
}
.vp-stage__cascade .vp-page-frame {
  width: 100%;
  aspect-ratio: 3 / 4;
}
.vp-stage__cascade .vp-page-frame :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

/* Page */
.vp-stage__page {
  position: absolute;
  inset: 0;
  overflow: hidden;
}
.vp-stage__page .vp-page__wrap {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}
.vp-stage__page .vp-page-frame--page {
  width: min(92vw, 720px);
  aspect-ratio: 3 / 4;
  max-height: 86vh;
  border: 3px solid var(--color-ink);
  box-shadow: 8px 8px 0 0 var(--color-ink);
  background: var(--color-paper);
}
.vp-stage__page .vp-page-frame--page :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.slide-enter-active,
.slide-leave-active {
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}
.slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (prefers-reduced-motion: reduce) {
  .slide-enter-active,
  .slide-leave-active {
    transition: none;
  }
}

.vp-stage__hint {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  opacity: 0.55;
  pointer-events: none;
}

/* Slider */
.vp-stage__slider {
  display: flex;
  flex-direction: row;
  gap: 12px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  padding: 16px;
  height: 100%;
  scrollbar-width: none;
}
.vp-stage__slider::-webkit-scrollbar {
  display: none;
}
.vp-stage__slider .vp-page__slide {
  flex: 0 0 auto;
  scroll-snap-align: center;
  width: min(80vw, 600px);
  height: calc(100% - 24px);
  border: 3px solid var(--color-ink);
  box-shadow: 6px 6px 0 0 var(--color-ink);
  background: var(--color-paper);
}
.vp-page-frame--slide {
  width: 100%;
  height: 100%;
}
.vp-page-frame--slide :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

@media (min-width: 1024px) {
  .vp-stage__page .vp-page-frame--page {
    box-shadow: 12px 12px 0 0 var(--color-ink);
  }
}
</style>
