import { http, HttpResponse } from 'msw';
import { BERSERK_CHAPTERS, CHAPTER_PAGES } from '@/data/catalog/chapters.fixture';
import { GENRES } from '@/data/catalog/genres.fixture';
import { MANGAS } from '@/data/catalog/mangas.fixture';
import type { Chapter } from '@/types/manga';

export const CATALOG_API_URL = 'https://catalog.test';

function chaptersFor(slug: string): readonly Chapter[] | undefined {
  const pages = CHAPTER_PAGES[slug];
  if (!pages) return undefined;
  if (slug === 'berserk') return BERSERK_CHAPTERS;

  return Object.keys(pages).map((number) => ({
    number,
    title: `Capítulo ${number}`,
    publishedAt: 'hace 1 mes',
  }));
}

export const catalogHandlers = [
  http.get(`${CATALOG_API_URL}/mangas`, () => HttpResponse.json(MANGAS)),
  http.get(`${CATALOG_API_URL}/genres`, () => HttpResponse.json(GENRES)),
  http.get(`${CATALOG_API_URL}/mangas/:slug`, ({ params }) => {
    const manga = MANGAS.find((item) => item.slug === params.slug);
    return manga ? HttpResponse.json(manga) : new HttpResponse(null, { status: 404 });
  }),
  http.get(`${CATALOG_API_URL}/mangas/:slug/chapters`, ({ params }) => {
    const chapters = chaptersFor(String(params.slug));
    return chapters ? HttpResponse.json(chapters) : new HttpResponse(null, { status: 404 });
  }),
  http.get(`${CATALOG_API_URL}/mangas/:slug/chapters/:chapter/page-count`, ({ params }) => {
    const count = CHAPTER_PAGES[String(params.slug)]?.[Number(params.chapter)];
    return count === undefined
      ? new HttpResponse(null, { status: 404 })
      : HttpResponse.json({ pageCount: count });
  }),
];
