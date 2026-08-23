import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { READING_MODE, STORAGE_KEYS } from '@/config/index.config';
import { VIEWER_PAGES } from '../../../../tests/fixtures/viewer';
import { mountComposable } from '../../../../tests/harness/mountComposable';
import { useViewerPersistence } from './useViewerPersistence';
import { useViewerState } from './useViewerState';

describe('useViewerPersistence lifecycle', () => {
  const storageKey = 'berserk-374';
  const key = (name: string) => `${STORAGE_KEYS.viewerPrefix}-${storageKey}-${name}`;
  const wrappers = new Set<ReturnType<typeof mountComposable>['wrapper']>();

  function setup() {
    const mounted = mountComposable(() => {
      const state = useViewerState([...VIEWER_PAGES], 0, READING_MODE.page);
      useViewerPersistence(state, storageKey);
      return state;
    });
    wrappers.add(mounted.wrapper);
    return mounted;
  }

  afterEach(() => {
    wrappers.forEach((wrapper) => wrapper.unmount());
    wrappers.clear();
  });

  it('restores saved mode and page on mount', () => {
    localStorage.setItem(key('mode'), READING_MODE.slider);
    localStorage.setItem(key('page'), '2');

    const { result: state } = setup();

    expect(state.mode.value).toBe(READING_MODE.slider);
    expect(state.currentIndex.value).toBe(2);
  });

  it('ignores malformed persisted values', () => {
    localStorage.setItem(key('mode'), 'book');
    localStorage.setItem(key('page'), '2px');

    const { result: state } = setup();

    expect(state.mode.value).toBe(READING_MODE.page);
    expect(state.currentIndex.value).toBe(0);
  });

  it('writes reactive changes under the namespaced key', async () => {
    const { result: state } = setup();

    state.setMode(READING_MODE.cascade);
    state.goToPage(3);
    await nextTick();

    expect(localStorage.getItem(key('mode'))).toBe(READING_MODE.cascade);
    expect(localStorage.getItem(key('page'))).toBe('3');
  });

  it('remains usable when storage access throws', async () => {
    const getItem = vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const setItem = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    const { result: state } = setup();
    state.goToPage(1);
    await nextTick();

    expect(state.currentIndex.value).toBe(1);
    expect(getItem).toHaveBeenCalled();
    expect(setItem).toHaveBeenCalled();
  });
});
