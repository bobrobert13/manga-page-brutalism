import { computed, ref } from 'vue';
import { CATALOG_CONFIG, CATALOG_SORT, type CatalogSortKey } from '@/config/index.config';
import type { Genre, Manga } from '@/types/manga';
import { sortCatalog } from './catalog-sort.strategies';

export function useCatalogFilters(initialMangas: readonly Manga[], genres: readonly Genre[]) {
  const query = ref('');
  const selectedGenre = ref<Genre | typeof CATALOG_CONFIG.allGenresLabel>(
    CATALOG_CONFIG.allGenresLabel
  );
  const sortBy = ref<CatalogSortKey>(CATALOG_SORT.popular);

  const allGenres = computed(() => [CATALOG_CONFIG.allGenresLabel, ...genres] as const);
  const filtered = computed(() => {
    const normalizedQuery = query.value.trim().toLocaleLowerCase();
    const matches = initialMangas.filter((manga) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        manga.title.toLocaleLowerCase().includes(normalizedQuery) ||
        manga.author.toLocaleLowerCase().includes(normalizedQuery) ||
        manga.genres.some((genre) => genre.toLocaleLowerCase().includes(normalizedQuery));
      const matchesGenre =
        selectedGenre.value === CATALOG_CONFIG.allGenresLabel ||
        manga.genres.includes(selectedGenre.value);

      return matchesQuery && matchesGenre;
    });

    return sortCatalog(matches, sortBy.value);
  });

  return {
    query,
    selectedGenre,
    sortBy,
    allGenres,
    filtered,
  };
}
