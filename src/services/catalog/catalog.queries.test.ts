import { describe, expect, it } from 'vitest';
import { MANGAS } from '@/data/catalog/mangas.fixture';
import type { Manga } from '@/types/manga';
import { selectRelated, selectTrending } from './catalog.queries';

describe('catalog queries', () => {
  it('orders trending titles by rank without mutating the input', () => {
    const original = [...MANGAS];
    const result = selectTrending(MANGAS, 3);

    expect(result.map((manga) => manga.rank)).toEqual([1, 2, 3]);
    expect(MANGAS).toEqual(original);
  });

  it('selects related titles by shared genres and excludes the current title', () => {
    const current: Manga | undefined = MANGAS.find((manga) => manga.slug === 'berserk');
    if (!current) throw new Error('Berserk fixture is required for this test.');

    const result = selectRelated(MANGAS, current, 4);

    expect(result).toHaveLength(4);
    expect(result.some((manga) => manga.slug === current.slug)).toBe(false);
    expect(result[0]?.genres.some((genre) => current.genres.includes(genre))).toBe(true);
  });
});
