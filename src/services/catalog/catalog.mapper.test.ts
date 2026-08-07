import { describe, expect, it } from 'vitest';
import { MEDIA_TYPE, SERIES_STATUS } from '@/config/index.config';
import { MANGAS } from '@/data/catalog/mangas.fixture';
import { isChapter, isGenre, isManga } from './catalog.mapper';

describe('catalog response guards', () => {
  const manga = MANGAS[0];

  it('accepts a complete manga response', () => {
    expect(isManga(manga)).toBe(true);
    expect(
      isManga({
        ...manga,
        type: MEDIA_TYPE.comic,
        status: SERIES_STATUS.completed,
        rank: undefined,
        updatedAt: undefined,
      })
    ).toBe(true);
  });

  it.each([
    ['slug', 1],
    ['title', null],
    ['acronym', false],
    ['author', []],
    ['coverColor', 10],
    ['volumeCount', undefined],
    ['rating', 9.5],
  ])('rejects an invalid %s field', (field, value) => {
    expect(isManga({ ...manga, [field]: value })).toBe(false);
  });

  it('rejects invalid enums, patterns, genres, and optional metadata', () => {
    expect(isManga({ ...manga, type: 'Movie' })).toBe(false);
    expect(isManga({ ...manga, status: 'Unknown' })).toBe(false);
    expect(isManga({ ...manga, coverPattern: 'gradient' })).toBe(false);
    expect(isManga({ ...manga, genres: ['Seinen', 1] })).toBe(false);
    expect(isManga({ ...manga, rank: '1' })).toBe(false);
    expect(isManga({ ...manga, updatedAt: 123 })).toBe(false);
    expect(isManga(null)).toBe(false);
  });

  it('validates required and optional chapter fields', () => {
    const chapter = {
      number: '374',
      title: 'El fin de un viaje',
      publishedAt: 'hace 3 días',
      volume: 'Vol. 42',
      read: false,
      accent: true,
    };

    expect(isChapter(chapter)).toBe(true);
    expect(isChapter({ ...chapter, number: 374 })).toBe(false);
    expect(isChapter({ ...chapter, title: null })).toBe(false);
    expect(isChapter({ ...chapter, publishedAt: undefined })).toBe(false);
    expect(isChapter({ ...chapter, volume: 42 })).toBe(false);
    expect(isChapter({ ...chapter, read: 'yes' })).toBe(false);
    expect(isChapter({ ...chapter, accent: 1 })).toBe(false);
    expect(isChapter([])).toBe(false);
  });

  it('accepts only string genre values', () => {
    expect(isGenre('Seinen')).toBe(true);
    expect(isGenre('')).toBe(true);
    expect(isGenre(1)).toBe(false);
    expect(isGenre(null)).toBe(false);
  });
});
