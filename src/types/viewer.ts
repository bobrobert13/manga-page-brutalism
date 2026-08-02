/**
 * Viewer-specific types shared across composables and Vue components.
 */

export type ReadingMode = 'cascade' | 'page' | 'slider';

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
