import type { Chapter, Genre, Manga } from '@/types/manga';
import { MEDIA_TYPE, SERIES_STATUS } from '@/config/index.config';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isManga(value: unknown): value is Manga {
  return (
    isRecord(value) &&
    typeof value.slug === 'string' &&
    typeof value.title === 'string' &&
    typeof value.acronym === 'string' &&
    typeof value.author === 'string' &&
    Object.values(MEDIA_TYPE).includes(value.type as Manga['type']) &&
    Object.values(SERIES_STATUS).includes(value.status as Manga['status']) &&
    Array.isArray(value.genres) &&
    value.genres.every(isGenre) &&
    typeof value.coverColor === 'string' &&
    ['dots', 'dots-dark', 'lines', 'cross', 'wash'].includes(String(value.coverPattern)) &&
    typeof value.volumeCount === 'string' &&
    typeof value.rating === 'string' &&
    (value.rank === undefined || typeof value.rank === 'number') &&
    (value.updatedAt === undefined || typeof value.updatedAt === 'string')
  );
}

export function isChapter(value: unknown): value is Chapter {
  return (
    isRecord(value) &&
    typeof value.number === 'string' &&
    typeof value.title === 'string' &&
    typeof value.publishedAt === 'string' &&
    (value.volume === undefined || typeof value.volume === 'string') &&
    (value.read === undefined || typeof value.read === 'boolean') &&
    (value.accent === undefined || typeof value.accent === 'boolean')
  );
}

export function isGenre(value: unknown): value is Genre {
  return typeof value === 'string';
}
