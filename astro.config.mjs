// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';
import clerk from '@clerk/astro';

// https://astro.build/config
const SITE = {
  url: 'https://inkpxl.local',
  name: 'INK/PXL',
  description:
    'La biblioteca definitiva de mangas japoneses y cómics americanos. Brutalismo refinado para lectores que se toman en serio sus historias.',
  locale: 'es-419',
};

export default defineConfig({
  site: SITE.url,
  integrations: [
    vue(),
    // Configure Clerk's instance-wide routing once so per-component props can
    // stay focused on appearance & inline overrides. We keep /login, /registro,
    // /cuenta as our public surfaces.
    clerk({
      signInUrl: '/login',
      signUpUrl: '/registro',
      signInFallbackRedirectUrl: '/cuenta',
      signUpFallbackRedirectUrl: '/cuenta',
      afterSignOutUrl: '/',
    }),
  ],
  output: 'static',
  i18n: {
    defaultLocale: SITE.locale,
    locales: [SITE.locale],
    routing: { prefixDefaultLocale: false },
  },
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: node({ mode: 'standalone' }),
  server: { host: true, port: 4321 },
  devToolbar: { enabled: true },
});
