import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { READING_MODE } from '@/config/index.config';
import { createViewerStateMock } from '../../../tests/fixtures/viewerState';
import { mountLifecycle } from '../../../tests/harness/mountComposable';
import { useViewerKeyboard } from './useViewerKeyboard';

function press(key: string, options: KeyboardEventInit = {}, target: HTMLElement = document.body) {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...options }));
}

describe('useViewerKeyboard', () => {
  const wrappers = new Set<ReturnType<typeof mountLifecycle>>();

  function setup() {
    const state = createViewerStateMock();
    const wrapper = mountLifecycle(() => useViewerKeyboard(state));
    wrappers.add(wrapper);
    return { state, wrapper };
  }

  afterEach(() => {
    wrappers.forEach((wrapper) => wrapper.unmount());
    wrappers.clear();
  });

  it('navigates page mode and reports the current page', () => {
    const { state } = setup();

    press('ArrowRight');
    expect(state.currentIndex.value).toBe(2);
    expect(state.showFeedback).toHaveBeenLastCalledWith('Pg 3/4');

    press('ArrowLeft');
    expect(state.currentIndex.value).toBe(1);
    press('Home');
    expect(state.currentIndex.value).toBe(0);
    press('End');
    expect(state.currentIndex.value).toBe(3);
  });

  it('does not navigate arrows outside page mode or from editable controls', () => {
    const { state } = setup();
    state.mode.value = READING_MODE.cascade;
    press('ArrowRight');
    expect(state.goNext).not.toHaveBeenCalled();

    state.mode.value = READING_MODE.page;
    const input = document.body.appendChild(document.createElement('input'));
    press('ArrowRight', {}, input);
    expect(state.goNext).not.toHaveBeenCalled();
  });

  it('changes reading mode, theme, zoom, and help state', () => {
    const { state } = setup();

    press('1');
    expect(state.mode.value).toBe(READING_MODE.cascade);
    press('2');
    expect(state.mode.value).toBe(READING_MODE.page);
    press('3');
    expect(state.mode.value).toBe(READING_MODE.slider);
    press('t');
    expect(state.isDark.value).toBe(true);
    press('z');
    expect(state.isZoomed.value).toBe(true);
    press('?');
    expect(state.isOnboardingVisible.value).toBe(true);
  });

  it('uses escape precedence for onboarding, fullscreen, and history', () => {
    const { state } = setup();
    const back = vi.spyOn(history, 'back').mockImplementation(() => undefined);
    state.isOnboardingVisible.value = true;

    press('Escape');
    expect(state.dismissOnboarding).toHaveBeenCalledOnce();
    expect(back).not.toHaveBeenCalled();

    state.isFullscreen.value = true;
    press('Escape');
    expect(state.toggleFullscreen).toHaveBeenCalledOnce();

    state.isFullscreen.value = false;
    press('Escape');
    expect(back).toHaveBeenCalledOnce();
  });

  it('toggles fullscreen and reports the resulting state', async () => {
    const { state } = setup();

    press('f');
    await flushPromises();

    expect(state.isFullscreen.value).toBe(true);
    expect(state.showFeedback).toHaveBeenCalledWith('Pantalla completa');
  });

  it('activates previous and next chapter links', () => {
    setup();
    const previous = document.createElement('a');
    previous.className = 'vp-header__chapter';
    previous.title = 'Capítulo anterior';
    const next = document.createElement('a');
    next.className = 'vp-header__chapter';
    next.title = 'Capítulo siguiente';
    const previousClick = vi.spyOn(previous, 'click');
    const nextClick = vi.spyOn(next, 'click');
    document.body.append(previous, next);

    press('[');
    press(']');

    expect(previousClick).toHaveBeenCalledOnce();
    expect(nextClick).toHaveBeenCalledOnce();
  });

  it('removes the global listener when unmounted', () => {
    const removeEventListener = vi.spyOn(document, 'removeEventListener');
    const { wrapper } = setup();

    wrapper.unmount();
    wrappers.delete(wrapper);

    expect(removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
