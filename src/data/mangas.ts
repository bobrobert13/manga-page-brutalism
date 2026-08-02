/**
 * Manga catalog data layer (prototype migration).
 * Currently a typed TS module. When the catalog grows, migrate to
 * Astro Content Collections (src/content/mangas/*.md) without changing
 * the shape of the Manga interface in src/types/manga.ts.
 */
import type { Chapter, Manga, Stat } from '@/types/manga';

export const MANGAS: readonly Manga[] = [
  {
    slug: 'one-piece',
    title: 'ONE PIECE',
    acronym: 'OP',
    titleJp: 'ワンピース',
    titleRomaji: 'Wan Pīsu',
    author: 'Eiichiro Oda',
    type: 'Manga',
    status: 'En curso',
    genres: ['Shonen', 'Aventura', 'Acción'],
    coverColor: '#C62828',
    coverPattern: 'dots',
    volumeCount: 'Vol. 107+',
    rating: '9.4',
    rank: 2,
    format: 'manga',
  },
  {
    slug: 'berserk',
    title: 'BERSERK',
    acronym: 'BS',
    titleJp: 'ベルセルク',
    titleRomaji: 'Beruseruku',
    author: 'Kentaro Miura',
    type: 'Manga',
    status: 'En curso',
    genres: ['Seinen', 'F. Oscura', 'Acción'],
    coverColor: '#1A0A0A',
    coverPattern: 'cross',
    volumeCount: 'Vol. 41+',
    rating: '9.6',
    rank: 1,
    format: 'manga',
  },
  {
    slug: 'batman-the-dark-knight-returns',
    title: 'BATMAN: TDKR',
    acronym: 'TDKR',
    author: 'Frank Miller',
    type: 'Cómic',
    status: 'Completo',
    genres: ['Superhéroes', 'Distopía', 'Obra maestra'],
    coverColor: '#1B1B1B',
    coverPattern: 'wash',
    volumeCount: 'Completo',
    rating: '9.3',
    rank: 4,
    format: 'comic',
  },
  {
    slug: 'chainsaw-man',
    title: 'CHAINSAW MAN',
    acronym: 'CSM',
    author: 'Tatsuki Fujimoto',
    type: 'Manga',
    status: 'En curso',
    genres: ['Shonen', 'Terror', 'Acción'],
    coverColor: '#E65100',
    coverPattern: 'lines',
    volumeCount: 'Vol. 17+',
    rating: '9.1',
    rank: 3,
    format: 'manga',
  },
  {
    slug: 'vagabond',
    title: 'VAGABOND',
    acronym: 'VB',
    author: 'Takehiko Inoue',
    type: 'Manga',
    status: 'En pausa',
    genres: ['Seinen', 'Histórico', 'Artes Marciales'],
    coverColor: '#3E2723',
    coverPattern: 'wash',
    volumeCount: 'Vol. 37',
    rating: '9.5',
    format: 'manga',
  },
  {
    slug: 'watchmen',
    title: 'WATCHMEN',
    acronym: 'WM',
    author: 'Alan Moore',
    type: 'Cómic',
    status: 'Completo',
    genres: ['Superhéroes', 'Misterio', 'Obra maestra'],
    coverColor: '#FFD600',
    coverPattern: 'dots-dark',
    volumeCount: 'Completo',
    rating: '9.4',
    format: 'comic',
  },
  {
    slug: 'jujutsu-kaisen',
    title: 'JUJUTSU KAISEN',
    acronym: 'JK',
    author: 'Gege Akutami',
    type: 'Manga',
    status: 'En curso',
    genres: ['Shonen', 'Sobrenatural', 'Acción'],
    coverColor: '#4A148C',
    coverPattern: 'cross',
    volumeCount: 'Vol. 28+',
    rating: '9.0',
    rank: 5,
    format: 'manga',
  },
  {
    slug: 'saga',
    title: 'SAGA',
    acronym: 'SAGA',
    author: 'Brian K. Vaughan',
    type: 'Cómic',
    status: 'En curso',
    genres: ['Ciencia Ficción', 'Fantasía'],
    coverColor: '#00838F',
    coverPattern: 'lines',
    volumeCount: 'Vol. 11+',
    rating: '9.2',
    rank: 8,
    format: 'comic',
  },
  {
    slug: 'vinland-saga',
    title: 'VINLAND SAGA',
    acronym: 'VS',
    author: 'Makoto Yukimura',
    type: 'Manga',
    status: 'En curso',
    genres: ['Seinen', 'Histórico', 'Acción'],
    coverColor: '#2E7D32',
    coverPattern: 'wash',
    volumeCount: 'Vol. 28+',
    rating: '9.3',
    rank: 6,
    format: 'manga',
  },
  {
    slug: 'invincible',
    title: 'INVINCIBLE',
    acronym: 'INV',
    author: 'Robert Kirkman',
    type: 'Cómic',
    status: 'Completo',
    genres: ['Superhéroes', 'Drama'],
    coverColor: '#1565C0',
    coverPattern: 'dots',
    volumeCount: 'Vol. 25',
    rating: '9.1',
    format: 'comic',
  },
  {
    slug: 'monster',
    title: 'MONSTER',
    acronym: 'M',
    author: 'Naoki Urasawa',
    type: 'Manga',
    status: 'Completo',
    genres: ['Seinen', 'Suspenso', 'Psicológico'],
    coverColor: '#37474F',
    coverPattern: 'cross',
    volumeCount: 'Vol. 18',
    rating: '9.5',
    format: 'manga',
  },
  {
    slug: 'the-walking-dead',
    title: 'THE WALKING DEAD',
    acronym: 'TWD',
    author: 'Robert Kirkman',
    type: 'Cómic',
    status: 'Completo',
    genres: ['Terror', 'Drama'],
    coverColor: '#546E7A',
    coverPattern: 'lines',
    volumeCount: 'Vol. 32',
    rating: '8.9',
    format: 'comic',
  },
] as const;

/** Top 8 trending mangas (used in hero + trending strip). */
export const TRENDING: readonly Manga[] = MANGAS.filter((m) => m.rank !== undefined).slice(
  0,
  8
) as readonly Manga[];

/** Featured catalog (8 items for the home hero, sort matches prototype order). */
export const FEATURED: readonly Manga[] = MANGAS.slice(0, 8);

/** Most-read live sidebar list on the hero (top 3). */
export const TRENDING_NOW_SIDE: readonly Pick<Manga, 'title' | 'slug' | 'rank'>[] = MANGAS.filter(
  (m) => m.rank !== undefined && m.rank <= 3
).map((m) => ({ title: m.title, slug: m.slug, rank: m.rank }));

/** Canonical Berserk record (used by /detalle as the example entry). */
export const BERSERK: Manga = MANGAS.find((m) => m.slug === 'berserk') as Manga;

/** Stats strip on hero. */
export const HERO_STATS: readonly Stat[] = [
  { label: 'Títulos en biblioteca', value: '12.4K', tone: 'ink' },
  { label: 'Idiomas disponibles', value: '48', tone: 'paper' },
  { label: 'Lectores activos', value: '2.4M', tone: 'yellow' },
  { label: 'Satisfacción', value: '98%', tone: 'paper' },
];

/** Stats on the detail page. */
export const DETAIL_STATS: readonly Stat[] = [
  { label: 'Capítulos', value: '374+', tone: 'ink', hint: 'Actualizado · Jul 2026' },
  { label: 'Volúmenes', value: '41+', tone: 'paper', hint: 'Tankōbon · En curso' },
  { label: 'Calificación', value: '★ 9.6', tone: 'yellow', hint: 'Top 3 · Todos los tiempos' },
  { label: 'Lectores', value: '2.4M', tone: 'paper', hint: '+12% este mes' },
];

/** Chapter list for Berserk (canonical detail). */
export const BERSERK_CHAPTERS: readonly Chapter[] = [
  {
    number: '374',
    title: 'El fin de un viaje',
    volume: 'Vol. 42',
    publishedAt: 'hace 3 días',
    accent: true,
  },
  {
    number: '373',
    title: 'El horizonte sangriento',
    volume: 'Vol. 42',
    publishedAt: 'hace 2 sem',
    accent: true,
  },
  {
    number: '372',
    title: 'Huellas en la ceniza',
    volume: 'Vol. 41',
    publishedAt: 'hace 1 mes',
    accent: true,
  },
  { number: '371', title: 'El eco del cuervo', volume: 'Vol. 41', publishedAt: 'hace 1 mes' },
  { number: '370', title: 'Dos almas, una espada', volume: 'Vol. 41', publishedAt: 'hace 2 meses' },
  { number: '369', title: 'Antes de la tormenta', volume: 'Vol. 41', publishedAt: 'hace 2 meses' },
  { number: '368', title: 'El silencio del acero', volume: 'Vol. 40', publishedAt: 'hace 3 meses' },
  { number: '367', title: 'Lágrimas en la marca', volume: 'Vol. 40', publishedAt: 'hace 3 meses' },
  { number: '366', title: 'Cenizas de la Banda', volume: 'Vol. 40', publishedAt: 'hace 4 meses' },
  { number: '365', title: 'La promesa rota', volume: 'Vol. 39', publishedAt: 'hace 4 meses' },
  { number: '364', title: 'Crimson Wyrm', volume: 'Vol. 39', publishedAt: 'hace 5 meses' },
  { number: '363', title: 'Sombras sobre Elfhelm', volume: 'Vol. 39', publishedAt: 'hace 5 meses' },
];

/** Page counts per chapter (used by the viewer for SVG placeholder generation). */
export const CHAPTER_PAGES: Readonly<Record<string, Record<number, number>>> = {
  berserk: {
    374: 18,
    373: 16,
    372: 14,
    371: 14,
    370: 15,
    369: 16,
    368: 14,
    367: 15,
    366: 13,
    365: 14,
    364: 16,
    363: 15,
  },
  'one-piece': {
    1124: 17,
    1123: 16,
    1122: 15,
    1121: 14,
  },
  'chainsaw-man': {
    199: 14,
    198: 13,
    197: 15,
  },
  vagabond: {
    327: 18,
    326: 16,
    325: 14,
    1: 22,
  },
  watchmen: {
    12: 24,
    11: 22,
  },
  'batman-the-dark-knight-returns': {
    4: 28,
    3: 24,
    2: 22,
    1: 26,
  },
  'jujutsu-kaisen': {
    271: 16,
    270: 15,
    269: 14,
    268: 17,
    267: 15,
  },
  saga: {
    66: 18,
    65: 16,
    64: 15,
  },
  'vinland-saga': {
    215: 17,
    214: 16,
    213: 15,
    212: 14,
  },
  invincible: {
    148: 16,
    147: 15,
    146: 14,
    145: 17,
    144: 15,
  },
  monster: {
    165: 19,
    164: 17,
    163: 18,
    162: 16,
  },
  'the-walking-dead': {
    193: 18,
    192: 16,
    191: 15,
    190: 17,
  },
};

/**
 * Resolve chapters for a manga by slug.
 * Falls back to Berserk chapters if no seed data exists for the slug.
 */
export function getChaptersBySlug(slug: string): Chapter[] {
  // Berserk has richer chapter data (titles, dates, accent flags) from BERSERK_CHAPTERS.
  // Filter by what's seeded in CHAPTER_PAGES so the viewer stays consistent.
  const pages = CHAPTER_PAGES[slug];
  if (!pages) return [];
  const known = new Set(Object.keys(pages));
  if (slug === BERSERK.slug) {
    return BERSERK_CHAPTERS.filter((c) => known.has(c.number));
  }
  return Object.entries(pages).map(([num, _count]) => ({
    number: num,
    title: `Capítulo ${num}`,
    publishedAt: 'hace 1 mes',
  }));
}

/**
 * Get the page count for a specific chapter.
 */
export function getChapterPageCount(slug: string, chapterNumber: number): number {
  return CHAPTER_PAGES[slug]?.[chapterNumber] ?? 12;
}

/** Genres used in filters & chips. */
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
] as const;
