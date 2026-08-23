import { afterEach, describe, expect, it } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import { READING_MODE } from '@/config/index.config';
import { createViewerStateMock } from '../../../../tests/fixtures/viewerState';
import { viewerProvide } from '../../../../tests/harness/viewerProvide';
import ViewerIndicator from './ViewerIndicator.vue';

describe('ViewerIndicator', () => {
  const wrappers = new Set<VueWrapper>();

  function setup() {
    const state = createViewerStateMock();
    const wrapper = mount(ViewerIndicator, {
      global: { provide: viewerProvide(state) },
    });
    wrappers.add(wrapper);
    return { state, wrapper };
  }

  afterEach(() => {
    wrappers.forEach((wrapper) => wrapper.unmount());
    wrappers.clear();
  });

  it('announces current position and navigates with buttons', async () => {
    const { state, wrapper } = setup();

    expect(wrapper.text()).toContain('Página 2 de 4');
    await wrapper.get('[data-nav="next"]').trigger('click');
    expect(state.goToPage).toHaveBeenCalledWith(2);
    await wrapper.get('[data-nav="prev"]').trigger('click');
    expect(state.goToPage).toHaveBeenCalledWith(1);
  });

  it.each([
    ['ArrowLeft', 0],
    ['ArrowRight', 2],
    ['Home', 0],
    ['End', 3],
  ])('maps %s on the position chip to page %i', async (key, page) => {
    const { state, wrapper } = setup();

    await wrapper.get('.vp-indicator__chip').trigger('keydown', { key });

    expect(state.goToPage).toHaveBeenCalledWith(page);
  });

  it('renders only edge progress in cascade mode', async () => {
    const { state, wrapper } = setup();
    state.mode.value = READING_MODE.cascade;
    await nextTick();

    expect(wrapper.find('[data-nav="prev"]').exists()).toBe(false);
    expect(wrapper.get('.vp-indicator__edge-fill').attributes('style')).toContain('50%');
  });
});
