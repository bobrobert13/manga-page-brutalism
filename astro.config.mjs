// @ts-check
import { defineConfig, envField } from 'astro/config';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';
import clerk from '@clerk/astro';
import { AUTH_CONFIG } from './src/config/auth.config.ts';
import { HTTP_CONFIG } from './src/config/http.config.ts';
import { SITE } from './src/config/site.config.ts';

export default defineConfig({
  site: SITE.url,
  integrations: [
    vue(),
    clerk({
      signInUrl: AUTH_CONFIG.routes.signIn,
      signUpUrl: AUTH_CONFIG.routes.signUp,
      signInFallbackRedirectUrl: AUTH_CONFIG.fallbackRedirect,
      signUpFallbackRedirectUrl: AUTH_CONFIG.fallbackRedirect,
      afterSignOutUrl: AUTH_CONFIG.afterSignOut,
    }),
  ],
  output: 'server',
  i18n: {
    defaultLocale: SITE.locale,
    locales: [SITE.locale],
    routing: { prefixDefaultLocale: false },
  },
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
  env: {
    schema: {
      PUBLIC_API_BASE_URL: envField.string({
        context: 'client',
        access: 'public',
        default: HTTP_CONFIG.defaultBaseUrl,
      }),
      PUBLIC_API_TIMEOUT_MS: envField.number({
        context: 'client',
        access: 'public',
        default: HTTP_CONFIG.defaultTimeoutMs,
      }),
      PUBLIC_CATALOG_SOURCE: envField.enum({
        context: 'client',
        access: 'public',
        values: [HTTP_CONFIG.catalogSource.fixture, HTTP_CONFIG.catalogSource.api],
        default: HTTP_CONFIG.catalogSource.fixture,
      }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: node({ mode: 'standalone' }),
  server: { host: true, port: 4321 },
  devToolbar: { enabled: true },
});
