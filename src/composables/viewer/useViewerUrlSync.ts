/**
 * Bidirectional URL sync — keeps ?page=N in querystring in sync with state.
 * Replaces state when the URL changes (back/forward navigation).
 */
import { onMounted, onUnmounted, watch, type Ref } from 'vue';

export function useViewerUrlSync(currentIndex: Ref<number>, totalPages: Ref<number>): void {
  function readPageFromUrl(): number {
    if (typeof window === 'undefined') return 0;
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('page');
    if (!raw) return -1;
    const n = parseInt(raw, 10);
    if (isNaN(n) || n < 1) return -1;
    return Math.min(n - 1, totalPages.value - 1);
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
    if (idx >= 0) currentIndex.value = idx;
  }

  onMounted(() => {
    // Restore initial page from URL if present
    const idx = readPageFromUrl();
    if (idx >= 0) currentIndex.value = idx;
    window.addEventListener('popstate', onPopState);
  });

  onUnmounted(() => window.removeEventListener('popstate', onPopState));

  // Push state changes
  watch(currentIndex, (n) => writePageToUrl(n));
}
