/**
 * Domain types — shared by Astro components, Vue islands & data layer.
 * Migrate to Content Collections once the catalog exceeds ~50 titles.
 */

/** Cover overlay pattern key. */
export type PatternKey = 'dots' | 'dots-dark' | 'lines' | 'cross' | 'wash';

/** Type label on cover badge (top-left) */
export type MediaType = 'Manga' | 'Cómic' | 'Webtoon' | 'Novela Ligera';

/** Status label on cover badge (top-right) */
export type SeriesStatus = 'En curso' | 'Completo' | 'En pausa';

/** Compact tag displayed on cards, stats & filters. */
export type Genre =
  | 'Shonen'
  | 'Seinen'
  | 'Shoujo'
  | 'Superhéroes'
  | 'Terror'
  | 'Fantasía'
  | 'Ciencia Ficción'
  | 'Histórico'
  | 'Drama'
  | 'Indie'
  | 'Webtoon'
  | 'Novela Ligera'
  | 'Aventura'
  | 'Acción'
  | 'Suspenso'
  | 'Psicológico'
  | 'Artes Marciales'
  | 'Distopía'
  | 'Misterio'
  | 'Obra maestra'
  | 'Sobrenatural'
  | 'F. Oscura'
  | 'Horror';

/** Canonical manga record. */
export interface Manga {
  /** URL-friendly slug (used for /titulo/[slug] routing). */
  slug: string;
  /** Display title in Latin script. */
  title: string;
  /** 2–4 letter acronym shown in cover center. */
  acronym: string;
  /** Optional Japanese title (kana/kanji). */
  titleJp?: string;
  /** Romanization of Japanese title. */
  titleRomaji?: string;
  /** Author / artist name. */
  author: string;
  /** Display type. */
  type: MediaType;
  /** Publication status. */
  status: SeriesStatus;
  /** Curated genres. */
  genres: Genre[];
  /** Solid cover background color (hex without #). */
  coverColor: string;
  /** Pattern overlay applied on top of the cover background. */
  coverPattern: PatternKey;
  /** Numerical volume / issue count. */
  volumeCount: string;
  /** Letter + numeric rating (e.g. 9.6). */
  rating: string;
  /** Trending rank (1-8). Optional. */
  rank?: number;
  /** Used in catalog filter — Manga | Comic | etc. */
  format?: 'manga' | 'comic' | 'webtoon' | 'novel';
}

/** Lightweight statistic tile. */
export interface Stat {
  label: string;
  value: string;
  /** Surface tone: ink (dark), paper (cream), yellow (comic), red (manga). */
  tone: 'ink' | 'paper' | 'yellow' | 'red';
  hint?: string;
}

/** Single chapter row in the detail page. */
export interface Chapter {
  number: string;
  title: string;
  volume?: string;
  publishedAt: string;
  read?: boolean;
  accent?: boolean;
}
