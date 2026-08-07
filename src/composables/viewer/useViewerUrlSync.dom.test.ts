import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';
import { mountComposable } from '../../../tests/harness/mountComposable';
import { parseUrlPage, useViewerUrlSync } from './useViewerUrlSync';

describe('parseUrlPage', () => {
  it('parses, clamps, and rejects URL page values', () => {
    expect(parseUrlPage('1', 4)).toBe(0);
    expect(parseUrlPage('99', 4)).toBe(3);
    expect(parseUrlPage('0', 4)).toBeNull();
    expect(parseUrlPage('2px', 4)).toBeNull();
    expect(parseUrlPage(null, 4)).toBeNull();
    expect(parseUrlPage('1', 0)).toBeNull();
  });
});

describe('useViewerUrlSync', () => {
  const wrappers = new Set<ReturnType<typeof mountComposable>['wrapper']>();

  function setup(total = 4) {
    const mounted = mountComposable(() => {
      const currentIndex = ref(0);
      const totalPages = ref(total);
      useViewerUrlSync(currentIndex, totalPages);
      return { currentIndex, totalPages };
    });
    wrappers.add(mounted.wrapper);
    return mounted;
  }

  afterEach(() => {
    wrappers.forEach((wrapper) => wrapper.unmount());
    wrappers.clear();
    history.replaceState(null, '', '/');
  });

  it('restores and clamps the initial page from the URL', () => {
    history.replaceState(null, '', '/reader?page=99');

    const { result } = setup();

    expect(result.currentIndex.value).toBe(3);
  });

  it('writes reactive page changes while preserving query and hash', async () => {
    history.replaceState(null, '', '/reader?mode=page#stage');
    const { result } = setup();

    result.currentIndex.value = 2;
    await nextTick();

    expect(window.location.pathname).toBe('/reader');
    expect(window.location.search).toContain('mode=page');
    expect(window.location.search).toContain('page=3');
    expect(window.location.hash).toBe('#stage');
  });

  it('reacts to valid history navigation and ignores malformed values', () => {
    const { result } = setup();
    history.replaceState(null, '', '/reader?page=2');
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(result.currentIndex.value).toBe(1);

    history.replaceState(null, '', '/reader?page=2px');
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(result.currentIndex.value).toBe(1);
  });

  it('removes the popstate listener when unmounted', () => {
    const removeEventListener = vi.spyOn(window, 'removeEventListener');
    const mounted = setup();

    mounted.wrapper.unmount();
    wrappers.delete(mounted.wrapper);

    expect(removeEventListener).toHaveBeenCalledWith('popstate', expect.any(Function));
  });
});
