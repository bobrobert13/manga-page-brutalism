import type { Chapter, Genre, Manga } from '@/types/manga';
import type { ServiceResult } from '@/services/shared/service-result';

export interface ServiceRequestOptions {
  signal?: AbortSignal;
}

export interface CatalogService {
  getAll(options?: ServiceRequestOptions): Promise<ServiceResult<readonly Manga[]>>;
  getBySlug(slug: string, options?: ServiceRequestOptions): Promise<ServiceResult<Manga>>;
  getGenres(options?: ServiceRequestOptions): Promise<ServiceResult<readonly Genre[]>>;
  getChapters(
    slug: string,
    options?: ServiceRequestOptions
  ): Promise<ServiceResult<readonly Chapter[]>>;
  getChapterPageCount(
    slug: string,
    chapter: number,
    options?: ServiceRequestOptions
  ): Promise<ServiceResult<number>>;
  getFeatured(
    limit?: number,
    options?: ServiceRequestOptions
  ): Promise<ServiceResult<readonly Manga[]>>;
  getTrending(
    limit?: number,
    options?: ServiceRequestOptions
  ): Promise<ServiceResult<readonly Manga[]>>;
  getRelated(
    manga: Manga,
    limit?: number,
    options?: ServiceRequestOptions
  ): Promise<ServiceResult<readonly Manga[]>>;
}
