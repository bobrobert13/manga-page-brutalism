import { onMounted, watch } from 'vue';
import { READING_MODE, STORAGE_KEYS, type ReadingMode } from '@/config/index.config';
import type { ViewerState } from './useViewerState';

export function parseStoredMode(value: string | null): ReadingMode | null {
  return Object.values(READING_MODE).includes(value as ReadingMode) ? (value as ReadingMode) : null;
}

export function parseStoredPage(value: string | null): number | null {
  if (value === null || !/^\d+$/.test(value)) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export function useViewerPersistence(state: ViewerState, storageKey: string): void {
  const namespacedKey = (key: string) => `${STORAGE_KEYS.viewerPrefix}-${storageKey}-${key}`;

  function read(key: string): string | null {
    try {
      return localStorage.getItem(namespacedKey(key));
    } catch {
      return null;
    }
  }

  function write(key: string, value: string): void {
    try {
      localStorage.setItem(namespacedKey(key), value);
    } catch {
      // Reader progress remains usable without persistence.
    }
  }

  onMounted(() => {
    const savedMode = parseStoredMode(read('mode'));
    if (savedMode) state.setMode(savedMode);

    const savedPage = parseStoredPage(read('page'));
    if (savedPage !== null) state.goToPage(savedPage);
  });

  watch(state.mode, (mode) => write('mode', mode));
  watch(state.currentIndex, (index) => write('page', String(index)));
}
