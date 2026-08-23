import { describe, expect, it } from 'vitest';
import { MANGAS } from '@/data/catalog/mangas.fixture';
import type { CatalogService } from '@/composables/services/catalog/catalog-service.contract';
import type { ServiceResult } from '@/composables/services/shared/service-result';

function unwrap<T>(result: ServiceResult<T>): T {
  if (!result.ok) throw new Error(`Expected success, received ${result.error.code}.`);
  return result.data;
}

export function catalogServiceContract(name: string, createService: () => CatalogService): void {
  describe(`${name} catalog service contract`, () => {
    it('returns the complete catalog and available genres', async () => {
      const service = createService();
      const [mangas, genres] = await Promise.all([service.getAll(), service.getGenres()]);

      expect(unwrap(mangas).map((manga) => manga.slug)).toEqual(MANGAS.map((manga) => manga.slug));
      expect(unwrap(genres)).toContain('Seinen');
    });

    it('returns a title and a not_found result for an unknown slug', async () => {
      const service = createService();
      const [found, missing] = await Promise.all([
        service.getBySlug('berserk'),
        service.getBySlug('missing'),
      ]);

      expect(unwrap(found).title).toBe('BERSERK');
      expect(missing.ok).toBe(false);
      if (!missing.ok) expect(missing.error).toMatchObject({ code: 'not_found', status: 404 });
    });

    it('returns chapter metadata and rejects an unknown title', async () => {
      const service = createService();
      const [chapters, missing] = await Promise.all([
        service.getChapters('berserk'),
        service.getChapters('missing'),
      ]);

      expect(unwrap(chapters)[0]).toMatchObject({ number: '374', title: 'El fin de un viaje' });
      expect(missing.ok).toBe(false);
      if (!missing.ok) expect(missing.error.code).toBe('not_found');
    });

    it('returns a page count without inventing missing chapter data', async () => {
      const service = createService();
      const [found, missing] = await Promise.all([
        service.getChapterPageCount('berserk', 374),
        service.getChapterPageCount('berserk', 999),
      ]);

      expect(unwrap(found)).toBe(18);
      expect(missing.ok).toBe(false);
      if (!missing.ok) expect(missing.error.code).toBe('not_found');
    });

    it('honors selection limits for derived catalog views', async () => {
      const service = createService();
      const [featured, trending] = await Promise.all([
        service.getFeatured(2),
        service.getTrending(3),
      ]);

      expect(unwrap(featured)).toHaveLength(2);
      expect(unwrap(trending).map((manga) => manga.rank)).toEqual([1, 2, 3]);
    });

    it('excludes the current title from related results', async () => {
      const service = createService();
      const current = MANGAS.find((manga) => manga.slug === 'berserk');
      if (!current) throw new Error('Berserk fixture is required for this contract.');

      const related = unwrap(await service.getRelated(current, 4));

      expect(related).toHaveLength(4);
      expect(related.some((manga) => manga.slug === current.slug)).toBe(false);
    });
  });
}
