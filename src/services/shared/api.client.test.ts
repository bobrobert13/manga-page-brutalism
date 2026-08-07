import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HTTP_CONFIG } from '@/config/index.config';
import { mockServer } from '../../../tests/mocks/server';
import { buildAuthHeaders, createApiClient } from './api.client';

describe('API client', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('uses the public defaults and standard JSON headers', () => {
    vi.stubEnv('PUBLIC_API_BASE_URL', '');
    vi.stubEnv('PUBLIC_API_TIMEOUT_MS', '');

    const client = createApiClient();

    expect(client.defaults.baseURL).toBe(HTTP_CONFIG.defaultBaseUrl);
    expect(client.defaults.timeout).toBe(HTTP_CONFIG.defaultTimeoutMs);
    expect(client.defaults.headers.Accept).toBe('application/json');
    expect(client.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('uses valid environment overrides', () => {
    vi.stubEnv('PUBLIC_API_BASE_URL', 'https://catalog.test');
    vi.stubEnv('PUBLIC_API_TIMEOUT_MS', '2500');

    const client = createApiClient();

    expect(client.defaults.baseURL).toBe('https://catalog.test');
    expect(client.defaults.timeout).toBe(2500);
  });

  it.each(['invalid', '0', '-1'])('rejects invalid timeout override %s', (timeout) => {
    vi.stubEnv('PUBLIC_API_TIMEOUT_MS', timeout);

    expect(createApiClient().defaults.timeout).toBe(HTTP_CONFIG.defaultTimeoutMs);
  });

  it('performs a real Axios request through the MSW boundary', async () => {
    vi.stubEnv('PUBLIC_API_BASE_URL', 'https://catalog.test');
    mockServer.use(
      http.get('https://catalog.test/mangas', ({ request }) => {
        expect(request.headers.get('accept')).toBe('application/json');
        return HttpResponse.json([{ slug: 'berserk' }]);
      })
    );

    const response = await createApiClient().get<{ slug: string }[]>('/mangas');

    expect(response.data).toEqual([{ slug: 'berserk' }]);
  });
});

describe('buildAuthHeaders', () => {
  it('returns an authorization header only for a present token', () => {
    expect(buildAuthHeaders('reader-token')).toEqual({ Authorization: 'Bearer reader-token' });
    expect(buildAuthHeaders(null)).toEqual({});
    expect(buildAuthHeaders(undefined)).toEqual({});
  });
});
