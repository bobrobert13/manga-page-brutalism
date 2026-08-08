import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { MANGAS } from '@/data/catalog/mangas.fixture';
import type { ApiClient } from '@/services/shared/api.client';
import { catalogServiceContract } from '../../../tests/contracts/catalogService.contract';
import { CATALOG_API_URL, catalogHandlers } from '../../../tests/mocks/catalog.handlers';
import { mockServer } from '../../../tests/mocks/server';
import { useCatalogService } from './useCatalogService';

catalogServiceContract('HTTP', () => {
  mockServer.use(...catalogHandlers);
  return useCatalogService({
    client: axios.create({ baseURL: CATALOG_API_URL }),
  });
});

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

  it.each([
    ['getAll', [{ ...MANGAS[0], slug: 1 }]],
    ['getGenres', ['Seinen', 1]],
    ['getChapters', [{ number: 1, title: 'Invalid', publishedAt: 'today' }]],
  ] as const)('validates every item returned by %s', async (operation, payload) => {
    const service = useCatalogService({ client: clientReturning(payload) });

    const result =
      operation === 'getChapters'
        ? await service.getChapters('berserk')
        : await service[operation]();

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('validation');
  });

  it('validates the chapter page-count envelope', async () => {
    const service = useCatalogService({ client: clientReturning({ pageCount: '18' }) });

    const result = await service.getChapterPageCount('berserk', 374);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('validation');
  });

  it('forwards the caller abort signal to the HTTP client', async () => {
    const controller = new AbortController();
    let receivedSignal: AxiosRequestConfig['signal'];
    const client: ApiClient = {
      async get<T>(_url: string, config?: AxiosRequestConfig) {
        receivedSignal = config?.signal;
        return { data: MANGAS[0] as T };
      },
    };

    await useCatalogService({ client }).getBySlug('berserk', { signal: controller.signal });

    expect(receivedSignal).toBe(controller.signal);
  });

  it('resolves fresh authorization for concurrent operations', async () => {
    const receivedHeaders: unknown[] = [];
    const client: ApiClient = {
      async get<T>(_url: string, config?: AxiosRequestConfig) {
        receivedHeaders.push(config?.headers?.Authorization);
        return { data: MANGAS[0] as T };
      },
    };
    const getToken = vi.fn().mockResolvedValueOnce('token-a').mockResolvedValueOnce('token-b');
    const service = useCatalogService({ client, getToken });

    await Promise.all([service.getBySlug('berserk'), service.getBySlug('one-piece')]);

    expect(receivedHeaders).toEqual(['Bearer token-a', 'Bearer token-b']);
    expect(getToken).toHaveBeenCalledTimes(2);
  });

  it('omits authorization when no token provider is configured', async () => {
    let receivedAuthorization: unknown = 'not-called';
    const client: ApiClient = {
      async get<T>(_url: string, config?: AxiosRequestConfig) {
        receivedAuthorization = config?.headers?.Authorization;
        return { data: MANGAS[0] as T };
      },
    };

    const result = await useCatalogService({ client }).getBySlug('berserk');

    expect(result.ok).toBe(true);
    expect(receivedAuthorization).toBeUndefined();
  });

  it('propagates source failures from every derived catalog view', async () => {
    const client: ApiClient = {
      async get() {
        throw new AxiosError('Network unavailable');
      },
    };
    const service = useCatalogService({ client });

    const [featured, trending, related] = await Promise.all([
      service.getFeatured(),
      service.getTrending(),
      service.getRelated(MANGAS[0]),
    ]);

    expect([featured, trending, related].every((result) => !result.ok)).toBe(true);
    for (const result of [featured, trending, related]) {
      if (!result.ok) expect(result.error.code).toBe('network');
    }
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
