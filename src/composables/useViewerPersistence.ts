/**
 * Persists viewer mode + current page to localStorage.
 * Fail-soft — swallows all storage errors.
 */
import { onMounted, watch } from 'vue';
import type { ViewerState } from './useViewerState';

export function useViewerPersistence(state: ViewerState, storageKey: string): void {
  function ns(k: string): string {
    return `inkpxl-viewer-${storageKey}-${k}`;
  }

  function read<T>(key: string, fallback: T): T {
    try {
      const v = localStorage.getItem(ns(key));
      return v !== null ? (v as unknown as T) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function write(key: string, value: string): void {
    try {
      localStorage.setItem(ns(key), value);
    } catch (_) {
      /* noop */
    }
  }

  onMounted(() => {
    const savedMode = read<string>('mode', '');
    if (savedMode && ['cascade', 'page', 'slider'].includes(savedMode)) {
      state.setMode(savedMode as 'cascade' | 'page' | 'slider');
    }
    const savedPage = read<number>('page', -1);
    if (savedPage >= 0) {
      state.goToPage(savedPage);
    }
  });

  watch(() => state.mode.value, (m) => write('mode', m));
  watch(() => state.currentIndex.value, (i) => write('page', String(i)));
}
