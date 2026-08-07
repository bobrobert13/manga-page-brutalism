import { afterEach, describe, expect, it } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createViewerStateMock } from '../../../tests/fixtures/viewerState';
import { viewerProvide } from '../../../tests/harness/viewerProvide';
import ViewerFeedback from './ViewerFeedback.vue';

describe('ViewerFeedback', () => {
  const wrappers = new Set<VueWrapper>();

  afterEach(() => {
    wrappers.forEach((wrapper) => wrapper.unmount());
    wrappers.clear();
  });

  it('reacts to feedback message and semantic type', async () => {
    const state = createViewerStateMock();
    const wrapper = mount(ViewerFeedback, {
      global: { provide: viewerProvide(state) },
    });
    wrappers.add(wrapper);
    expect(wrapper.find('[role="status"]').exists()).toBe(false);

    state.feedbackMessage.value = 'Guardado';
    state.feedbackType.value = 'success';
    await nextTick();

    const status = wrapper.get('[role="status"]');
    expect(status.text()).toBe('Guardado');
    expect(status.classes()).toContain('vp-feedback--success');
    expect(status.attributes('aria-live')).toBe('polite');
  });
});
