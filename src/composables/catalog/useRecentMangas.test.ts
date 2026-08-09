import { afterEach, describe, expect, it, vi } from 'vitest';
import { CATALOG_CONFIG } from '@/config/index.config';
import type { Manga } from '@/types/manga';
import {
  getRecentMangasStorageKey,
  parseRecentMangas,
  readRecentMangas,
  recordRecentManga,
  serializeRecentMangas,
  upsertRecentManga,
} from './useRecentMangas';

const manga = (slug: string): Manga => ({
  slug,
  title: slug.toUpperCase(),
  acronym: slug.slice(0, 2).toUpperCase(),
  author: 'Author',
  type: 'Manga',
  status: 'En curso',
  genres: ['Seinen'],
  coverColor: '#111111',
  coverPattern: 'dots',
  volumeCount: 'Vol. 1',
  rating: '9.0',
});

describe('recent manga persistence', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses a user-specific storage key', () => {
    expect(getRecentMangasStorageKey('user_alpha')).not.toBe(
      getRecentMangasStorageKey('user_beta')
    );
  });

  it('moves a repeated title to the front and caps the history', () => {
    const items = Array.from({ length: CATALOG_CONFIG.recentLimit }, (_, index) => ({
      manga: manga(`manga-${index}`),
      chapterNumber: index + 1,
      viewedAt: CATALOG_CONFIG.recentLimit - index,
    }));

    const result = upsertRecentManga(items, {
      manga: manga('manga-new'),
      chapterNumber: 99,
      viewedAt: 100,
    });

    expect(result).toHaveLength(CATALOG_CONFIG.recentLimit);
    expect(result[0]?.manga.slug).toBe('manga-new');
    expect(result[0]?.chapterNumber).toBe(99);
    expect(result.some((item) => item.manga.slug === 'manga-3')).toBe(false);

    const repeated = upsertRecentManga(result, {
      manga: manga('manga-2'),
      chapterNumber: 100,
      viewedAt: 101,
    });
    expect(repeated[0]?.manga.slug).toBe('manga-2');
  });

  it('ignores malformed storage data and preserves valid records', () => {
    expect(parseRecentMangas('{broken')).toEqual([]);

    const valid = {
      manga: manga('valid'),
      chapterNumber: 3,
      viewedAt: 10,
    };
    const parsed = parseRecentMangas(serializeRecentMangas([valid]));
    expect(parsed).toEqual([valid]);
  });

  it('keeps browser history isolated between authenticated users', () => {
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    });

    recordRecentManga('user-alpha', manga('alpha-title'), 12, 100);
    recordRecentManga('user-beta', manga('beta-title'), 4, 200);

    expect(readRecentMangas('user-alpha')[0]?.manga.slug).toBe('alpha-title');
    expect(readRecentMangas('user-beta')[0]?.manga.slug).toBe('beta-title');
  });
});
