function encodePathSegment(value: string | number): string {
  return encodeURIComponent(String(value));
}

export const ROUTES = {
  home: '/',
  catalog: '/catalogo',
  account: '/cuenta',
  accountSettings: '/cuenta/ajustes',
  login: '/login',
  register: '/registro',
  resetPassword: '/recuperar-clave',
  readingList: '/readlist',
  notFound: '/404',
  title: (slug: string) => `/titulo/${encodePathSegment(slug)}`,
  chapter: (slug: string, chapter: string | number) =>
    `/titulo/${encodePathSegment(slug)}/${encodePathSegment(chapter)}`,
  ogImage: (slug: string) => `/og/${encodePathSegment(slug)}.svg`,
  withRedirect: (route: string, redirectTo: string) =>
    `${route}?redirect_url=${encodeURIComponent(redirectTo)}`,
} as const;

export const NAV = [
  { label: 'Biblioteca', href: ROUTES.catalog, index: '/01' },
  { label: 'Géneros', href: `${ROUTES.catalog}#generos`, index: '/02' },
  { label: 'Lanzamientos', href: ROUTES.catalog, index: '/03' },
  { label: 'Comunidad', href: ROUTES.catalog, index: '/04' },
] as const;
