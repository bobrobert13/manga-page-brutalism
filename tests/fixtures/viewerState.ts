import { computed, ref, shallowRef } from 'vue';
import { vi } from 'vitest';
import { READING_MODE } from '@/config/index.config';
import type { ViewerState } from '@/features/viewer/composables/useViewerState';
import { VIEWER_PAGES } from './viewer';

export function createViewerStateMock(): ViewerState {
  const mode = ref(READING_MODE.page);
  const pages = shallowRef([...VIEWER_PAGES]);
  const currentIndex = ref(1);
  const totalPages = computed(() => pages.value.length);
  const isFullscreen = ref(false);
  const isDark = ref(false);
  const isOnboardingVisible = ref(false);
  const isZoomed = ref(false);
  const feedbackMessage = ref<string | null>(null);
  const feedbackType = ref<'info' | 'error' | 'success'>('info');

  const state: ViewerState = {
    mode,
    pages,
    currentIndex,
    totalPages,
    isFullscreen,
    isDark,
    isOnboardingVisible,
    isZoomed,
    feedbackMessage,
    feedbackType,
    setMode: vi.fn((nextMode) => {
      mode.value = nextMode;
    }),
    goToPage: vi.fn((index) => {
      currentIndex.value = Math.max(0, Math.min(index, totalPages.value - 1));
    }),
    goNext: vi.fn(() => {
      if (currentIndex.value >= totalPages.value - 1) return false;
      currentIndex.value += 1;
      return true;
    }),
    goPrev: vi.fn(() => {
      if (currentIndex.value <= 0) return false;
      currentIndex.value -= 1;
      return true;
    }),
    toggleFullscreen: vi.fn(async () => {
      isFullscreen.value = !isFullscreen.value;
      return isFullscreen.value;
    }),
    toggleTheme: vi.fn(() => {
      isDark.value = !isDark.value;
    }),
    toggleZoom: vi.fn(() => {
      isZoomed.value = !isZoomed.value;
    }),
    dismissOnboarding: vi.fn(() => {
      isOnboardingVisible.value = false;
    }),
    showFeedback: vi.fn((message, type = 'info') => {
      feedbackMessage.value = message;
      feedbackType.value = type;
    }),
    clearFeedback: vi.fn(() => {
      feedbackMessage.value = null;
    }),
  };

  return state;
}
