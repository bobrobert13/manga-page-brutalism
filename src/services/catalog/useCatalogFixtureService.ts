import { CATALOG_CONFIG } from '@/config/index.config';
import { BERSERK_CHAPTERS, CHAPTER_PAGES } from '@/data/catalog/chapters.fixture';
import { GENRES } from '@/data/catalog/genres.fixture';
import { MANGAS } from '@/data/catalog/mangas.fixture';
import { createServiceError } from '@/services/shared/service-error';
import { failure, success } from '@/services/shared/service-result';
import type { Chapter } from '@/types/manga';
import type { CatalogService } from './catalog-service.contract';
import { selectFeatured, selectRelated, selectTrending } from './catalog.queries';

function getFixtureChapters(slug: string): readonly Chapter[] {
  const pages = CHAPTER_PAGES[slug];
  if (!pages) return [];

  const knownNumbers = new Set(Object.keys(pages));
  if (slug === 'berserk') {
    return BERSERK_CHAPTERS.filter((chapter) => knownNumbers.has(chapter.number));
  }

  return Object.keys(pages).map((number) => ({
    number,
    title: `Capítulo ${number}`,
    publishedAt: 'hace 1 mes',
  }));
}

export function useCatalogFixtureService(): CatalogService {
  return {
    async getAll() {
      return success(MANGAS);
    },
    async getBySlug(slug) {
      const manga = MANGAS.find((item) => item.slug === slug);
      return manga
        ? success(manga)
        : failure(
            createServiceError('not_found', 'No encontramos el título solicitado.', { status: 404 })
          );
    },
    async getGenres() {
      return success(GENRES);
    },
    async getChapters(slug) {
      if (!MANGAS.some((item) => item.slug === slug)) {
        return failure(
          createServiceError('not_found', 'No encontramos el título solicitado.', { status: 404 })
        );
      }
      return success(getFixtureChapters(slug));
    },
    async getChapterPageCount(slug, chapter) {
      const count = CHAPTER_PAGES[slug]?.[chapter];
      return count === undefined
        ? failure(
            createServiceError('not_found', 'No encontramos el capítulo solicitado.', {
              status: 404,
            })
          )
        : success(count);
    },
    async getFeatured(limit = CATALOG_CONFIG.featuredLimit) {
      return success(selectFeatured(MANGAS, limit));
    },
    async getTrending(limit = CATALOG_CONFIG.trendingLimit) {
      return success(selectTrending(MANGAS, limit));
    },
    async getRelated(manga, limit = CATALOG_CONFIG.relatedLimit) {
      return success(selectRelated(MANGAS, manga, limit));
    },
  };
}
