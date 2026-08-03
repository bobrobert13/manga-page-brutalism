import { clerkMiddleware } from '@clerk/astro/server';
import { AUTH_CONFIG, ROUTES } from '@/config/index.config';

function matchesRoute(pathname: string, routes: readonly string[]): boolean {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export const onRequest = clerkMiddleware((auth, context, next) => {
  if (matchesRoute(context.url.pathname, AUTH_CONFIG.protectedRoutes) && !auth().userId) {
    return context.redirect(ROUTES.withRedirect(AUTH_CONFIG.routes.signIn, context.url.pathname));
  }

  return next();
});
