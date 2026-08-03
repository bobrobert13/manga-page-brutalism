import { describe, expect, it } from 'vitest';
import { CATALOG_SORT } from '@/config/index.config';
import { MANGAS } from '@/data/catalog/mangas.fixture';
import { sortCatalog } from './catalog-sort.strategies';

describe('catalog sort strategies', () => {
  it('sorts recent titles using their ISO update date', () => {
    const result = sortCatalog(MANGAS, CATALOG_SORT.recent);

    expect(result.slice(0, 3).map((manga) => manga.slug)).toEqual([
      'berserk',
      'chainsaw-man',
      'one-piece',
    ]);
  });

  it('does not mutate the source collection', () => {
    const original = [...MANGAS];

    sortCatalog(MANGAS, CATALOG_SORT.titleDescending);

    expect(MANGAS).toEqual(original);
  });
});
