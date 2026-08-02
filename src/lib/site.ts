/**
 * Site-wide constants — single source of truth for branding & metadata.
 */
export const SITE = {
  name: 'INK/PXL',
  tagline: 'Páginas que mueven al mundo.',
  taglineSecondary: 'Lee lo nuevo, lo clásico y lo que aún no sabes que necesitas.',
  description:
    'La biblioteca definitiva de mangas japoneses y cómics americanos. Brutalismo refinado para lectores que se toman en serio sus historias.',
  url: 'https://inkpxl.local',
  locale: 'es-419',
  volume: 'Vol. 001 / 2026',
  author: 'INK/PXL',
  twitter: '@inkpxl',
} as const;

export type Site = typeof SITE;

/** Top-level navigation labels + targets. */
export const NAV = [
  { label: 'Biblioteca', href: '/catalogo', index: '/01' },
  { label: 'Géneros', href: '/catalogo#generos', index: '/02' },
  { label: 'Lanzamientos', href: '/catalogo', index: '/03' },
  { label: 'Comunidad', href: '/catalogo', index: '/04' },
] as const;

/** Marquee ticker messages — duplicated at runtime for seamless loop. */
export const MARQUEE_ITEMS = [
  '◆ Nuevo · Berserk Vol. 41',
  '◆ +12.4K títulos',
  '◆ 48 idiomas',
  '◆ Batman #150 ya en línea',
  '◆ One Piece Cap. 1124',
  '◆ Spy x Family Tomo 14',
  '◆ Marvel NOW! Infinite',
] as const;
