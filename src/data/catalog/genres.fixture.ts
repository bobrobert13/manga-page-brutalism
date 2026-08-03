import type { Genre } from '@/types/manga';

export const GENRES = [
  'Shonen',
  'Seinen',
  'Shoujo',
  'Superhéroes',
  'Terror',
  'Fantasía',
  'Ciencia Ficción',
  'Histórico',
  'Drama',
  'Indie',
  'Webtoon',
  'Novela Ligera',
] as const satisfies readonly Genre[];
