import type { ServiceError } from './service-error';

export type ServiceResult<T, E extends ServiceError = ServiceError> =
  { ok: true; data: T } | { ok: false; error: E };

export function success<T>(data: T): ServiceResult<T> {
  return { ok: true, data };
}

export function failure<E extends ServiceError>(error: E): ServiceResult<never, E> {
  return { ok: false, error };
}
