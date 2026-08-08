import { afterEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { READING_MODE } from '@/config/index.config';
import { createViewerStateMock } from '../../../tests/fixtures/viewerState';
import { mountLifecycle } from '../../../tests/harness/mountComposable';
import { useViewerGestures } from './useViewerGestures';

function touchEvent(
  type: string,
  changedX: number,
  touches: { clientX: number; clientY: number }[] = []
) {
  const event = new Event(type, { bubbles: true });
  Object.defineProperty(event, 'changedTouches', { value: [{ clientX: changedX, clientY: 0 }] });
  Object.defineProperty(event, 'touches', { value: touches });
  return event;
}

describe('useViewerGestures', () => {
  const wrappers = new Set<ReturnType<typeof mountLifecycle>>();

  function setup() {
    const stage = document.createElement('div');
    document.body.appendChild(stage);
    vi.spyOn(stage, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 400,
      bottom: 300,
      width: 400,
      height: 300,
      toJSON: () => ({}),
    });
    const state = createViewerStateMock();
    const wrapper = mountLifecycle(() => useViewerGestures(ref(stage), state));
    wrappers.add(wrapper);
    return { stage, state, wrapper };
  }

  afterEach(() => {
    wrappers.forEach((wrapper) => wrapper.unmount());
    wrappers.clear();
  });

  it('binds click navigation to the current stage element', () => {
    const { stage, state } = setup();

    stage.dispatchEvent(new MouseEvent('click', { clientX: 50, bubbles: true }));
    expect(state.goPrev).toHaveBeenCalledOnce();
    stage.dispatchEvent(new MouseEvent('click', { clientX: 350, bubbles: true }));
    expect(state.goNext).toHaveBeenCalledOnce();
  });

  it('ignores navigation controls and non-page reading modes', () => {
    const { stage, state } = setup();
    const control = document.createElement('button');
    control.dataset.nav = 'next';
    stage.appendChild(control);

    control.dispatchEvent(new MouseEvent('click', { clientX: 350, bubbles: true }));
    state.mode.value = READING_MODE.cascade;
    stage.dispatchEvent(new MouseEvent('click', { clientX: 350, bubbles: true }));

    expect(state.goNext).not.toHaveBeenCalled();
  });

  it('toggles zoom on a double click only in page mode', () => {
    const { stage, state } = setup();

    stage.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(state.toggleZoom).toHaveBeenCalledOnce();
    state.mode.value = READING_MODE.slider;
    stage.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(state.toggleZoom).toHaveBeenCalledOnce();
  });

  it('maps horizontal swipes to page navigation', () => {
    const { stage, state } = setup();

    stage.dispatchEvent(touchEvent('touchstart', 300));
    stage.dispatchEvent(touchEvent('touchend', 100));
    expect(state.goNext).toHaveBeenCalledOnce();

    stage.dispatchEvent(touchEvent('touchstart', 100));
    stage.dispatchEvent(touchEvent('touchend', 300));
    expect(state.goPrev).toHaveBeenCalledOnce();
  });

  it('maps pinch ratios to one-shot zoom feedback', () => {
    const { stage, state } = setup();
    const start = [
      { clientX: 0, clientY: 0 },
      { clientX: 100, clientY: 0 },
    ];
    const zoomed = [
      { clientX: 0, clientY: 0 },
      { clientX: 180, clientY: 0 },
    ];

    stage.dispatchEvent(touchEvent('touchstart', 0, start));
    stage.dispatchEvent(touchEvent('touchmove', 0, zoomed));

    expect(state.toggleZoom).toHaveBeenCalledOnce();
    expect(state.showFeedback).toHaveBeenCalledWith('Zoom 2×');
  });

  it('unbinds listeners from the originally mounted stage', () => {
    const { stage, wrapper } = setup();
    const removeEventListener = vi.spyOn(stage, 'removeEventListener');

    wrapper.unmount();
    wrappers.delete(wrapper);

    expect(removeEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    expect(removeEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function));
  });
});
