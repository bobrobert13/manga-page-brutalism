import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';
import { mountComposable } from '../../../../tests/harness/mountComposable';
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

  it('ignores activity when not in fullscreen', () => {
    vi.useFakeTimers();
    const { result } = setup(false);

    document.dispatchEvent(new MouseEvent('mousemove'));
    vi.advanceTimersByTime(200);

    expect(result.visible.value).toBe(true);
  });

  it('locks chrome visibility when isLocked is true', async () => {
    vi.useFakeTimers();
    const isFullscreen = ref(true);
    const isLocked = ref(false);
    const mounted = mountComposable(() => ({
      isFullscreen,
      visible: useViewerChromeAutoHide(isFullscreen, 100, isLocked),
    }));
    wrappers.add(mounted.wrapper);

    vi.advanceTimersByTime(100);
    expect(mounted.result.visible.value).toBe(false);

    // Show chrome by activity
    document.dispatchEvent(new MouseEvent('mousemove'));
    expect(mounted.result.visible.value).toBe(true);

    // Lock — should prevent hiding
    isLocked.value = true;
    await nextTick();
    vi.advanceTimersByTime(200);
    expect(mounted.result.visible.value).toBe(true);

    // Unlock — should schedule hiding again
    isLocked.value = false;
    await nextTick();
    vi.advanceTimersByTime(100);
    expect(mounted.result.visible.value).toBe(false);
  });

  it('cleans up timers and listeners on unmount', () => {
    vi.useFakeTimers();
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const { wrapper } = setup(true);

    wrapper.unmount();
    wrappers.delete(wrapper);

    expect(removeSpy).toHaveBeenCalled();
  });
});
