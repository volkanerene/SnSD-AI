import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Tenant, TenantCreate, TenantUpdate, UUID } from '@/types/api';

interface UseTenantsOptions {
  tenantId?: string;
  limit?: number;
  offset?: number;
}

export function useTenants(options: UseTenantsOptions = {}) {
  const queryClient = useQueryClient();
  const { limit = 50, offset = 0 } = options;

  // Build query string
  const queryParams = new URLSearchParams();
  if (limit) queryParams.append('limit', limit.toString());
  if (offset) queryParams.append('offset', offset.toString());
  const queryString = queryParams.toString();

  const {
    data: tenants,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['tenants', limit, offset],
    queryFn: () => {
      const endpoint = `/tenants/${queryString ? `?${queryString}` : ''}`;
      // Don't pass tenantId for listing all tenants (admin only endpoint)
      return apiClient.get<Tenant[]>(endpoint, { skipAuth: false });
    },
    staleTime: 2 * 60 * 1000 // 2 minutes
  });

  const createTenant = useMutation({
    mutationFn: (data: TenantCreate) =>
      apiClient.post<Tenant>('/tenants', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    }
  });

  const updateTenant = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TenantUpdate }) =>
      apiClient.patch<Tenant>(`/tenants/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    }
  });

  const activateTenant = useMutation({
    mutationFn: (id: UUID) =>
      apiClient.post<Tenant>(`/tenants/${id}/activate`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    }
  });

  const suspendTenant = useMutation({
    mutationFn: (id: UUID) =>
      apiClient.post<Tenant>(`/tenants/${id}/suspend`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    }
  });

  const deleteTenant = useMutation({
    mutationFn: (id: UUID) => apiClient.delete(`/tenants/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    }
  });

  return {
    tenants: tenants || [],
    isLoading,
    error,
    refetch,
    createTenant: createTenant.mutate,
    createTenantAsync: createTenant.mutateAsync,
    isCreating: createTenant.isPending,
    updateTenant: updateTenant.mutate,
    updateTenantAsync: updateTenant.mutateAsync,
    isUpdating: updateTenant.isPending,
    activateTenant: activateTenant.mutate,
    activateTenantAsync: activateTenant.mutateAsync,
    isActivating: activateTenant.isPending,
    suspendTenant: suspendTenant.mutate,
    suspendTenantAsync: suspendTenant.mutateAsync,
    isSuspending: suspendTenant.isPending,
    deleteTenant: deleteTenant.mutate,
    deleteTenantAsync: deleteTenant.mutateAsync,
    isDeleting: deleteTenant.isPending
  };
}

export function useTenant(tenantId: string) {
  const {
    data: tenant,
    isLoading,
    error
  } = useQuery({
    queryKey: ['tenants', tenantId],
    queryFn: () => apiClient.get<Tenant>(`/tenants/${tenantId}`, { tenantId }),
    enabled: !!tenantId
  });

  return { tenant, isLoading, error };
}
