import { clerkMiddleware } from '@clerk/astro/server';
import { defineMiddleware } from 'astro:middleware';

const clerk = clerkMiddleware();

const AUTH_ROUTES = ['/login', '/registro', '/recuperar-clave', '/cuenta'];

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;
  if (AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`))) {
    return clerk(context, next);
  }
  return next();
});
