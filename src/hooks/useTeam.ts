import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { buildQueryString } from '@/lib/query-params';

// ========================================
// Types
// ========================================

export interface TeamMember {
  id: string;
  user_id: string;
  tenant_id: string;
  role_id: number;
  full_name: string;
  email: string;
  avatar_url?: string;
  department?: string;
  job_title?: string;
  is_active: boolean;
  joined_at: string;
  last_active_at?: string;
  role?: {
    id: number;
    name: string;
    level: number;
  };
}

export interface TeamMemberFilters {
  status?: 'active' | 'inactive';
  role_id?: number;
  search?: string;
}

export interface AddTeamMemberDto {
  user_id: string;
  role_id: number;
}

export interface UpdateTeamMemberDto {
  role_id?: number;
  department?: string;
  job_title?: string;
  is_active?: boolean;
}

export interface TeamStats {
  total_members: number;
  active_members: number;
  inactive_members: number;
  by_role: Record<string, number>;
}

// useTeam.ts

export function useTeamMembers(tenantId: string, filters?: TeamMemberFilters) {
  return useQuery<TeamMember[]>({
    queryKey: ['team', tenantId, 'members', filters],
    queryFn: async () => {
      const endpoint = `/tenants/${tenantId}/users${buildQueryString(filters)}`;
      return await apiClient.get<TeamMember[]>(endpoint);
    },
    enabled: !!tenantId
  });
}

export function useTeamMember(tenantId: string, userId?: string) {
  return useQuery<TeamMember>({
    queryKey: ['team', tenantId, 'members', userId],
    queryFn: async () => {
      return await apiClient.get<TeamMember>(
        `/tenants/${tenantId}/users/${userId}`
      );
    },
    enabled: !!tenantId && !!userId
  });
}

export function useTeamStats(tenantId: string) {
  return useQuery<TeamStats>({
    queryKey: ['team', tenantId, 'stats'],
    queryFn: async () => {
      return await apiClient.get<TeamStats>(`/tenants/${tenantId}/statistics`);
    },
    enabled: !!tenantId
  });
}

export function useAddTeamMember(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AddTeamMemberDto) =>
      await apiClient.post<TeamMember>(`/tenants/${tenantId}/users`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['team', tenantId, 'members']
      });
      queryClient.invalidateQueries({ queryKey: ['team', tenantId, 'stats'] });
    }
  });
}

export function useUpdateTeamMember(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      data
    }: {
      userId: string;
      data: UpdateTeamMemberDto;
    }) =>
      await apiClient.put<TeamMember>(
        `/tenants/${tenantId}/users/${userId}`,
        data
      ),
    onSuccess: (_, v) => {
      queryClient.invalidateQueries({
        queryKey: ['team', tenantId, 'members']
      });
      queryClient.invalidateQueries({
        queryKey: ['team', tenantId, 'members', v.userId]
      });
      queryClient.invalidateQueries({ queryKey: ['team', tenantId, 'stats'] });
    }
  });
}

export function useRemoveTeamMember(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) =>
      await apiClient.delete(`/tenants/${tenantId}/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['team', tenantId, 'members']
      });
      queryClient.invalidateQueries({ queryKey: ['team', tenantId, 'stats'] });
    }
  });
}

export function useToggleTeamMemberStatus(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      isActive
    }: {
      userId: string;
      isActive: boolean;
    }) =>
      await apiClient.post(`/tenants/${tenantId}/users/${userId}/status`, {
        is_active: isActive
      }),
    onSuccess: (_, v) => {
      queryClient.invalidateQueries({
        queryKey: ['team', tenantId, 'members']
      });
      queryClient.invalidateQueries({
        queryKey: ['team', tenantId, 'members', v.userId]
      });
      queryClient.invalidateQueries({ queryKey: ['team', tenantId, 'stats'] });
    }
  });
}
