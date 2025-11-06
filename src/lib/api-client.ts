import { supabase } from './supabase/client';
import type { ApiError } from '@/types/api';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.snsdconsultant.com';

// Debug: Log API URL on initialization
if (typeof window !== 'undefined') {
  console.log('🔧 [API CLIENT] Using API_BASE_URL:', API_BASE_URL);
  console.log(
    '🔧 [API CLIENT] NEXT_PUBLIC_API_URL:',
    process.env.NEXT_PUBLIC_API_URL
  );
}

export interface ApiOptions extends RequestInit {
  tenantId?: string;
  skipAuth?: boolean;
}

export class ApiClient {
  private async getAuthHeaders(
    tenantId?: string
  ): Promise<Record<string, string>> {
    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('No active session');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`
    };

    if (tenantId) {
      headers['X-Tenant-ID'] = tenantId;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<T> {
    const { tenantId, skipAuth, ...fetchOptions } = options;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (!skipAuth) {
      const authHeaders = await this.getAuthHeaders(tenantId);
      Object.assign(headers, authHeaders);
    }

    // If body is FormData, remove Content-Type header to let browser set it with boundary
    if (fetchOptions.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    // Merge any additional headers from options
    if (fetchOptions.headers) {
      Object.assign(headers, fetchOptions.headers);
    }

    const fullUrl = `${API_BASE_URL}${endpoint}`;

    // Debug: Log the actual fetch URL
    if (typeof window !== 'undefined') {
      console.log('🌐 [API CLIENT] Fetching:', fullUrl);
    }

    const response = await fetch(fullUrl, {
      ...fetchOptions,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        detail: `HTTP ${response.status}: ${response.statusText}`
      }));

      // Handle different error formats
      let errorMessage: string;

      if (typeof errorData.detail === 'string') {
        errorMessage = errorData.detail;
      } else if (Array.isArray(errorData.detail)) {
        // Handle array of validation errors
        errorMessage = errorData.detail
          .map((err: any) => {
            if (typeof err === 'string') return err;
            if (err.msg) return err.msg;
            if (err.message) return err.message;
            return JSON.stringify(err);
          })
          .join('; ');
      } else if (typeof errorData.detail === 'object') {
        errorMessage = JSON.stringify(errorData.detail);
      } else {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }

      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).response = errorData;
      throw error;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // GET request
  async get<T>(endpoint: string, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data: any, options?: ApiOptions): Promise<T> {
    // If data is FormData, pass it directly without JSON.stringify
    const body = data instanceof FormData ? data : JSON.stringify(data);

    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body
    });
  }

  // PUT request
  async put<T>(endpoint: string, data: any, options?: ApiOptions): Promise<T> {
    // If data is FormData, pass it directly without JSON.stringify
    const body = data instanceof FormData ? data : JSON.stringify(data);

    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body
    });
  }

  // DELETE request
  async delete<T>(endpoint: string, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // PATCH request
  async patch<T>(
    endpoint: string,
    data: any,
    options?: ApiOptions
  ): Promise<T> {
    // If data is FormData, pass it directly without JSON.stringify
    const body = data instanceof FormData ? data : JSON.stringify(data);

    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body
    });
  }
}

export const apiClient = new ApiClient();
