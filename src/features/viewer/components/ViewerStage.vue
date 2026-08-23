<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useInjectedViewerAutoScroll } from '@/features/viewer/composables/useViewerAutoScroll';
import { useInjectedViewer } from '@/features/viewer/composables/useViewerState';
import { AUTO_SCROLL_CONFIG, AUTO_SCROLL_MOTION, READING_MODE } from '@/config/index.config';
import { animateElementScroll, type ScrollAxis } from '@/features/viewer/lib/scroll-animation';

const state = useInjectedViewer();
const autoScroll = useInjectedViewerAutoScroll();

const streamRef = ref<HTMLElement | null>(null);
defineExpose({ stageElement: streamRef });

const cur = computed(() => state.currentIndex.value);
const pages = computed(() => state.pages.value);
const isCascade = computed(() => state.mode.value === READING_MODE.cascade);
const isPage = computed(() => state.mode.value === READING_MODE.page);
const isSlider = computed(() => state.mode.value === READING_MODE.slider);
const isZoom = computed(() => state.isZoomed.value);
const currentPage = computed(() => pages.value[cur.value]);
const pageTransitionMs = computed(() =>
  autoScroll.effectiveMotion.value === AUTO_SCROLL_MOTION.smooth
    ? AUTO_SCROLL_CONFIG.pageTransitionDurationMs
    : 0
);

// Track which pages should render their SVG content (for cascade lazy load)
const renderedPages = ref<Set<number>>(new Set());
let renderIO: IntersectionObserver | null = null;
let cascadeTrackingFrame: number | null = null;
let isSyncingFromScroll = false;
let programmaticTargetIndex: number | null = null;
let cancelScrollAnimation: (() => void) | null = null;
let animatedScrollPort: HTMLElement | null = null;

function finishScrollAnimation(): void {
  animatedScrollPort?.classList.remove('vp-stage__slider--animating');
  animatedScrollPort = null;
  cancelScrollAnimation = null;
}

function stopScrollAnimation(): void {
  cancelScrollAnimation?.();
  finishScrollAnimation();
}

function scrollToOffset(scrollPort: HTMLElement, axis: ScrollAxis, targetOffset: number): void {
  stopScrollAnimation();
  if (autoScroll.effectiveMotion.value === AUTO_SCROLL_MOTION.direct) {
    if (axis === 'x') scrollPort.scrollLeft = targetOffset;
    else scrollPort.scrollTop = targetOffset;
    return;
  }
  animatedScrollPort = scrollPort;
  if (axis === 'x') scrollPort.classList.add('vp-stage__slider--animating');
  cancelScrollAnimation = animateElementScroll(scrollPort, {
    axis,
    targetOffset,
    durationMs: AUTO_SCROLL_CONFIG.smoothScrollDurationMs,
    onComplete: finishScrollAnimation,
  });
}

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
  renderedPages.value = new Set(renderedPages.value);
  setupObserver();
});
onUnmounted(() => {
  renderIO?.disconnect();
  if (cascadeTrackingFrame !== null) cancelAnimationFrame(cascadeTrackingFrame);
  stopScrollAnimation();
});
watch(
  () => state.mode.value,
  () => {
    stopScrollAnimation();
    isSyncingFromScroll = false;
    programmaticTargetIndex = null;
    setTimeout(setupObserver, 50);
  }
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
  syncCurrentPageFromScroll(best.idx);
}

function syncCurrentPageFromScroll(index: number): void {
  if (Number.isNaN(index)) return;
  if (programmaticTargetIndex !== null) {
    if (index === programmaticTargetIndex) programmaticTargetIndex = null;
    return;
  }
  if (index === cur.value) return;
  isSyncingFromScroll = true;
  state.goToPage(index);
}

function onManualScrollIntent(): void {
  stopScrollAnimation();
  programmaticTargetIndex = null;
}

function onCascadeScroll() {
  if (!isCascade.value || !streamRef.value || cascadeTrackingFrame !== null) return;
  cascadeTrackingFrame = requestAnimationFrame(() => {
    cascadeTrackingFrame = null;
    const container = streamRef.value?.querySelector<HTMLElement>('.vp-stage__cascade');
    if (!container) return;
    const center = container.getBoundingClientRect().top + container.clientHeight / 2;
    const cells = container.querySelectorAll<HTMLElement>('.vp-page');
    let best = { idx: cur.value, dist: Infinity };

    cells.forEach((cell) => {
      const rect = cell.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - center);
      if (distance < best.dist) {
        best = { idx: Number.parseInt(cell.dataset.page || '0', 10) - 1, dist: distance };
      }
    });

    syncCurrentPageFromScroll(best.idx);
  });
}

// Sync scroll position when state changes programmatically (button click, keyboard)
watch(
  () => state.currentIndex.value,
  (newIdx) => {
    if (isSyncingFromScroll) {
      isSyncingFromScroll = false;
      return;
    }
    if (!streamRef.value) return;
    const container = streamRef.value;
    if (isSlider.value) {
      programmaticTargetIndex = newIdx;
      const scrollPort = container.querySelector<HTMLElement>('.vp-stage__slider');
      const cell = container.querySelector<HTMLElement>(
        `.vp-page__slide[data-page="${newIdx + 1}"]`
      );
      if (scrollPort && cell) {
        const left = cell.offsetLeft - (scrollPort.clientWidth - cell.offsetWidth) / 2;
        scrollToOffset(scrollPort, 'x', left);
      }
    } else if (isCascade.value) {
      programmaticTargetIndex = newIdx;
      const scrollPort = container.querySelector<HTMLElement>('.vp-stage__cascade');
      const cell = container.querySelector<HTMLElement>(`.vp-page[data-page="${newIdx + 1}"]`);
      if (scrollPort && cell) scrollToOffset(scrollPort, 'y', cell.offsetTop);
    }
  }
);

function shouldRender(n: number): boolean {
  return renderedPages.value.has(n);
}
</script>

<template>
  <div
    ref="streamRef"
    class="vp-stage"
    :class="{
      'vp-stage--zoom': isZoom,
      'vp-stage--smooth': autoScroll.effectiveMotion.value === AUTO_SCROLL_MOTION.smooth,
    }"
    :style="{ '--vp-page-transition-ms': pageTransitionMs + 'ms' }"
    @pointerdown="onManualScrollIntent"
    @touchstart.passive="onManualScrollIntent"
    @wheel.passive="onManualScrollIntent"
  >
    <div v-if="isCascade" class="vp-stage__cascade" @scroll="onCascadeScroll">
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
    opacity var(--vp-page-transition-ms, 200ms) cubic-bezier(0.22, 1, 0.36, 1),
    transform var(--vp-page-transition-ms, 200ms) cubic-bezier(0.22, 1, 0.36, 1);
}
.slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.985);
}
.slide-leave-to {
  opacity: 0;
  transform: translateY(-16px) scale(0.99);
}

@media (prefers-reduced-motion: reduce) {
  .vp-stage--smooth .slide-enter-active,
  .vp-stage--smooth .slide-leave-active {
    transition-duration: var(--vp-page-transition-ms, 280ms) !important;
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
.vp-stage__slider--animating {
  scroll-snap-type: none !important;
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
