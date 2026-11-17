import { isAxiosError } from 'axios';

export type NormalizedApiError = {
  code: string;
  message: string;
  fieldErrors: Record<string, string>;
  status?: number;
};

export const normalizeApiError = (error: unknown): NormalizedApiError => {
  if (!isAxiosError(error)) {
    return {
      code: 'UNKNOWN_ERROR',
      message: error instanceof Error ? error.message : 'Something went wrong.',
      fieldErrors: {},
    };
  }

  const payload = error.response?.data as {
    error?: { code?: string; message?: string; details?: { field?: string; message?: string }[] };
    errors?: { field?: string; message?: string }[];
  } | undefined;
  const errors = payload?.error?.details ?? payload?.errors ?? [];
  const isTimeout = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
  return {
    code: payload?.error?.code ?? (isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR'),
    message:
      payload?.error?.message ??
      (error.response
        ? 'The request could not be completed.'
        : isTimeout
          ? 'The API request timed out. Please try again.'
          : 'Unable to reach the API. Check the backend URL and your network connection.'),
    fieldErrors: Object.fromEntries(
      errors.filter((item) => item.field).map((item) => [item.field as string, item.message ?? 'Invalid value.'])
    ),
    status: error.response?.status,
  };
};
