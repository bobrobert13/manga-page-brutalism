import axios from 'axios';
import { createServiceError, type ServiceError } from './service-error';

export function toServiceError(error: unknown): ServiceError {
  if (!axios.isAxiosError(error)) {
    return createServiceError('unknown', 'Ocurrió un error inesperado.');
  }

  if (error.code === 'ERR_CANCELED') {
    return createServiceError('cancelled', 'La solicitud fue cancelada.');
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return createServiceError('timeout', 'El servicio tardó demasiado en responder.', {
      retryable: true,
    });
  }

  const status = error.response?.status;
  if (status === 401) {
    return createServiceError('unauthorized', 'Necesitas iniciar sesión para continuar.', {
      status,
    });
  }
  if (status === 403) {
    return createServiceError('forbidden', 'No tienes permiso para realizar esta acción.', {
      status,
    });
  }
  if (status === 404) {
    return createServiceError('not_found', 'No encontramos el recurso solicitado.', { status });
  }
  if (status !== undefined && status >= 500) {
    return createServiceError('unavailable', 'El servicio no está disponible temporalmente.', {
      status,
      retryable: true,
    });
  }
  if (!error.response) {
    return createServiceError('network', 'No pudimos conectar con el servicio.', {
      retryable: true,
    });
  }

  return createServiceError('unknown', 'No pudimos completar la solicitud.', { status });
}
