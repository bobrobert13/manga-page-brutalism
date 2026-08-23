import { onMounted } from 'vue';
import { CATALOG_CONFIG, STORAGE_KEYS } from '@/config/index.config';
import { isManga } from '@/composables/services/catalog/catalog.mapper';
import type { Manga } from '@/types/manga';
import type { RecentManga } from '@/types/recent-manga';

function isRecentManga(value: unknown): value is RecentManga {
  if (typeof value !== 'object' || value === null) return false;

  const item = value as Partial<RecentManga>;
  return (
    isManga(item.manga) &&
    typeof item.chapterNumber === 'number' &&
    Number.isInteger(item.chapterNumber) &&
    item.chapterNumber > 0 &&
    typeof item.viewedAt === 'number' &&
    Number.isFinite(item.viewedAt)
  );
}

export function getRecentMangasStorageKey(userId: string): string {
  return `${STORAGE_KEYS.recentMangasPrefix}-${encodeURIComponent(userId)}`;
}

export function parseRecentMangas(value: string | null): readonly RecentManga[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(isRecentManga)
      .toSorted((a, b) => b.viewedAt - a.viewedAt)
      .slice(0, CATALOG_CONFIG.recentLimit);
  } catch {
    return [];
  }
}

export function upsertRecentManga(
  items: readonly RecentManga[],
  next: RecentManga,
  limit = CATALOG_CONFIG.recentLimit
): readonly RecentManga[] {
  return [next, ...items.filter((item) => item.manga.slug !== next.manga.slug)].slice(0, limit);
}

export function serializeRecentMangas(items: readonly RecentManga[]): string {
  return JSON.stringify(items);
}

export function readRecentMangas(userId: string): readonly RecentManga[] {
  try {
    return parseRecentMangas(localStorage.getItem(getRecentMangasStorageKey(userId)));
  } catch {
    return [];
  }
}

export function recordRecentManga(
  userId: string,
  manga: Manga,
  chapterNumber: number,
  viewedAt = Date.now()
): void {
  if (!userId || !Number.isInteger(chapterNumber) || chapterNumber < 1) return;

  try {
    const current = readRecentMangas(userId);
    const next = upsertRecentManga(current, { manga, chapterNumber, viewedAt });
    localStorage.setItem(getRecentMangasStorageKey(userId), serializeRecentMangas(next));
  } catch {
    // Recent history is an enhancement; reading must remain usable without storage.
  }
}

export function useRecentManga(
  userId: string | null | undefined,
  manga: Manga | null | undefined,
  chapterNumber: number
): void {
  onMounted(() => {
    if (userId && manga) recordRecentManga(userId, manga, chapterNumber);
  });
}
