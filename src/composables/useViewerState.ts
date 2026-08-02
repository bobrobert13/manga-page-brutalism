/**
 * Central reactive state for the manga viewer.
 * Uses provide/inject so sub-components can read state without prop drilling.
 */
import { computed, inject, provide, ref, shallowRef, type InjectionKey, type Ref } from 'vue';
import type { ReadingMode, ViewerPage } from '@/types/viewer';

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
  feedbackType: Ref<'info' | 'error' | 'success'>;

  setMode: (mode: ReadingMode) => void;
  goToPage: (index: number) => void;
  goNext: () => boolean;
  goPrev: () => boolean;
  toggleFullscreen: () => void;
  toggleTheme: () => void;
  toggleZoom: () => void;
  dismissOnboarding: () => void;
  showFeedback: (message: string, type?: 'info' | 'error' | 'success') => void;
  clearFeedback: () => void;
}

export const VIEWER_STATE_KEY: InjectionKey<ViewerState> = Symbol('viewerState');

export function useViewerState(
  pages: ViewerPage[],
  initialIndex: number = 0,
  initialMode: ReadingMode = 'cascade',
): ViewerState {
  const mode = ref<ReadingMode>(initialMode);
  const pagesRef = shallowRef<ViewerPage[]>(pages);
  const currentIndex = ref(Math.max(0, Math.min(initialIndex, pages.length - 1)));
  const totalPages = computed(() => pagesRef.value.length);
  const isFullscreen = ref(false);
  const isDark = ref(
    typeof document !== 'undefined'
      ? document.documentElement.dataset.theme === 'dark'
      : false,
  );
  const isOnboardingVisible = ref(false);
  const isZoomed = ref(false);
  const feedbackMessage = ref<string | null>(null);
  const feedbackType = ref<'info' | 'error' | 'success'>('info');

  let _feedbackTimer: ReturnType<typeof setTimeout> | null = null;

  const setMode = (m: ReadingMode) => {
    mode.value = m;
  };

  const goToPage = (index: number) => {
    currentIndex.value = Math.max(0, Math.min(index, totalPages.value - 1));
  };

  const goNext = (): boolean => {
    if (currentIndex.value < totalPages.value - 1) {
      currentIndex.value++;
      return true;
    }
    return false;
  };

  const goPrev = (): boolean => {
    if (currentIndex.value > 0) {
      currentIndex.value--;
      return true;
    }
    return false;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      isFullscreen.value = true;
    } else {
      document.exitFullscreen?.();
      isFullscreen.value = false;
    }
  };

  const toggleTheme = () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    isDark.value = next === 'dark';
    try {
      localStorage.setItem('inkpxl-theme', next);
    } catch (_) { /* noop */ }
  };

  const toggleZoom = () => {
    isZoomed.value = !isZoomed.value;
  };

  const dismissOnboarding = () => {
    isOnboardingVisible.value = false;
    try {
      localStorage.setItem('inkpxl-viewer-onboarded', '1');
    } catch (_) { /* noop */ }
  };

  const showFeedback = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    if (_feedbackTimer) clearTimeout(_feedbackTimer);
    feedbackMessage.value = message;
    feedbackType.value = type;
    _feedbackTimer = setTimeout(() => {
      feedbackMessage.value = null;
    }, 1400);
  };

  const clearFeedback = () => {
    if (_feedbackTimer) clearTimeout(_feedbackTimer);
    feedbackMessage.value = null;
  };

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

  provide(VIEWER_STATE_KEY, state);
  return state;
}

export function useInjectedViewer(): ViewerState {
  const state = inject(VIEWER_STATE_KEY);
  if (!state) throw new Error('useInjectedViewer() must be called within a <MangaViewer> tree');
  return state;
}
