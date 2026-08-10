export const READING_MODE = {
  cascade: 'cascade',
  page: 'page',
  slider: 'slider',
} as const;

export type ReadingMode = (typeof READING_MODE)[keyof typeof READING_MODE];

export const AUTO_SCROLL_MOTION = {
  direct: 'direct',
  smooth: 'smooth',
} as const;

export type AutoScrollMotion = (typeof AUTO_SCROLL_MOTION)[keyof typeof AUTO_SCROLL_MOTION];

export const STORAGE_KEYS = {
  theme: 'inkpxl-theme',
  viewerOnboarded: 'inkpxl-viewer-onboarded',
  viewerPrefix: 'inkpxl-viewer',
  viewerAutoScroll: 'inkpxl-viewer-auto-scroll',
  recentMangasPrefix: 'inkpxl-recent-mangas',
} as const;

export const VIEWER_CONFIG = {
  defaultMode: READING_MODE.cascade,
  feedbackDurationMs: 1_400,
  chromeIdleMs: 3_000,
  doubleTapWindowMs: 300,
  swipeThresholdPx: 60,
  pinchZoomInThreshold: 1.15,
  pinchZoomOutThreshold: 0.87,
} as const;

export const AUTO_SCROLL_CONFIG = {
  defaultIntervalMs: 8_000,
  minIntervalMs: 3_000,
  maxIntervalMs: 30_000,
  intervalStepMs: 1_000,
  smoothScrollDurationMs: 750,
  pageTransitionDurationMs: 280,
  defaultMotion: AUTO_SCROLL_MOTION.smooth,
} as const;
