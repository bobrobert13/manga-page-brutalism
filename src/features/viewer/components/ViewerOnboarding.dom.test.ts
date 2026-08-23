import { afterEach, describe, expect, it } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createViewerStateMock } from '../../../../tests/fixtures/viewerState';
import { viewerProvide } from '../../../../tests/harness/viewerProvide';
import ViewerOnboarding from './ViewerOnboarding.vue';

describe('ViewerOnboarding', () => {
  const wrappers = new Set<VueWrapper>();

  function setup() {
    const state = createViewerStateMock();
    const wrapper = mount(ViewerOnboarding, {
      global: { provide: viewerProvide(state) },
    });
    wrappers.add(wrapper);
    return { state, wrapper };
  }

  afterEach(() => {
    wrappers.forEach((wrapper) => wrapper.unmount());
    wrappers.clear();
  });

  it('teleports visible onboarding semantics to the document body', async () => {
    const { state } = setup();
    state.isOnboardingVisible.value = true;
    await nextTick();

    const dialog = document.body.querySelector('[role="dialog"]');
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(dialog?.textContent).toContain('Tres modos, una sola obra');
  });

  it('dismisses from the action button and overlay background', async () => {
    const { state } = setup();
    state.isOnboardingVisible.value = true;
    await nextTick();
    const close = document.body.querySelector<HTMLButtonElement>('.vp-onboard__close');
    close?.click();
    expect(state.dismissOnboarding).toHaveBeenCalledOnce();

    state.isOnboardingVisible.value = true;
    await nextTick();
    const overlay = document.body.querySelector<HTMLElement>('.vp-onboard');
    overlay?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(state.dismissOnboarding).toHaveBeenCalledTimes(2);
  });

  it('does not dismiss when the panel itself is clicked', async () => {
    const { state } = setup();
    state.isOnboardingVisible.value = true;
    await nextTick();

    document.body
      .querySelector<HTMLElement>('.vp-onboard__panel')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(state.dismissOnboarding).not.toHaveBeenCalled();
  });
});
