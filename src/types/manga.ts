/**
 * Domain types — shared by Astro components, Vue islands & data layer.
 * Migrate to Content Collections once the catalog exceeds ~50 titles.
 */

import type { MediaType, SeriesStatus } from '@/config/index.config';

/** Canonical genre keys — derived from the fixture catalog. */
export type Genre =
  | 'Acción'
  | 'Artes Marciales'
  | 'Aventura'
  | 'Ciencia Ficción'
  | 'Distopía'
  | 'Drama'
  | 'F. Oscura'
  | 'Fantasía'
  | 'Histórico'
  | 'Indie'
  | 'Misterio'
  | 'Novela Ligera'
  | 'Obra maestra'
  | 'Psicológico'
  | 'Seinen'
  | 'Shonen'
  | 'Shoujo'
  | 'Sobrenatural'
  | 'Superhéroes'
  | 'Suspenso'
  | 'Terror'
  | 'Webtoon';

/** Cover overlay pattern key. */
export type PatternKey = 'dots' | 'dots-dark' | 'lines' | 'cross' | 'wash';

/** Format key — matches MediaType values in lowercase kebab. */
export type FormatKey = 'manga' | 'comic' | 'webtoon' | 'light-novel';

/** Maps format keys to their display labels. */
export const FORMAT_LABEL: Record<FormatKey, MediaType> = {
  manga: 'Manga' as MediaType,
  comic: 'Cómic' as MediaType,
  webtoon: 'Webtoon' as MediaType,
  'light-novel': 'Novela Ligera' as MediaType,
};

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
  /** Display type label (e.g. "Manga", "Cómic"). Derived from format. */
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
  /** ISO date used by the recent sorting strategy. */
  updatedAt?: string;
  /** Format key used for catalog filtering. */
  format: FormatKey;
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
