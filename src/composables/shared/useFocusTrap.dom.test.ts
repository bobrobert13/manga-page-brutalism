import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';
import { mountLifecycle } from '../../../tests/harness/mountComposable';
import { useFocusTrap } from './useFocusTrap';

function visible(button: HTMLButtonElement) {
  Object.defineProperty(button, 'offsetParent', { configurable: true, value: document.body });
  return button;
}

describe('useFocusTrap', () => {
  const wrappers = new Set<ReturnType<typeof mountLifecycle>>();

  function setup() {
    const outside = visible(document.createElement('button'));
    const first = visible(document.createElement('button'));
    const last = visible(document.createElement('button'));
    const container = document.createElement('div');
    container.append(first, last);
    document.body.append(outside, container);
    outside.focus();
    const isActive = ref(false);
    const wrapper = mountLifecycle(() => useFocusTrap(ref(container), isActive));
    wrappers.add(wrapper);
    return { outside, first, last, isActive, wrapper };
  }

  afterEach(() => {
    wrappers.forEach((wrapper) => wrapper.unmount());
    wrappers.clear();
    vi.useRealTimers();
  });

  it('focuses the first control and restores previous focus', async () => {
    vi.useFakeTimers();
    const { outside, first, isActive } = setup();

    isActive.value = true;
    await nextTick();
    vi.advanceTimersByTime(50);
    expect(document.activeElement).toBe(first);

    isActive.value = false;
    await nextTick();
    expect(document.activeElement).toBe(outside);
  });

  it('wraps forward and backward tab navigation', async () => {
    vi.useFakeTimers();
    const { first, last, isActive } = setup();
    isActive.value = true;
    await nextTick();
    vi.advanceTimersByTime(50);

    last.focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(first);

    first.focus();
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true })
    );
    expect(document.activeElement).toBe(last);
  });

  it('restores focus and clears listeners when unmounted while active', async () => {
    vi.useFakeTimers();
    const removeEventListener = vi.spyOn(document, 'removeEventListener');
    const { outside, isActive, wrapper } = setup();
    isActive.value = true;
    await nextTick();

    wrapper.unmount();
    wrappers.delete(wrapper);

    expect(document.activeElement).toBe(outside);
    expect(removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
