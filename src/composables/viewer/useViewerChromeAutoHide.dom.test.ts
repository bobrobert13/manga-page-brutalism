import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';
import { mountComposable } from '../../../tests/harness/mountComposable';
import { useViewerChromeAutoHide } from './useViewerChromeAutoHide';

describe('useViewerChromeAutoHide', () => {
  const wrappers = new Set<ReturnType<typeof mountComposable>['wrapper']>();

  function setup(fullscreen = false, idleMs = 100) {
    const isFullscreen = ref(fullscreen);
    const mounted = mountComposable(() => ({
      isFullscreen,
      visible: useViewerChromeAutoHide(isFullscreen, idleMs),
    }));
    wrappers.add(mounted.wrapper);
    return mounted;
  }

  afterEach(() => {
    wrappers.forEach((wrapper) => wrapper.unmount());
    wrappers.clear();
    vi.useRealTimers();
  });

  it('schedules hiding when mounted in fullscreen', () => {
    vi.useFakeTimers();
    const { result } = setup(true);

    vi.advanceTimersByTime(100);

    expect(result.visible.value).toBe(false);
  });

  it('reveals chrome on activity and reschedules the idle timeout', () => {
    vi.useFakeTimers();
    const { result } = setup(true);
    vi.advanceTimersByTime(100);
    expect(result.visible.value).toBe(false);

    document.dispatchEvent(new MouseEvent('mousemove'));
    expect(result.visible.value).toBe(true);
    vi.advanceTimersByTime(99);
    expect(result.visible.value).toBe(true);
    vi.advanceTimersByTime(1);
    expect(result.visible.value).toBe(false);
  });

  it('stays visible and unbinds activity outside fullscreen', async () => {
    vi.useFakeTimers();
    const { result } = setup(true);
    result.isFullscreen.value = false;
    await nextTick();
    vi.advanceTimersByTime(200);

    expect(result.visible.value).toBe(true);
  });
});
