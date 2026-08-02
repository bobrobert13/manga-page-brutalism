import type { APIRoute } from 'astro';
import { MANGAS } from '@data/mangas';
import type { PatternKey } from '@/types/manga';

export const prerender = false;

function luma(hex: string): number {
  const h = (hex || '#0A0A0A').replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function escapeXml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function patternSvg(pattern: PatternKey, color: string): string {
  const id = 'p-' + pattern;
  const fg = luma(color) < 0.5 ? '#F2EDE4' : '#0A0A0A';
  switch (pattern) {
    case 'dots':
      return `<pattern id="${id}" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="3" fill="${fg}" fill-opacity="0.18"/></pattern>`;
    case 'dots-dark':
      return `<pattern id="${id}" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="3" fill="${fg}" fill-opacity="0.28"/></pattern>`;
    case 'lines':
      return `<pattern id="${id}" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="48" fill="${fg}" fill-opacity="0.22"/></pattern>`;
    case 'cross':
      return `<pattern id="${id}" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse"><rect width="48" height="2" fill="${fg}" fill-opacity="0.18"/><rect width="2" height="48" fill="${fg}" fill-opacity="0.18"/></pattern>`;
    case 'wash':
      return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${fg}" stop-opacity="0.22"/><stop offset="1" stop-color="${fg}" stop-opacity="0"/></linearGradient></defs>`;
  }
}

export const GET: APIRoute = ({ params, url }) => {
  const slug = params.slug;
  const manga = MANGAS.find((m) => m.slug === slug);
  if (!manga) {
    return new Response('Not found', { status: 404 });
  }

  const chapterNum = url.searchParams.get('chapter');
  const dark = luma(manga.coverColor) < 0.5;
  const fg = dark ? '#F2EDE4' : '#0A0A0A';
  const accent = dark ? '#FFB703' : '#E63946';
  const patternId = 'p-' + manga.coverPattern;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  ${patternSvg(manga.coverPattern, manga.coverColor)}
  <rect width="1200" height="630" fill="${manga.coverColor}"/>
  ${manga.coverPattern === 'wash'
    ? `<rect width="1200" height="630" fill="url(#${patternId})"/>`
    : `<rect width="1200" height="630" fill="url(#${patternId})"/>`}

  <!-- Frame -->
  <rect x="40" y="40" width="1120" height="550" fill="none" stroke="${fg}" stroke-width="3" stroke-dasharray="12 8" stroke-opacity="0.5"/>

  <!-- Acronym watermark -->
  <text x="900" y="380" text-anchor="middle" font-family="Archivo Black, Impact, sans-serif" font-size="320" fill="${fg}" fill-opacity="0.18" letter-spacing="-20">${escapeXml(manga.acronym)}</text>

  <!-- INK/PXL stamp -->
  <rect x="80" y="80" width="180" height="48" fill="${fg}"/>
  <text x="170" y="113" text-anchor="middle" font-family="Archivo Black, Impact, sans-serif" font-size="22" fill="${manga.coverColor}" letter-spacing="2">INK/PXL</text>

  <!-- Title -->
  <text x="80" y="320" font-family="Archivo Black, Impact, sans-serif" font-size="92" fill="${fg}" letter-spacing="-3">${escapeXml(manga.title)}</text>

  ${manga.titleJp ? `<text x="80" y="380" font-family="Noto Sans JP, sans-serif" font-size="40" font-weight="900" fill="${fg}" fill-opacity="0.65">${escapeXml(manga.titleJp)}</text>` : ''}

  <!-- Accent bar -->
  <rect x="80" y="420" width="180" height="8" fill="${accent}"/>

  <!-- Chapter indicator (if provided) -->
  ${chapterNum
    ? `<text x="80" y="500" font-family="Space Mono, monospace" font-size="32" fill="${fg}" letter-spacing="2">CAP. ${escapeXml(chapterNum)}</text>`
    : `<text x="80" y="500" font-family="Space Mono, monospace" font-size="32" fill="${fg}" fill-opacity="0.65" letter-spacing="2">LEE AHORA · INK/PXL</text>`}

  <!-- Footer info -->
  <text x="80" y="560" font-family="Space Mono, monospace" font-size="20" fill="${fg}" fill-opacity="0.6" letter-spacing="3">${escapeXml(manga.author.toUpperCase())} · ${escapeXml(manga.type.toUpperCase())} · ${escapeXml(manga.volumeCount.toUpperCase())}</text>
  <text x="1120" y="560" text-anchor="end" font-family="Space Mono, monospace" font-size="20" fill="${fg}" fill-opacity="0.6" letter-spacing="3">★ ${manga.rating}</text>
</svg>`;

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};