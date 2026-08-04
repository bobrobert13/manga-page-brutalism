/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_API_BASE_URL?: string;
  readonly PUBLIC_API_TIMEOUT_MS?: string;
  readonly PUBLIC_CATALOG_SOURCE?: 'fixture' | 'api';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
