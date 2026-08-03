import { onMounted, provide, type Ref } from 'vue';
import { STORAGE_KEYS, type ReadingMode } from '@/config/index.config';
import type { ViewerPage } from '@/types/viewer';
import { CHROME_VISIBLE_KEY } from './useViewerChromeVisible';
import { useViewerChromeAutoHide } from './useViewerChromeAutoHide';
import { useViewerGestures } from './useViewerGestures';
import { useViewerKeyboard } from './useViewerKeyboard';
import { useViewerPersistence } from './useViewerPersistence';
import { useViewerState } from './useViewerState';
import { useViewerUrlSync } from './useViewerUrlSync';

interface ViewerControllerOptions {
  pages: ViewerPage[];
  initialMode: ReadingMode;
  storageKey: string;
  stageElement: Ref<HTMLElement | null>;
}

export function useViewerController(options: ViewerControllerOptions) {
  const state = useViewerState(options.pages, 0, options.initialMode);

  // Restore persisted state first; a valid ?page URL then takes precedence.
  useViewerPersistence(state, options.storageKey);
  useViewerUrlSync(state.currentIndex, state.totalPages);
  useViewerKeyboard(state);
  useViewerGestures(options.stageElement, state);

  const isChromeVisible = useViewerChromeAutoHide(state.isFullscreen);
  provide(CHROME_VISIBLE_KEY, isChromeVisible);

  onMounted(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEYS.viewerOnboarded)) {
        state.isOnboardingVisible.value = true;
      }
    } catch {
      // The reader remains usable when storage is unavailable.
    }
  });

  return state;
}
