import { api, buildAuthHeaders, type ApiClient } from '@/services/shared/api.client';
import { createServiceError } from '@/services/shared/service-error';
import { toServiceError } from '@/services/shared/service-error.mapper';
import { failure, success, type ServiceResult } from '@/services/shared/service-result';
import type { Chapter, Genre, Manga } from '@/types/manga';
import { CATALOG_CONFIG } from '@/config/index.config';
import type { CatalogService, ServiceRequestOptions } from './catalog-service.contract';
import { CATALOG_ENDPOINTS } from './catalog.endpoints';
import { isChapter, isGenre, isManga } from './catalog.mapper';
import { selectFeatured, selectRelated, selectTrending } from './catalog.queries';

type TokenProvider = () => string | null | undefined | Promise<string | null | undefined>;

export interface CatalogServiceOptions {
  client?: ApiClient;
  getToken?: TokenProvider;
}

export function useCatalogService(options: CatalogServiceOptions = {}): CatalogService {
  const client = options.client ?? api;

  async function getRequest<T>(
    url: string,
    validate: (value: unknown) => value is T,
    request: ServiceRequestOptions = {}
  ): Promise<ServiceResult<T>> {
    try {
      const token = await options.getToken?.();
      const response = await client.get<unknown>(url, {
        signal: request.signal,
        headers: buildAuthHeaders(token),
      });
      if (!validate(response.data)) {
        return failure(createServiceError('validation', 'El servicio devolvió datos inválidos.'));
      }
      return success(response.data);
    } catch (error) {
      return failure(toServiceError(error));
    }
  }

  const service: CatalogService = {
    getAll(request) {
      return getRequest(
        CATALOG_ENDPOINTS.mangas,
        (value): value is Manga[] => Array.isArray(value) && value.every(isManga),
        request
      );
    },
    getBySlug(slug, request) {
      return getRequest(CATALOG_ENDPOINTS.manga(slug), isManga, request);
    },
    getGenres(request) {
      return getRequest(
        CATALOG_ENDPOINTS.genres,
        (value): value is Genre[] => Array.isArray(value) && value.every(isGenre),
        request
      );
    },
    getChapters(slug, request) {
      return getRequest(
        CATALOG_ENDPOINTS.chapters(slug),
        (value): value is Chapter[] => Array.isArray(value) && value.every(isChapter),
        request
      );
    },
    async getChapterPageCount(slug, chapter, request) {
      const result = await getRequest(
        CATALOG_ENDPOINTS.chapterPageCount(slug, chapter),
        (value): value is { pageCount: number } =>
          typeof value === 'object' &&
          value !== null &&
          typeof (value as { pageCount?: unknown }).pageCount === 'number',
        request
      );
      return result.ok ? success(result.data.pageCount) : result;
    },
    async getFeatured(limit = CATALOG_CONFIG.featuredLimit, request) {
      const result = await service.getAll(request);
      return result.ok ? success(selectFeatured(result.data, limit)) : result;
    },
    async getTrending(limit = CATALOG_CONFIG.trendingLimit, request) {
      const result = await service.getAll(request);
      return result.ok ? success(selectTrending(result.data, limit)) : result;
    },
    async getRelated(manga, limit = CATALOG_CONFIG.relatedLimit, request) {
      const result = await service.getAll(request);
      return result.ok ? success(selectRelated(result.data, manga, limit)) : result;
    },
  };

  return service;
}
