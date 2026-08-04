function segment(value: string | number): string {
  return encodeURIComponent(String(value));
}

export const CATALOG_ENDPOINTS = {
  mangas: '/mangas',
  manga: (slug: string) => `/mangas/${segment(slug)}`,
  genres: '/genres',
  chapters: (slug: string) => `/mangas/${segment(slug)}/chapters`,
  chapterPageCount: (slug: string, chapter: string | number) =>
    `/mangas/${segment(slug)}/chapters/${segment(chapter)}/page-count`,
} as const;
