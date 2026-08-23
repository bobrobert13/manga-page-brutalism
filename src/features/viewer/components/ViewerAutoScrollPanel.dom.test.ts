import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';
import { AUTO_SCROLL_MOTION } from '@/config/index.config';
import ViewerAutoScrollPanel from '@/features/viewer/components/ViewerAutoScrollPanel.vue';
import { createViewerStateMock } from '../../../../tests/fixtures/viewerState';
import { createViewerAutoScrollMock, viewerProvide } from '../../../../tests/harness/viewerProvide';

describe('ViewerAutoScrollPanel', () => {
  const wrappers = new Set<ReturnType<typeof mount>>();

  function setup(options: { playing?: boolean; canPlay?: boolean } = {}) {
    const state = createViewerStateMock();
    const autoScroll = createViewerAutoScrollMock();
    const chromeVisible = ref(true);

    if (options.playing) {
      autoScroll.status.value = 'playing';
      autoScroll.toggle = vi.fn(() => {
        autoScroll.status.value = 'stopped';
      });
    }
    if (options.canPlay === false) {
      autoScroll.canPlay = { value: false } as never;
    }

    const wrapper = mount(ViewerAutoScrollPanel, {
      global: {
        provide: viewerProvide(state, chromeVisible, autoScroll),
      },
    });
    wrappers.add(wrapper);
    return { wrapper, autoScroll, state };
  }

  afterEach(() => {
    wrappers.forEach((wrapper) => wrapper.unmount());
    wrappers.clear();
  });

  it('shows the play button when not playing', () => {
    const { wrapper } = setup();

    const btn = wrapper.get('button.vp-auto-panel__play');
    expect(btn.text()).toContain('Iniciar auto-scroll');
    expect(btn.attributes('aria-pressed')).toBe('false');
  });

  it('shows pause state when playing', () => {
    const { wrapper } = setup({ playing: true });

    expect(wrapper.text()).toContain('AUTO · ACTIVO');
    const btn = wrapper.get('button.vp-auto-panel__play');
    expect(btn.text()).toContain('Pausar auto-scroll');
  });

  it('disables the play button when canPlay is false', () => {
    const { wrapper } = setup({ canPlay: false });

    const btn = wrapper.get('button.vp-auto-panel__play');
    const disabled = btn.attributes('disabled');
    expect(disabled).toBeDefined();
  });

  it('toggles auto-scroll on play button click', async () => {
    const { wrapper, autoScroll } = setup();

    await wrapper.get('button.vp-auto-panel__play').trigger('click');

    expect(autoScroll.toggle).toHaveBeenCalledOnce();
  });

  it('displays the interval slider with current value', () => {
    const { wrapper, autoScroll } = setup();
    autoScroll.intervalMs.value = 5000;

    const slider = wrapper.get('#vp-auto-interval');
    expect(slider.attributes('type')).toBe('range');
  });

  it('emits close when the close button is clicked', async () => {
    const { wrapper } = setup();

    await wrapper.get('button.vp-auto-panel__close').trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('emits close on Escape keydown', async () => {
    const { wrapper } = setup();

    await wrapper.find('#vp-auto-scroll-panel').trigger('keydown.escape');

    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('pressing the smooth motion button calls setMotion', async () => {
    const { wrapper, autoScroll } = setup();

    const buttons = wrapper.findAll('fieldset button');
    const smoothBtn = buttons.find((btn) => btn.text() === 'Suave');
    if (smoothBtn) await smoothBtn.trigger('click');

    expect(autoScroll.setMotion).toHaveBeenCalledWith(AUTO_SCROLL_MOTION.smooth);
  });

  it('shows reduced motion notice when prefersReducedMotion is true', async () => {
    const { wrapper, autoScroll } = setup();
    autoScroll.prefersReducedMotion.value = true;
    await nextTick();

    expect(wrapper.find('.vp-auto-panel__notice').exists()).toBe(true);
  });

  it('changes interval when the slider is adjusted', async () => {
    const { wrapper, autoScroll } = setup();

    const slider = wrapper.get('#vp-auto-interval');
    const nativeInput = slider.element as HTMLInputElement;
    nativeInput.value = '10';
    await slider.trigger('input');

    expect(autoScroll.setIntervalMs).toHaveBeenCalledWith(10_000);
  });
});
