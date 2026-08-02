/**
 * Touch swipe + click + double-tap zoom + pinch-to-zoom handling for the viewer stage.
 */
import { onMounted, onUnmounted, type Ref } from 'vue';
import type { ViewerState } from './useViewerState';

export function useViewerGestures(
  stageRef: Ref<HTMLElement | null>,
  state: ViewerState,
): void {
  let touchStartX: number | null = null;
  let lastTapTime = 0;
  const DOUBLE_TAP_WINDOW = 300;
  const SWIPE_THRESHOLD = 60;

  // ── Pinch-to-zoom ──
  let pinchStartDist = 0;
  let pinchZoomActive = false;
  const PINCH_ZOOM_IN_THRESHOLD = 1.15;
  const PINCH_ZOOM_OUT_THRESHOLD = 0.87;

  function getDist(touches: TouchList): number {
    if (touches.length < 2) return 0;
    const a = touches[0];
    const b = touches[1];
    return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
  }

  function getEl(): HTMLElement | null {
    return stageRef.value;
  }

  // ── Touch ──
  function onTouchStart(e: TouchEvent) {
    if (e.touches.length === 2 && state.mode.value === 'page') {
      pinchStartDist = getDist(e.touches);
      pinchZoomActive = true;
      return;
    }
    pinchZoomActive = false;
    touchStartX = e.changedTouches[0]?.clientX ?? null;
  }

  function onTouchMove(e: TouchEvent) {
    if (!pinchZoomActive || state.mode.value !== 'page') return;
    const dist = getDist(e.touches);
    if (dist === 0 || pinchStartDist === 0) return;
    const ratio = dist / pinchStartDist;

    if (ratio > PINCH_ZOOM_IN_THRESHOLD) {
      if (!state.isZoomed.value) state.toggleZoom();
      state.showFeedback('Zoom 2×');
      pinchZoomActive = false; // one-shot per gesture
    } else if (ratio < PINCH_ZOOM_OUT_THRESHOLD) {
      if (state.isZoomed.value) state.toggleZoom();
      state.showFeedback('Zoom 1×');
      pinchZoomActive = false;
    }
  }

  function onTouchEnd(e: TouchEvent) {
    if (pinchZoomActive) {
      pinchZoomActive = false;
      pinchStartDist = 0;
      return;
    }

    const endX = e.changedTouches[0]?.clientX ?? 0;
    const dx = touchStartX != null ? endX - touchStartX : 0;
    touchStartX = null;

    if (Math.abs(dx) > SWIPE_THRESHOLD && state.mode.value === 'page') {
      if (dx < 0) state.goNext();
      else state.goPrev();
      return;
    }

    // Touch double-tap → zoom
    const now = Date.now();
    if (now - lastTapTime < DOUBLE_TAP_WINDOW) {
      state.toggleZoom();
      lastTapTime = 0;
    } else {
      lastTapTime = now;
    }
  }

  // ── Mouse ──
  function onClick(e: MouseEvent) {
    if (state.mode.value !== 'page') return;
    const el = getEl();
    if (!el) return;
    const target = e.target as HTMLElement;
    if (target?.closest?.('[data-nav]')) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) state.goPrev();
    else state.goNext();
  }

  function onDblClick(_e: MouseEvent) {
    if (state.mode.value !== 'page') return;
    state.toggleZoom();
  }

  onMounted(() => {
    const el = getEl();
    if (!el) return;
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('click', onClick);
    el.addEventListener('dblclick', onDblClick);
  });

  onUnmounted(() => {
    const el = getEl();
    if (!el) return;
    el.removeEventListener('touchstart', onTouchStart);
    el.removeEventListener('touchmove', onTouchMove);
    el.removeEventListener('touchend', onTouchEnd);
    el.removeEventListener('click', onClick);
    el.removeEventListener('dblclick', onDblClick);
  });
}
