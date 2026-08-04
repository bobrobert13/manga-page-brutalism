export const READING_MODE = {
  cascade: 'cascade',
  page: 'page',
  slider: 'slider',
} as const;

export type ReadingMode = (typeof READING_MODE)[keyof typeof READING_MODE];

export const STORAGE_KEYS = {
  theme: 'inkpxl-theme',
  viewerOnboarded: 'inkpxl-viewer-onboarded',
  viewerPrefix: 'inkpxl-viewer',
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
