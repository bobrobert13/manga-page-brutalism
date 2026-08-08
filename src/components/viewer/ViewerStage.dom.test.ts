import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

import ViewerStage from '@/components/viewer/ViewerStage.vue';
import type { ReadingMode } from '@/types/viewer';

import { createViewerStateMock } from '../../../tests/fixtures/viewerState';
import { viewerProvide } from '../../../tests/harness/viewerProvide';

type ObserverCallback = IntersectionObserverCallback;

class FakeIntersectionObserver implements IntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];

  readonly root = null;
  readonly rootMargin = '0px';
  readonly thresholds = [0.1];
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();
  readonly takeRecords = vi.fn(() => []);

  constructor(private readonly callback: ObserverCallback) {
    FakeIntersectionObserver.instances.push(this);
  }

  intersect(target: Element, isIntersecting = true) {
    this.callback(
      [
        {
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRatio: isIntersecting ? 1 : 0,
          intersectionRect: target.getBoundingClientRect(),
          isIntersecting,
          rootBounds: null,
          target,
          time: 0,
        },
      ],
      this
    );
  }
}

function mountStage(mode: ReadingMode = 'page') {
  const state = createViewerStateMock();
  state.mode.value = mode;
  const wrapper = mount(ViewerStage, {
    global: {
      provide: viewerProvide(state),
    },
  });

  return { state, wrapper };
}

describe('ViewerStage', () => {
  beforeEach(() => {
    FakeIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders only the selected page in page mode', async () => {
    const { state, wrapper } = mountStage();

    expect(wrapper.find('.vp-stage__page').exists()).toBe(true);
    expect(wrapper.find('.vp-page__wrap').attributes('data-page')).toBe('2');
    expect(wrapper.find('[data-page="2"]').exists()).toBe(true);

    state.isZoomed.value = true;
    await nextTick();

    expect(wrapper.get('.vp-stage').classes()).toContain('vp-stage--zoom');
  });

  it('hydrates cascade pages as they enter the viewport', async () => {
    const { wrapper } = mountStage('cascade');
    await nextTick();

    const pages = wrapper.findAll('.vp-page');
    const observer = FakeIntersectionObserver.instances.at(-1);

    expect(pages).toHaveLength(4);
    expect(pages[0].find('svg').exists()).toBe(true);
    expect(pages[1].find('svg').exists()).toBe(true);
    expect(pages[2].find('svg').exists()).toBe(false);
    expect(observer?.observe).toHaveBeenCalledTimes(4);

    observer?.intersect(pages[2].element);
    await nextTick();

    expect(pages[2].find('svg').attributes('data-page')).toBe('3');
  });

  it('disconnects the page observer when unmounted', () => {
    const { wrapper } = mountStage('slider');
    const observer = FakeIntersectionObserver.instances.at(-1);

    wrapper.unmount();

    expect(observer?.disconnect).toHaveBeenCalledOnce();
  });
});
