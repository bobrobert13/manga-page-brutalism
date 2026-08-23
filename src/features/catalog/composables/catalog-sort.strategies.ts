import { CATALOG_SORT, type CatalogSortKey } from '@/config/index.config';
import type { Manga } from '@/types/manga';

type CatalogSortStrategy = (items: readonly Manga[]) => Manga[];

function timestamp(value?: string): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export const CATALOG_SORT_STRATEGIES: Record<CatalogSortKey, CatalogSortStrategy> = {
  [CATALOG_SORT.popular]: (items) =>
    [...items].sort(
      (a, b) => (a.rank ?? Number.MAX_SAFE_INTEGER) - (b.rank ?? Number.MAX_SAFE_INTEGER)
    ),
  [CATALOG_SORT.titleAscending]: (items) =>
    [...items].sort((a, b) => a.title.localeCompare(b.title)),
  [CATALOG_SORT.titleDescending]: (items) =>
    [...items].sort((a, b) => b.title.localeCompare(a.title)),
  [CATALOG_SORT.recent]: (items) =>
    [...items].sort((a, b) => timestamp(b.updatedAt) - timestamp(a.updatedAt)),
  [CATALOG_SORT.rating]: (items) => [...items].sort((a, b) => Number(b.rating) - Number(a.rating)),
};

export function sortCatalog(items: readonly Manga[], sort: CatalogSortKey): Manga[] {
  return CATALOG_SORT_STRATEGIES[sort](items);
}
