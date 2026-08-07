import { defineComponent, h, type ComponentPublicInstance } from 'vue';
import { mount, type VueWrapper } from '@vue/test-utils';

export interface MountedComposable<T> {
  result: T;
  wrapper: VueWrapper<ComponentPublicInstance>;
}

export function mountComposable<T>(useComposable: () => T): MountedComposable<T> {
  let result: T | undefined;
  const wrapper = mount(
    defineComponent({
      setup() {
        result = useComposable();
        return () => h('div');
      },
    })
  );

  if (result === undefined) {
    throw new Error('The composable did not return a value during setup.');
  }

  return { result, wrapper };
}

export function mountLifecycle(useComposable: () => void): VueWrapper<ComponentPublicInstance> {
  return mount(
    defineComponent({
      setup() {
        useComposable();
        return () => h('div');
      },
    })
  );
}
