import {
  computed,
  inject,
  onMounted,
  onUnmounted,
  provide,
  ref,
  shallowRef,
  type InjectionKey,
  type Ref,
} from 'vue';
import { STORAGE_KEYS, VIEWER_CONFIG } from '@/config/index.config';
import type { ReadingMode, ViewerPage } from '@/types/viewer';

export type ViewerFeedbackType = 'info' | 'error' | 'success';

export interface ViewerState {
  mode: Ref<ReadingMode>;
  pages: Ref<ViewerPage[]>;
  currentIndex: Ref<number>;
  totalPages: Ref<number>;
  isFullscreen: Ref<boolean>;
  isDark: Ref<boolean>;
  isOnboardingVisible: Ref<boolean>;
  isZoomed: Ref<boolean>;
  feedbackMessage: Ref<string | null>;
  feedbackType: Ref<ViewerFeedbackType>;
  setMode: (mode: ReadingMode) => void;
  goToPage: (index: number) => void;
  goNext: () => boolean;
  goPrev: () => boolean;
  toggleFullscreen: () => Promise<boolean>;
  toggleTheme: () => void;
  toggleZoom: () => void;
  dismissOnboarding: () => void;
  showFeedback: (message: string, type?: ViewerFeedbackType) => void;
  clearFeedback: () => void;
}

export const VIEWER_STATE_KEY: InjectionKey<ViewerState> = Symbol('viewerState');

export function useViewerState(
  pages: ViewerPage[],
  initialIndex = 0,
  initialMode: ReadingMode = VIEWER_CONFIG.defaultMode
): ViewerState {
  const mode = ref<ReadingMode>(initialMode);
  const pagesRef = shallowRef<ViewerPage[]>(pages);
  const currentIndex = ref(Math.max(0, Math.min(initialIndex, pages.length - 1)));
  const totalPages = computed(() => pagesRef.value.length);
  const isFullscreen = ref(
    typeof document !== 'undefined' ? document.fullscreenElement !== null : false
  );
  const isDark = ref(
    typeof document !== 'undefined' ? document.documentElement.dataset.theme === 'dark' : false
  );
  const isOnboardingVisible = ref(false);
  const isZoomed = ref(false);
  const feedbackMessage = ref<string | null>(null);
  const feedbackType = ref<ViewerFeedbackType>('info');
  let feedbackTimer: ReturnType<typeof setTimeout> | null = null;

  function setMode(nextMode: ReadingMode): void {
    mode.value = nextMode;
  }

  function goToPage(index: number): void {
    currentIndex.value = Math.max(0, Math.min(index, totalPages.value - 1));
  }

  function goNext(): boolean {
    if (currentIndex.value >= totalPages.value - 1) return false;
    currentIndex.value += 1;
    return true;
  }

  function goPrev(): boolean {
    if (currentIndex.value <= 0) return false;
    currentIndex.value -= 1;
    return true;
  }

  function syncFullscreenState(): void {
    isFullscreen.value = document.fullscreenElement !== null;
  }

  async function toggleFullscreen(): Promise<boolean> {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
      syncFullscreenState();
      return isFullscreen.value;
    } catch {
      syncFullscreenState();
      return false;
    }
  }

  function toggleTheme(): void {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    isDark.value = nextTheme === 'dark';
    try {
      localStorage.setItem(STORAGE_KEYS.theme, nextTheme);
    } catch {
      // Theme persistence is optional.
    }
  }

  function toggleZoom(): void {
    isZoomed.value = !isZoomed.value;
  }

  function dismissOnboarding(): void {
    isOnboardingVisible.value = false;
    try {
      localStorage.setItem(STORAGE_KEYS.viewerOnboarded, '1');
    } catch {
      // Onboarding persistence is optional.
    }
  }

  function showFeedback(message: string, type: ViewerFeedbackType = 'info'): void {
    if (feedbackTimer) clearTimeout(feedbackTimer);
    feedbackMessage.value = message;
    feedbackType.value = type;
    feedbackTimer = setTimeout(() => {
      feedbackMessage.value = null;
      feedbackTimer = null;
    }, VIEWER_CONFIG.feedbackDurationMs);
  }

  function clearFeedback(): void {
    if (feedbackTimer) clearTimeout(feedbackTimer);
    feedbackTimer = null;
    feedbackMessage.value = null;
  }

  const state: ViewerState = {
    mode,
    pages: pagesRef,
    currentIndex,
    totalPages,
    isFullscreen,
    isDark,
    isOnboardingVisible,
    isZoomed,
    feedbackMessage,
    feedbackType,
    setMode,
    goToPage,
    goNext,
    goPrev,
    toggleFullscreen,
    toggleTheme,
    toggleZoom,
    dismissOnboarding,
    showFeedback,
    clearFeedback,
  };

  onMounted(() => {
    document.addEventListener('fullscreenchange', syncFullscreenState);
    syncFullscreenState();
  });
  onUnmounted(() => {
    document.removeEventListener('fullscreenchange', syncFullscreenState);
    if (feedbackTimer) clearTimeout(feedbackTimer);
  });

  provide(VIEWER_STATE_KEY, state);
  return state;
}

export function useInjectedViewer(): ViewerState {
  const state = inject(VIEWER_STATE_KEY);
  if (!state) {
    throw new Error('useInjectedViewer() must be called within a <MangaViewer> tree');
  }
  return state;
}
