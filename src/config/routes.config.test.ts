import { describe, expect, it } from 'vitest';
import { NAV, ROUTES } from './routes.config';

describe('route builders', () => {
  it('keeps stable application routes', () => {
    expect(ROUTES.home).toBe('/');
    expect(ROUTES.catalog).toBe('/catalogo');
    expect(ROUTES.account).toBe('/cuenta');
    expect(ROUTES.login).toBe('/login');
  });

  it('encodes every dynamic path segment independently', () => {
    expect(ROUTES.title('one piece/es')).toBe('/titulo/one%20piece%2Fes');
    expect(ROUTES.chapter('one piece', '1/2')).toBe('/titulo/one%20piece/1%2F2');
    expect(ROUTES.ogImage('one piece/es')).toBe('/og/one%20piece%2Fes.svg');
  });

  it('encodes a redirect target without changing its destination route', () => {
    expect(ROUTES.withRedirect(ROUTES.login, '/cuenta?tab=perfil')).toBe(
      '/login?redirect_url=%2Fcuenta%3Ftab%3Dperfil'
    );
  });

  it('builds navigation entries from the public route facade', () => {
    expect(NAV.map((entry) => entry.href)).toEqual([
      ROUTES.catalog,
      `${ROUTES.catalog}#generos`,
      ROUTES.catalog,
      ROUTES.catalog,
    ]);
  });
});
