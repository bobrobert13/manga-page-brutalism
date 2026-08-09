import type { Manga } from '@/types/manga';

/** A title that an authenticated user has actually opened in the reader. */
export interface RecentManga {
  manga: Manga;
  chapterNumber: number;
  viewedAt: number;
}
