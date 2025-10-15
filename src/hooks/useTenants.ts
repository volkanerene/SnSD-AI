import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Tenant, TenantCreate, TenantUpdate } from '@/types/api';

export function useTenants(tenantId: string) {
  const queryClient = useQueryClient();

  const {
    data: tenants,
    isLoading,
    error
  } = useQuery({
    queryKey: ['tenants', tenantId],
    queryFn: () => apiClient.get<Tenant[]>('/tenants', { tenantId }),
    enabled: !!tenantId
  });

  const createTenant = useMutation({
    mutationFn: (data: TenantCreate) =>
      apiClient.post<Tenant>('/tenants', data, { tenantId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    }
  });

  const updateTenant = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TenantUpdate }) =>
      apiClient.put<Tenant>(`/tenants/${id}`, data, { tenantId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    }
  });

  return {
    tenants: tenants || [],
    isLoading,
    error,
    createTenant: createTenant.mutate,
    createTenantAsync: createTenant.mutateAsync,
    isCreating: createTenant.isPending,
    updateTenant: updateTenant.mutate,
    updateTenantAsync: updateTenant.mutateAsync,
    isUpdating: updateTenant.isPending
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
