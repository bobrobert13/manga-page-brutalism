/**
 * SVG placeholder generator — ports pageSvg() from the prototype.
 * All SVG strings are generated client-side (no SSR).
 */
import type { PatternKey } from '@/types/manga';

function slugify(input: string): string {
  return String(input || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function escapeXml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function luma(hex: string): number {
  const h = (hex || '#0A0A0A').replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

interface PageSvgInput {
  coverColor: string;
  coverPattern: PatternKey;
  acronym: string;
  index: number;
  total: number;
  chapterTitle: string;
}

export function pageSvg(input: PageSvgInput): string {
  const { coverColor, coverPattern, acronym, index, total, chapterTitle } = input;
  const dark = luma(coverColor) < 0.5;
  const fg = dark ? '#F2EDE4' : '#0A0A0A';
  const accent = dark ? '#FFB703' : '#E63946';
  const patternId = 'p-' + slugify(coverPattern);

  let pat = '';
  switch (coverPattern) {
    case 'dots':
      pat =
        "<pattern id='" +
        patternId +
        "' x='0' y='0' width='10' height='10' patternUnits='userSpaceOnUse'>" +
        "<circle cx='2' cy='2' r='1.6' fill='" +
        fg +
        "' fill-opacity='0.18' /></pattern>";
      break;
    case 'dots-dark':
      pat =
        "<pattern id='" +
        patternId +
        "' x='0' y='0' width='10' height='10' patternUnits='userSpaceOnUse'>" +
        "<circle cx='2' cy='2' r='1.6' fill='" +
        fg +
        "' fill-opacity='0.28' /></pattern>";
      break;
    case 'lines':
      pat =
        "<pattern id='" +
        patternId +
        "' x='0' y='0' width='12' height='12' patternUnits='userSpaceOnUse' patternTransform='rotate(45)'>" +
        "<rect width='2' height='12' fill='" +
        fg +
        "' fill-opacity='0.22' /></pattern>";
      break;
    case 'cross':
      pat =
        "<pattern id='" +
        patternId +
        "' x='0' y='0' width='16' height='16' patternUnits='userSpaceOnUse'>" +
        "<rect width='16' height='1' fill='" +
        fg +
        "' fill-opacity='0.18' />" +
        "<rect width='1' height='16' fill='" +
        fg +
        "' fill-opacity='0.18' /></pattern>";
      break;
    case 'wash':
      pat = '';
      break;
  }

  return [
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 400' preserveAspectRatio='xMidYMid slice' role='img' aria-hidden='true'>",
    '<defs>' + pat + '</defs>',
    "<rect width='300' height='400' fill='" + coverColor + "' />",
    pat ? "<rect width='300' height='400' fill='url(#" + patternId + ")' />" : '',
    "<rect x='14' y='14' width='272' height='372' fill='none' stroke='" +
      fg +
      "' stroke-width='2' stroke-dasharray='6 6' stroke-opacity='0.4' />",
    "<text x='150' y='190' text-anchor='middle' font-family='Archivo Black,Impact,sans-serif' font-size='64' fill='" +
      fg +
      "' letter-spacing='-3'>" +
      acronym +
      '</text>',
    "<rect x='120' y='210' width='60' height='8' fill='" + accent + "' />",
    "<text x='150' y='240' text-anchor='middle' font-family='Space Mono,monospace' font-size='11' fill='" +
      fg +
      "' fill-opacity='0.65' letter-spacing='2'>PÁG. " +
      index +
      '/' +
      total +
      '</text>',
    "<text x='150' y='370' text-anchor='middle' font-family='Space Mono,monospace' font-size='9' fill='" +
      fg +
      "' fill-opacity='0.5' letter-spacing='2'>" +
      escapeXml(chapterTitle) +
      '</text>',
    '</svg>',
  ].join('');
}

export function generatePages(
  total: number,
  coverColor: string,
  coverPattern: PatternKey,
  acronym: string,
  chapterTitle: string,
) {
  return Array.from({ length: total }, (_, i) => ({
    number: i + 1,
    svgContent: pageSvg({
      coverColor,
      coverPattern,
      acronym,
      index: i + 1,
      total,
      chapterTitle,
    }),
  }));
}
