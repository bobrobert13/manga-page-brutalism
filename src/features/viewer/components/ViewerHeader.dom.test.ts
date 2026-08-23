import { afterEach, describe, expect, it } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { READING_MODE } from '@/config/index.config';
import { createViewerStateMock } from '../../../../tests/fixtures/viewerState';
import { viewerProvide } from '../../../../tests/harness/viewerProvide';
import ViewerHeader from './ViewerHeader.vue';

describe('ViewerHeader', () => {
  const wrappers = new Set<VueWrapper>();

  function setup() {
    const state = createViewerStateMock();
    const wrapper = mount(ViewerHeader, {
      attachTo: document.body,
      props: {
        mangaTitle: 'BERSERK',
        chapterTitle: 'El fin de un viaje',
        chapterNumber: 374,
        prevChapterHref: '/titulo/berserk/373',
        nextChapterHref: '/titulo/berserk/375',
        prevChapterLabel: 'Cap. 373',
        nextChapterLabel: 'Cap. 375',
      },
      global: { provide: viewerProvide(state) },
    });
    wrappers.add(wrapper);
    return { state, wrapper };
  }

  afterEach(() => {
    wrappers.forEach((wrapper) => wrapper.unmount());
    wrappers.clear();
  });

  it('renders chapter navigation and current mode semantics', () => {
    const { wrapper } = setup();

    expect(wrapper.text()).toContain('BERSERK');
    expect(wrapper.get('[title="Capítulo anterior"]').attributes('href')).toBe(
      '/titulo/berserk/373'
    );
    expect(wrapper.get('[title="Capítulo siguiente"]').attributes('href')).toBe(
      '/titulo/berserk/375'
    );
    expect(wrapper.get('[role="tab"][aria-selected="true"]').text()).toBe('Página');
  });

  it('changes mode and reports feedback from a tab click', async () => {
    const { state, wrapper } = setup();
    const cascade = wrapper.findAll('[role="tab"]')[0];
    if (!cascade) throw new Error('Missing cascade tab.');

    await cascade.trigger('click');

    expect(state.setMode).toHaveBeenCalledWith(READING_MODE.cascade);
    expect(state.showFeedback).toHaveBeenCalledWith('Modo cascade');
    expect(cascade.attributes('aria-selected')).toBe('true');
  });

  it('wraps keyboard navigation between mode tabs', async () => {
    const { state, wrapper } = setup();
    const tabs = wrapper.findAll('[role="tab"]');

    await tabs[2]?.trigger('keydown', { key: 'ArrowRight' });

    expect(state.setMode).toHaveBeenCalledWith(READING_MODE.cascade);
    expect(document.activeElement?.id).toBe('vp-tab-cascade');
  });

  it('emits close from the close control', async () => {
    const { wrapper } = setup();

    await wrapper.get('[aria-label="Cerrar visor y volver atrás"]').trigger('click');

    expect(wrapper.emitted('close')).toHaveLength(1);
  });
});
