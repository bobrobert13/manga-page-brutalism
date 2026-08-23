import { describe, expect, it } from 'vitest';
import { defineComponent, h, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { CHROME_VISIBLE_KEY, useViewerChromeVisible } from './useViewerChromeVisible';

describe('useViewerChromeVisible', () => {
  it('returns the injected value when provided', () => {
    const injected = ref(false);
    let result: ReturnType<typeof useViewerChromeVisible> | undefined;

    const wrapper = mount(
      defineComponent({
        setup() {
          result = useViewerChromeVisible();
          return () => h('div');
        },
      }),
      {
        global: {
          provide: { [CHROME_VISIBLE_KEY as symbol]: injected },
        },
      }
    );

    expect(result!.value).toBe(false);

    injected.value = true;
    expect(result!.value).toBe(true);

    wrapper.unmount();
  });

  it('falls back to visible (true) when no provider is present', () => {
    let result: ReturnType<typeof useViewerChromeVisible> | undefined;

    const wrapper = mount(
      defineComponent({
        setup() {
          result = useViewerChromeVisible();
          return () => h('div');
        },
      })
    );

    expect(result!.value).toBe(true);

    wrapper.unmount();
  });
});
