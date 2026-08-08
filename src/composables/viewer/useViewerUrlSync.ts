/**
 * Bidirectional URL sync — keeps ?page=N in querystring in sync with state.
 * Replaces state when the URL changes (back/forward navigation).
 */
import { onMounted, onUnmounted, watch, type Ref } from 'vue';

export function parseUrlPage(value: string | null, totalPages: number): number | null {
  if (value === null || !/^\d+$/.test(value) || totalPages < 1) return null;
  const page = Number.parseInt(value, 10);
  if (!Number.isSafeInteger(page) || page < 1) return null;
  return Math.min(page - 1, totalPages - 1);
}

export function useViewerUrlSync(currentIndex: Ref<number>, totalPages: Ref<number>): void {
  function readPageFromUrl(): number | null {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return parseUrlPage(params.get('page'), totalPages.value);
  }

  function writePageToUrl(page: number): void {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('page', String(page + 1));
    try {
      history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    } catch {
      // URL synchronization is a progressive enhancement.
    }
  }

  function onPopState(): void {
    const idx = readPageFromUrl();
    if (idx !== null) currentIndex.value = idx;
  }

  onMounted(() => {
    // Restore initial page from URL if present
    const idx = readPageFromUrl();
    if (idx !== null) currentIndex.value = idx;
    window.addEventListener('popstate', onPopState);
  });

  onUnmounted(() => window.removeEventListener('popstate', onPopState));

  // Push state changes
  watch(currentIndex, (n) => writePageToUrl(n));
}
