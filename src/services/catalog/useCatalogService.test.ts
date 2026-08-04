import {
  AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { MANGAS } from '@/data/catalog/mangas.fixture';
import type { ApiClient } from '@/services/shared/api.client';
import { useCatalogService } from './useCatalogService';

function clientReturning(payload: unknown): ApiClient {
  return {
    async get<T>() {
      return { data: payload as T };
    },
  };
}

describe('useCatalogService', () => {
  it('resolves the token for each request and sends the auth header', async () => {
    let receivedAuthorization: unknown;
    const client: ApiClient = {
      async get<T>(_url: string, config?: AxiosRequestConfig) {
        receivedAuthorization = config?.headers?.Authorization;
        return { data: MANGAS[0] as T };
      },
    };
    const getToken = vi.fn().mockResolvedValue('reader-token');
    const service = useCatalogService({ client, getToken });

    const result = await service.getBySlug('one-piece');

    expect(result.ok).toBe(true);
    expect(getToken).toHaveBeenCalledOnce();
    expect(receivedAuthorization).toBe('Bearer reader-token');
  });

  it('rejects an invalid payload with a validation result', async () => {
    const service = useCatalogService({ client: clientReturning({ unexpected: true }) });

    const result = await service.getBySlug('one-piece');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('validation');
  });

  it('normalizes HTTP errors', async () => {
    const response: AxiosResponse = {
      data: null,
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: { headers: {} } as InternalAxiosRequestConfig,
    };
    const client: ApiClient = {
      async get() {
        throw new AxiosError('Not Found', 'ERR_BAD_REQUEST', undefined, undefined, response);
      },
    };
    const service = useCatalogService({ client });

    const result = await service.getBySlug('missing');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('not_found');
      expect(result.error.status).toBe(404);
    }
  });
});
