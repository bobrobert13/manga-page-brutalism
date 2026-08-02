/**
 * Consumes the chrome-visible state from MangaViewer context.
 * Always returns a Ref<boolean> — defaults to `true` if outside MangaViewer.
 */
import { inject, type InjectionKey, type Ref } from 'vue';

export const CHROME_VISIBLE_KEY: InjectionKey<Ref<boolean>> = Symbol.for(
  'viewer-chrome-visible',
) as unknown as InjectionKey<Ref<boolean>>;

export function useViewerChromeVisible(): Ref<boolean> {
  const fallback: Ref<boolean> = ref(true);
  return inject(CHROME_VISIBLE_KEY, fallback);
}

import { ref } from 'vue';