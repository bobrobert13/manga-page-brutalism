import { afterEach, describe, expect, it, vi } from 'vitest';
import { READING_MODE, STORAGE_KEYS, VIEWER_CONFIG } from '@/config/index.config';
import { VIEWER_PAGES } from '../../../tests/fixtures/viewer';
import { mountComposable } from '../../../tests/harness/mountComposable';
import { useViewerState } from './useViewerState';

describe('useViewerState', () => {
  const wrappers = new Set<ReturnType<typeof mountComposable>['wrapper']>();

  function setup(initialIndex = 0) {
    const mounted = mountComposable(() =>
      useViewerState([...VIEWER_PAGES], initialIndex, READING_MODE.page)
    );
    wrappers.add(mounted.wrapper);
    return mounted;
  }

  function setFullscreenElement(element: Element | null) {
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: element });
  }

  afterEach(() => {
    wrappers.forEach((wrapper) => wrapper.unmount());
    wrappers.clear();
    setFullscreenElement(null);
    vi.useRealTimers();
  });

  it('clamps initial and programmatic navigation to page boundaries', () => {
    const { result: state } = setup(99);

    expect(state.currentIndex.value).toBe(3);
    expect(state.goNext()).toBe(false);
    expect(state.goPrev()).toBe(true);
    expect(state.currentIndex.value).toBe(2);

    state.goToPage(-10);
    expect(state.currentIndex.value).toBe(0);
    expect(state.goPrev()).toBe(false);
  });

  it('updates reading mode, zoom, and theme state', () => {
    const { result: state } = setup();

    state.setMode(READING_MODE.slider);
    state.toggleZoom();
    state.toggleTheme();

    expect(state.mode.value).toBe(READING_MODE.slider);
    expect(state.isZoomed.value).toBe(true);
    expect(state.isDark.value).toBe(true);
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem(STORAGE_KEYS.theme)).toBe('dark');

    state.toggleTheme();
    expect(state.isDark.value).toBe(false);
  });

  it('persists onboarding dismissal', () => {
    const { result: state } = setup();
    state.isOnboardingVisible.value = true;

    state.dismissOnboarding();

    expect(state.isOnboardingVisible.value).toBe(false);
    expect(localStorage.getItem(STORAGE_KEYS.viewerOnboarded)).toBe('1');
  });

  it('replaces feedback timers and clears the latest message', () => {
    vi.useFakeTimers();
    const { result: state } = setup();

    state.showFeedback('Primero');
    vi.advanceTimersByTime(VIEWER_CONFIG.feedbackDurationMs - 1);
    state.showFeedback('Segundo', 'success');
    vi.advanceTimersByTime(1);

    expect(state.feedbackMessage.value).toBe('Segundo');
    expect(state.feedbackType.value).toBe('success');

    vi.advanceTimersByTime(VIEWER_CONFIG.feedbackDurationMs);
    expect(state.feedbackMessage.value).toBeNull();
  });

  it('synchronizes successful fullscreen entry and exit', async () => {
    const requestFullscreen = vi.fn(async () => setFullscreenElement(document.documentElement));
    const exitFullscreen = vi.fn(async () => setFullscreenElement(null));
    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      configurable: true,
      value: requestFullscreen,
    });
    Object.defineProperty(document, 'exitFullscreen', {
      configurable: true,
      value: exitFullscreen,
    });
    const { result: state } = setup();

    expect(await state.toggleFullscreen()).toBe(true);
    expect(requestFullscreen).toHaveBeenCalledOnce();
    expect(await state.toggleFullscreen()).toBe(false);
    expect(exitFullscreen).toHaveBeenCalledOnce();
  });

  it('returns false when the fullscreen request fails', async () => {
    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      configurable: true,
      value: vi.fn().mockRejectedValue(new Error('denied')),
    });
    const { result: state } = setup();

    expect(await state.toggleFullscreen()).toBe(false);
    expect(state.isFullscreen.value).toBe(false);
  });

  it('removes its fullscreen listener when unmounted', () => {
    const removeEventListener = vi.spyOn(document, 'removeEventListener');
    const mounted = setup();

    mounted.wrapper.unmount();
    wrappers.delete(mounted.wrapper);

    expect(removeEventListener).toHaveBeenCalledWith('fullscreenchange', expect.any(Function));
  });
});
