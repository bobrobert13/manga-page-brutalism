import { shallowMount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import MangaViewer from '@/components/MangaViewer.vue';
import ViewerControls from '@/components/viewer/ViewerControls.vue';
import ViewerFeedback from '@/components/viewer/ViewerFeedback.vue';
import ViewerIndicator from '@/components/viewer/ViewerIndicator.vue';
import ViewerOnboarding from '@/components/viewer/ViewerOnboarding.vue';
import ViewerStage from '@/components/viewer/ViewerStage.vue';

const PROPS = {
  mangaTitle: 'Berserk',
  chapterTitle: 'El espadachín negro',
  chapterNumber: 1,
  totalPages: 3,
  coverColor: '#ff3355',
  coverPattern: 'dots',
  acronym: 'BK',
  storageKey: 'berserk-1',
  prevChapterHref: null,
  nextChapterHref: '/titulo/berserk/2',
  prevChapterLabel: null,
  nextChapterLabel: 'Capítulo 2',
} as const;

function mountViewer() {
  return shallowMount(MangaViewer, { props: PROPS });
}

describe('MangaViewer', () => {
  it('wires chapter metadata and all reader regions', () => {
    const wrapper = mountViewer();
    const header = wrapper.getComponent({ name: 'ViewerHeader' });

    expect(header.props()).toMatchObject({
      mangaTitle: PROPS.mangaTitle,
      chapterTitle: PROPS.chapterTitle,
      chapterNumber: PROPS.chapterNumber,
      nextChapterHref: PROPS.nextChapterHref,
      nextChapterLabel: PROPS.nextChapterLabel,
    });
    expect(wrapper.get('.vp-stage__counter').text()).toBe('1/3');
    expect(wrapper.findComponent(ViewerStage).exists()).toBe(true);
    expect(wrapper.findComponent(ViewerIndicator).exists()).toBe(true);
    expect(wrapper.findComponent(ViewerControls).exists()).toBe(true);
    expect(wrapper.findComponent(ViewerOnboarding).exists()).toBe(true);
    expect(wrapper.findComponent(ViewerFeedback).exists()).toBe(true);
  });

  it('emits close when there is no history entry to return to', async () => {
    vi.spyOn(history, 'length', 'get').mockReturnValue(1);
    const wrapper = mountViewer();

    wrapper.getComponent({ name: 'ViewerHeader' }).vm.$emit('close');
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('returns through browser history when an entry is available', async () => {
    vi.spyOn(history, 'length', 'get').mockReturnValue(2);
    const back = vi.spyOn(history, 'back').mockImplementation(() => undefined);
    const wrapper = mountViewer();

    wrapper.getComponent({ name: 'ViewerHeader' }).vm.$emit('close');
    await wrapper.vm.$nextTick();

    expect(back).toHaveBeenCalledOnce();
    expect(wrapper.emitted('close')).toBeUndefined();
  });
});
