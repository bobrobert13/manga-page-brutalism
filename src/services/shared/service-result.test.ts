import { describe, expect, it } from 'vitest';
import { createServiceError } from './service-error';
import { failure, success } from './service-result';

describe('service result helpers', () => {
  it('wraps successful data in the discriminated result shape', () => {
    const result = success({ id: 'berserk' });

    expect(result).toEqual({ ok: true, data: { id: 'berserk' } });
  });

  it('preserves a typed service error in a failed result', () => {
    const error = createServiceError('not_found', 'No encontrado.', { status: 404 });
    const result = failure(error);

    expect(result).toEqual({ ok: false, error });
  });
});
