import { inject, ref, type InjectionKey, type Ref } from 'vue';

export const CHROME_VISIBLE_KEY: InjectionKey<Ref<boolean>> = Symbol('viewerChromeVisible');

export function useViewerChromeVisible(): Ref<boolean> {
  return inject(CHROME_VISIBLE_KEY, ref(true));
}
