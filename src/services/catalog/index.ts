import { HTTP_CONFIG, type CatalogSource } from '@/config/index.config';
import type { CatalogService } from './catalog-service.contract';
import { useCatalogFixtureService } from './useCatalogFixtureService';
import { useCatalogService } from './useCatalogService';

function readCatalogSource(): CatalogSource {
  return import.meta.env.PUBLIC_CATALOG_SOURCE === HTTP_CONFIG.catalogSource.api
    ? HTTP_CONFIG.catalogSource.api
    : HTTP_CONFIG.catalogSource.fixture;
}

export function useConfiguredCatalogService(): CatalogService {
  return readCatalogSource() === HTTP_CONFIG.catalogSource.api
    ? useCatalogService()
    : useCatalogFixtureService();
}

export type { CatalogService } from './catalog-service.contract';
export { toTrendingSidebar } from './catalog.queries';
