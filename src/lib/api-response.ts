export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export function success<T>(data: T): ApiResponse<T> {
  return { success: true, data, error: null };
}

export function failure(error: string): ApiResponse<null> {
  return { success: false, data: null, error };
}
