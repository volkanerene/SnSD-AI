import { supabase } from './supabase/client';
import type { ApiError } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

    console.log('🔑 [API CLIENT] Tenant ID received:', tenantId);

    if (tenantId) {
      headers['X-Tenant-ID'] = tenantId;
      console.log('✅ [API CLIENT] X-Tenant-ID header set:', tenantId);
    } else {
      console.warn('⚠️ [API CLIENT] No tenant ID provided!');
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

    // Merge any additional headers from options
    if (fetchOptions.headers) {
      Object.assign(headers, fetchOptions.headers);
    }

    console.log('🌐 [API CLIENT] Request:', {
      url: `${API_BASE_URL}${endpoint}`,
      method: fetchOptions.method || 'GET',
      headers: headers
    });

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers
    });

    console.log('📥 [API CLIENT] Response:', {
      status: response.status,
      ok: response.ok,
      url: response.url
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        detail: `HTTP ${response.status}: ${response.statusText}`
      }));
      console.error('❌ [API CLIENT] Error:', error);
      throw new Error(error.detail);
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
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // PUT request
  async put<T>(endpoint: string, data: any, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
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
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }
}

export const apiClient = new ApiClient();
