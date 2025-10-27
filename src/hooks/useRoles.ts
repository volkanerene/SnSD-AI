import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Role, PaginationParams } from '@/types/api';
import { buildQueryString } from '@/lib/query-params';

// ========================================
// Types
// ========================================

export interface RoleCreate {
  name: string;
  slug: string;
  description?: string;
  level: number;
  permissions?: number[];
}

export interface RoleUpdate extends Partial<RoleCreate> {}

export interface RoleWithPermissions extends Role {
  permission_count: number;
}

// ========================================
// Queries
// ========================================

export function useRoles(filters?: PaginationParams) {
  return useQuery<Role[]>({
    queryKey: ['roles', filters],
    queryFn: async () => {
      const endpoint = `/roles${buildQueryString(filters)}`;
      return await apiClient.get<Role[]>(endpoint);
    }
  });
}

export function useRole(roleId?: number) {
  return useQuery<Role>({
    queryKey: ['roles', roleId],
    queryFn: async () => {
      return await apiClient.get<Role>(`/roles/${roleId}`);
    },
    enabled: !!roleId
  });
}

export function useRolePermissions(roleId?: number) {
  return useQuery<string[]>({
    queryKey: ['roles', roleId, 'permissions'],
    queryFn: async () => {
      return await apiClient.get<string[]>(`/roles/${roleId}/permissions`);
    },
    enabled: !!roleId
  });
}

// ========================================
// Mutations
// ========================================

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RoleCreate) => {
      return await apiClient.post<Role>('/roles', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    }
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: RoleUpdate }) => {
      return await apiClient.put<Role>(`/roles/${id}`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles', variables.id] });
    }
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleId: number) => {
      await apiClient.delete(`/roles/${roleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    }
  });
}

export function useAssignPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roleId,
      permissions
    }: {
      roleId: number;
      permissions: number[];
    }) => {
      return await apiClient.put(`/roles/${roleId}/permissions`, {
        permission_ids: permissions
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles', variables.roleId] });
      queryClient.invalidateQueries({
        queryKey: ['roles', variables.roleId, 'permissions']
      });
    }
  });
}
