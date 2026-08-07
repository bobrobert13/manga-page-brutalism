import { afterEach, describe, expect, it } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { ref } from 'vue';
import { createViewerStateMock } from '../../../tests/fixtures/viewerState';
import { viewerProvide } from '../../../tests/harness/viewerProvide';
import ViewerControls from './ViewerControls.vue';

describe('ViewerControls', () => {
  const wrappers = new Set<VueWrapper>();

  function setup(chromeVisible = true) {
    const state = createViewerStateMock();
    const wrapper = mount(ViewerControls, {
      global: { provide: viewerProvide(state, ref(chromeVisible)) },
    });
    wrappers.add(wrapper);
    return { state, wrapper };
  }

  afterEach(() => {
    wrappers.forEach((wrapper) => wrapper.unmount());
    wrappers.clear();
  });

  it('invokes zoom, theme, and fullscreen commands', async () => {
    const { state, wrapper } = setup();
    const buttons = wrapper.findAll('button');

    await buttons[0]?.trigger('click');
    await buttons[1]?.trigger('click');
    await buttons[2]?.trigger('click');

    expect(state.toggleZoom).toHaveBeenCalledOnce();
    expect(state.toggleTheme).toHaveBeenCalledOnce();
    expect(state.toggleFullscreen).toHaveBeenCalledOnce();
    expect(buttons[0]?.attributes('aria-pressed')).toBe('true');
    expect(buttons[2]?.attributes('aria-pressed')).toBe('true');
  });

  it('reflects hidden chrome through component state', () => {
    const { wrapper } = setup(false);

    expect(wrapper.get('[aria-label="Controles del visor"]').classes()).toContain(
      'vp-chrome--hidden'
    );
  });
});
