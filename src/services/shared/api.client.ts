import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { HTTP_CONFIG } from '@/config/index.config';

function readPositiveNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function createApiClient(): AxiosInstance {
  return axios.create({
    baseURL: import.meta.env.PUBLIC_API_BASE_URL || HTTP_CONFIG.defaultBaseUrl,
    timeout: readPositiveNumber(
      import.meta.env.PUBLIC_API_TIMEOUT_MS,
      HTTP_CONFIG.defaultTimeoutMs
    ),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
}

export interface ApiClient {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<{ data: T }>;
}

export const api = createApiClient();

export function buildAuthHeaders(token?: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
