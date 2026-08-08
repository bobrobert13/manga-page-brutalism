import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it } from 'vitest';
import { toServiceError } from './service-error.mapper';

function axiosError(options: { code?: string; status?: number } = {}): AxiosError {
  const response: AxiosResponse | undefined =
    options.status === undefined
      ? undefined
      : {
          data: null,
          status: options.status,
          statusText: 'Error',
          headers: {},
          config: { headers: {} } as InternalAxiosRequestConfig,
        };

  return new AxiosError('Request failed', options.code, undefined, undefined, response);
}

describe('toServiceError', () => {
  it('maps non-Axios failures to an unknown safe error', () => {
    expect(toServiceError(new Error('secret detail'))).toEqual({
      code: 'unknown',
      message: 'Ocurrió un error inesperado.',
      status: undefined,
      retryable: false,
    });
  });

  it('maps cancellation without marking it as retryable', () => {
    expect(toServiceError(axiosError({ code: 'ERR_CANCELED' })).code).toBe('cancelled');
    expect(toServiceError(axiosError({ code: 'ERR_CANCELED' })).retryable).toBe(false);
  });

  it.each(['ECONNABORTED', 'ETIMEDOUT'])('maps %s to a retryable timeout', (code) => {
    expect(toServiceError(axiosError({ code }))).toMatchObject({
      code: 'timeout',
      retryable: true,
    });
  });

  it.each([
    [401, 'unauthorized'],
    [403, 'forbidden'],
    [404, 'not_found'],
  ] as const)('maps HTTP %i to %s', (status, code) => {
    expect(toServiceError(axiosError({ status }))).toMatchObject({
      code,
      status,
      retryable: false,
    });
  });

  it('maps server failures to a retryable unavailable error', () => {
    expect(toServiceError(axiosError({ status: 503 }))).toMatchObject({
      code: 'unavailable',
      status: 503,
      retryable: true,
    });
  });

  it('maps a missing response to a retryable network error', () => {
    expect(toServiceError(axiosError())).toMatchObject({
      code: 'network',
      retryable: true,
    });
  });

  it('preserves an unclassified HTTP status as unknown', () => {
    expect(toServiceError(axiosError({ status: 422 }))).toMatchObject({
      code: 'unknown',
      status: 422,
      retryable: false,
    });
  });
});
