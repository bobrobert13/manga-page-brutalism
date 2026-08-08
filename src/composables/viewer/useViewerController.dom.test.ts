import { afterEach, describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { READING_MODE, STORAGE_KEYS } from '@/config/index.config';
import { VIEWER_PAGES } from '../../../tests/fixtures/viewer';
import { mountComposable } from '../../../tests/harness/mountComposable';
import { useViewerController } from './useViewerController';

describe('useViewerController', () => {
  const wrappers = new Set<ReturnType<typeof mountComposable>['wrapper']>();
  const progressKey = `${STORAGE_KEYS.viewerPrefix}-berserk-374-page`;

  function setup() {
    const mounted = mountComposable(() =>
      useViewerController({
        pages: [...VIEWER_PAGES],
        initialMode: READING_MODE.page,
        storageKey: 'berserk-374',
        stageElement: ref(null),
      })
    );
    wrappers.add(mounted.wrapper);
    return mounted;
  }

  afterEach(() => {
    wrappers.forEach((wrapper) => wrapper.unmount());
    wrappers.clear();
    history.replaceState(null, '', '/');
  });

  it('gives a valid URL page precedence over persisted progress', () => {
    localStorage.setItem(progressKey, '1');
    history.replaceState(null, '', '/reader?page=3');

    const { result: state } = setup();

    expect(state.currentIndex.value).toBe(2);
  });

  it('shows onboarding only until it has been dismissed', () => {
    const first = setup();
    expect(first.result.isOnboardingVisible.value).toBe(true);
    first.wrapper.unmount();
    wrappers.delete(first.wrapper);

    localStorage.setItem(STORAGE_KEYS.viewerOnboarded, '1');
    const returning = setup();
    expect(returning.result.isOnboardingVisible.value).toBe(false);
  });
});
