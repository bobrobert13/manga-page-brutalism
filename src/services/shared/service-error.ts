export type ServiceErrorCode =
  | 'validation'
  | 'not_found'
  | 'unauthorized'
  | 'forbidden'
  | 'cancelled'
  | 'network'
  | 'timeout'
  | 'unavailable'
  | 'unknown';

export interface ServiceError {
  code: ServiceErrorCode;
  message: string;
  status?: number;
  retryable: boolean;
}

export function createServiceError(
  code: ServiceErrorCode,
  message: string,
  options: { status?: number; retryable?: boolean } = {}
): ServiceError {
  return {
    code,
    message,
    status: options.status,
    retryable: options.retryable ?? false,
  };
}
