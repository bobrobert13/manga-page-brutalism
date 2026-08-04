import type { Manga } from '@/types/manga';

export function selectFeatured(mangas: readonly Manga[], limit: number): readonly Manga[] {
  return mangas.slice(0, limit);
}

export function selectTrending(mangas: readonly Manga[], limit: number): readonly Manga[] {
  return mangas
    .filter((manga) => manga.rank !== undefined)
    .toSorted((a, b) => (a.rank ?? Number.MAX_SAFE_INTEGER) - (b.rank ?? Number.MAX_SAFE_INTEGER))
    .slice(0, limit);
}

export function selectRelated(
  mangas: readonly Manga[],
  current: Manga,
  limit: number
): readonly Manga[] {
  return mangas
    .filter((manga) => manga.slug !== current.slug)
    .toSorted(
      (a, b) =>
        b.genres.filter((genre) => current.genres.includes(genre)).length -
        a.genres.filter((genre) => current.genres.includes(genre)).length
    )
    .slice(0, limit);
}

export function toTrendingSidebar(
  mangas: readonly Manga[],
  limit: number
): readonly Pick<Manga, 'title' | 'slug' | 'rank'>[] {
  return selectTrending(mangas, limit).map(({ title, slug, rank }) => ({ title, slug, rank }));
}
