import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';
import { AUTO_SCROLL_CONFIG, AUTO_SCROLL_MOTION, STORAGE_KEYS } from '@/config/index.config';
import { createViewerStateMock } from '../../../tests/fixtures/viewerState';
import { mountComposable, type MountedComposable } from '../../../tests/harness/mountComposable';
import { useViewerAutoScroll, type ViewerAutoScroll } from './useViewerAutoScroll';

interface MediaQueryStub {
  matches: boolean;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  notify: (matches: boolean) => void;
}

const mounted: Array<MountedComposable<ViewerAutoScroll>> = [];

function createMediaQuery(matches = false): MediaQueryStub {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mediaQuery: MediaQueryStub = {
    matches,
    addEventListener: vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    }),
    removeEventListener: vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    }),
    notify(nextMatches: boolean) {
      mediaQuery.matches = nextMatches;
      const event = { matches: nextMatches } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    },
  };
  return mediaQuery;
}

function setup(options: { reducedMotion?: boolean; stage?: HTMLElement } = {}) {
  const state = createViewerStateMock();
  const stage = options.stage ?? document.createElement('div');
  const stageElement = ref<HTMLElement | null>(stage);
  const mediaQuery = createMediaQuery(options.reducedMotion ?? false);
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => mediaQuery)
  );
  const mountedComposable = mountComposable(() => useViewerAutoScroll(state, stageElement));
  mounted.push(mountedComposable);
  return { mediaQuery, stage, state, ...mountedComposable };
}

describe('useViewerAutoScroll', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    mounted.splice(0).forEach(({ wrapper }) => wrapper.unmount());
    vi.useRealTimers();
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('restores persisted preferences and reacts to reduced-motion changes', () => {
    localStorage.setItem(
      STORAGE_KEYS.viewerAutoScroll,
      JSON.stringify({ intervalMs: 8_500, motion: AUTO_SCROLL_MOTION.smooth })
    );

    const { mediaQuery, result } = setup();

    expect(result.intervalMs.value).toBe(9_000);
    expect(result.motion.value).toBe(AUTO_SCROLL_MOTION.smooth);

    mediaQuery.notify(true);

    expect(result.prefersReducedMotion.value).toBe(true);
    expect(result.motion.value).toBe(AUTO_SCROLL_MOTION.direct);
  });

  it('plays, advances the viewer and pauses through its public controls', () => {
    const { result, state } = setup();
    result.setIntervalMs(AUTO_SCROLL_CONFIG.minIntervalMs);

    result.play();

    expect(result.isPlaying.value).toBe(true);
    expect(state.showFeedback).toHaveBeenCalledWith('Auto-scroll iniciado');

    vi.advanceTimersByTime(AUTO_SCROLL_CONFIG.minIntervalMs);

    expect(state.currentIndex.value).toBe(2);
    expect(result.isPlaying.value).toBe(true);

    result.pause();

    expect(result.status.value).toBe('paused');
    expect(result.pauseReason.value).toBe('manual');
    expect(state.showFeedback).toHaveBeenCalledWith('Auto-scroll pausado');
  });

  it('completes immediately when playback starts on the final page', () => {
    const { result, state } = setup();
    state.currentIndex.value = state.totalPages.value - 1;

    result.play();

    expect(result.status.value).toBe('completed');
    expect(state.showFeedback).toHaveBeenCalledWith('Fin del capítulo', 'success');
  });

  it('pauses active playback when zoom or onboarding becomes active', async () => {
    const { result, state } = setup();
    result.play();

    state.isZoomed.value = true;
    await nextTick();

    expect(result.status.value).toBe('paused');
    expect(result.pauseReason.value).toBe('zoom');

    state.isZoomed.value = false;
    result.play();
    state.isOnboardingVisible.value = true;
    await nextTick();

    expect(result.status.value).toBe('paused');
    expect(result.pauseReason.value).toBe('onboarding');
  });

  it('persists changed preferences after restoration completes', async () => {
    const { result } = setup();

    result.setIntervalMs(10_000);
    result.setMotion(AUTO_SCROLL_MOTION.direct);
    await nextTick();

    expect(localStorage.getItem(STORAGE_KEYS.viewerAutoScroll)).toBe(
      JSON.stringify({ intervalMs: 10_000, motion: AUTO_SCROLL_MOTION.direct })
    );
  });

  it('removes media and stage listeners on unmount', () => {
    const stage = document.createElement('div');
    const addStageListener = vi.spyOn(stage, 'addEventListener');
    const removeStageListener = vi.spyOn(stage, 'removeEventListener');
    const { mediaQuery, wrapper } = setup({ stage });

    expect(addStageListener).toHaveBeenCalledWith('touchstart', expect.any(Function), {
      passive: true,
    });
    expect(mediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    wrapper.unmount();

    expect(removeStageListener).toHaveBeenCalledWith('touchstart', expect.any(Function));
    expect(mediaQuery.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
