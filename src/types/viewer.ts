/**
 * Viewer-specific types shared across composables and Vue components.
 */

import type { AutoScrollMotion, ReadingMode } from '@/config/index.config';
import type { ComputedRef, Ref } from 'vue';
import type { Manga } from '@/types/manga';

export type AutoScrollStatus = 'stopped' | 'playing' | 'paused' | 'completed';

export type AutoScrollPauseReason =
  'manual' | 'interaction' | 'mode-change' | 'zoom' | 'onboarding' | 'hidden';

export type ViewerFeedbackType = 'info' | 'error' | 'success';

export interface ViewerAutoScrollPreferences {
  intervalMs: number;
  motion: AutoScrollMotion;
}

export interface ViewerPage {
  /** 1-based page number. */
  number: number;
  /** Inline SVG markup (generated client-side). */
  svgContent: string;
  /** Optional alt text / page label. */
  title?: string;
}

export interface ViewerProps {
  mangaTitle: string;
  chapterTitle: string;
  chapterNumber: number;
  totalPages: number;
  coverColor: string;
  coverPattern: string;
  acronym: string;
  userId?: string | null;
  recentManga?: Manga | null;
  initialMode?: ReadingMode;
  storageKey?: string;
  /** Slug of the previous chapter, or null if this is the first. */
  prevChapterHref?: string | null;
  /** Slug of the next chapter, or null if this is the latest. */
  nextChapterHref?: string | null;
  /** Display label for prev chapter. */
  prevChapterLabel?: string | null;
  /** Display label for next chapter. */
  nextChapterLabel?: string | null;
}

/**
 * Viewer state contract — provided via `provide(VIEWER_STATE_KEY, state)`.
 * Implemented by `useViewerState` and mocked by `createViewerStateMock`.
 */
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

/**
 * Auto-scroll contract — provided via `provide(VIEWER_AUTO_SCROLL_KEY, autoScroll)`.
 * Implemented by `useViewerAutoScroll` and mocked by `createViewerAutoScrollMock`.
 */
export interface ViewerAutoScroll {
  status: Ref<AutoScrollStatus>;
  pauseReason: Ref<AutoScrollPauseReason | null>;
  intervalMs: Ref<number>;
  motion: Ref<AutoScrollMotion>;
  isPanelOpen: Ref<boolean>;
  prefersReducedMotion: Ref<boolean>;
  effectiveMotion: ComputedRef<AutoScrollMotion>;
  isPlaying: ComputedRef<boolean>;
  canPlay: ComputedRef<boolean>;
  play: () => void;
  pause: (reason?: AutoScrollPauseReason, announce?: boolean) => void;
  toggle: () => void;
  setIntervalMs: (value: number) => void;
  setMotion: (value: AutoScrollMotion) => void;
  setPanelOpen: (value: boolean) => void;
}
