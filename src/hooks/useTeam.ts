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

// ========================================
// Queries
// ========================================

/**
 * Get team members for the current user's tenant
 */
export function useTeamMembers(filters?: TeamMemberFilters) {
  return useQuery<TeamMember[]>({
    queryKey: ['team', 'members', filters],
    queryFn: async () => {
      const endpoint = `/tenants/my/users${buildQueryString(filters)}`;
      return await apiClient.get<TeamMember[]>(endpoint);
    }
  });
}

/**
 * Get a specific team member by ID
 */
export function useTeamMember(userId?: string) {
  return useQuery<TeamMember>({
    queryKey: ['team', 'members', userId],
    queryFn: async () => {
      return await apiClient.get<TeamMember>(`/tenants/my/users/${userId}`);
    },
    enabled: !!userId
  });
}

/**
 * Get team statistics
 */
export function useTeamStats() {
  return useQuery<TeamStats>({
    queryKey: ['team', 'stats'],
    queryFn: async () => {
      return await apiClient.get<TeamStats>('/tenants/my/stats');
    }
  });
}

// ========================================
// Mutations
// ========================================

/**
 * Add a user to the current tenant's team
 */
export function useAddTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddTeamMemberDto) => {
      return await apiClient.post<TeamMember>('/tenants/my/users', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'members'] });
      queryClient.invalidateQueries({ queryKey: ['team', 'stats'] });
    }
  });
}

/**
 * Update a team member's details
 */
export function useUpdateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      data
    }: {
      userId: string;
      data: UpdateTeamMemberDto;
    }) => {
      return await apiClient.put<TeamMember>(
        `/tenants/my/users/${userId}`,
        data
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team', 'members'] });
      queryClient.invalidateQueries({
        queryKey: ['team', 'members', variables.userId]
      });
      queryClient.invalidateQueries({ queryKey: ['team', 'stats'] });
    }
  });
}

/**
 * Remove a user from the current tenant's team
 */
export function useRemoveTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.delete(`/tenants/my/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'members'] });
      queryClient.invalidateQueries({ queryKey: ['team', 'stats'] });
    }
  });
}

/**
 * Activate or deactivate a team member
 */
export function useToggleTeamMemberStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      isActive
    }: {
      userId: string;
      isActive: boolean;
    }) => {
      return await apiClient.post(`/tenants/my/users/${userId}/status`, {
        is_active: isActive
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team', 'members'] });
      queryClient.invalidateQueries({
        queryKey: ['team', 'members', variables.userId]
      });
      queryClient.invalidateQueries({ queryKey: ['team', 'stats'] });
    }
  });
}
