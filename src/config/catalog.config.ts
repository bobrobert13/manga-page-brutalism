export const SERIES_STATUS = {
  ongoing: 'En curso',
  completed: 'Completo',
  hiatus: 'En pausa',
} as const;

export type SeriesStatus = (typeof SERIES_STATUS)[keyof typeof SERIES_STATUS];

export const MEDIA_TYPE = {
  manga: 'Manga',
  comic: 'Cómic',
  webtoon: 'Webtoon',
  lightNovel: 'Novela Ligera',
} as const;

export type MediaType = (typeof MEDIA_TYPE)[keyof typeof MEDIA_TYPE];

export const CATALOG_SORT = {
  popular: 'popular',
  titleAscending: 'az',
  titleDescending: 'za',
  recent: 'recent',
  rating: 'rating',
} as const;

export type CatalogSortKey = (typeof CATALOG_SORT)[keyof typeof CATALOG_SORT];

export const CATALOG_SORT_OPTIONS: readonly {
  value: CatalogSortKey;
  label: string;
}[] = [
  { value: CATALOG_SORT.popular, label: 'Más populares' },
  { value: CATALOG_SORT.titleAscending, label: 'A — Z' },
  { value: CATALOG_SORT.titleDescending, label: 'Z — A' },
  { value: CATALOG_SORT.recent, label: 'Más recientes' },
  { value: CATALOG_SORT.rating, label: 'Mejor calificados' },
];

export const CATALOG_CONFIG = {
  allGenresLabel: 'Todos',
  featuredLimit: 8,
  trendingLimit: 8,
  trendingSidebarLimit: 3,
  relatedLimit: 4,
  defaultPageSize: 24,
} as const;
