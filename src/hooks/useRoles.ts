import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Role, PaginationParams } from '@/types/api';

export function useRoles(filters?: PaginationParams) {
  const queryString = new URLSearchParams();
  if (filters?.limit) queryString.append('limit', filters.limit.toString());
  if (filters?.offset) queryString.append('offset', filters.offset.toString());

  const endpoint = `/roles${queryString.toString() ? `?${queryString}` : ''}`;

  const {
    data: roles,
    isLoading,
    error
  } = useQuery({
    queryKey: ['roles', filters],
    queryFn: () => apiClient.get<Role[]>(endpoint)
  });

  return {
    roles: roles || [],
    isLoading,
    error
  };
}

export function useRole(roleId: number) {
  const {
    data: role,
    isLoading,
    error
  } = useQuery({
    queryKey: ['roles', roleId],
    queryFn: () => apiClient.get<Role>(`/roles/${roleId}`),
    enabled: roleId !== undefined
  });

  return { role, isLoading, error };
}
