import { describe, expect, it } from 'vitest';
import { createServiceError } from './service-error';

describe('createServiceError', () => {
  it('uses safe defaults for optional transport metadata', () => {
    expect(createServiceError('validation', 'Datos inválidos.')).toEqual({
      code: 'validation',
      message: 'Datos inválidos.',
      status: undefined,
      retryable: false,
    });
  });

  it('keeps explicit status and retryability', () => {
    expect(
      createServiceError('unavailable', 'Temporalmente fuera de servicio.', {
        status: 503,
        retryable: true,
      })
    ).toEqual({
      code: 'unavailable',
      message: 'Temporalmente fuera de servicio.',
      status: 503,
      retryable: true,
    });
  });
});
