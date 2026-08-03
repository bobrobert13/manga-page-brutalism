import { describe, expect, it } from 'vitest';
import { useCatalogFixtureService } from './useCatalogFixtureService';

describe('useCatalogFixtureService', () => {
  const service = useCatalogFixtureService();

  it('returns a manga and its chapter metadata', async () => {
    const [manga, chapters, pageCount] = await Promise.all([
      service.getBySlug('berserk'),
      service.getChapters('berserk'),
      service.getChapterPageCount('berserk', 374),
    ]);

    expect(manga.ok && manga.data.title).toBe('BERSERK');
    expect(chapters.ok && chapters.data[0]?.number).toBe('374');
    expect(pageCount).toEqual({ ok: true, data: 18 });
  });

  it('returns not_found instead of inventing a page count', async () => {
    const result = await service.getChapterPageCount('berserk', 999);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('not_found');
      expect(result.error.status).toBe(404);
    }
  });
});
