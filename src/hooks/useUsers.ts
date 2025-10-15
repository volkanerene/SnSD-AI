import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Profile, ProfileUpdate, UUID } from '@/types/api';

interface UseUsersOptions {
  tenantId?: string;
  filters?: {
    role_id?: number;
    is_active?: boolean;
    limit?: number;
    offset?: number;
  };
}

/**
 * Custom hook for users/profiles management (admin only)
 * Handles listing all users, updating roles, activating/deactivating
 */
export function useUsers(options: UseUsersOptions = {}) {
  const queryClient = useQueryClient();
  const { tenantId, filters } = options;

  // Build query string
  const queryParams = new URLSearchParams();
  if (filters?.role_id !== undefined)
    queryParams.append('role_id', filters.role_id.toString());
  if (filters?.is_active !== undefined)
    queryParams.append('is_active', filters.is_active.toString());
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());
  if (filters?.offset) queryParams.append('offset', filters.offset.toString());
  const queryString = queryParams.toString();

  // List all users in tenant
  const {
    data: users,
    isLoading,
    error,
    refetch
  } = useQuery<Profile[]>({
    queryKey: ['users', tenantId, filters],
    queryFn: async () => {
      const endpoint = `/profiles/${queryString ? `?${queryString}` : ''}`;
      return apiClient.get<Profile[]>(endpoint, { tenantId });
    },
    enabled: !!tenantId,
    staleTime: 2 * 60 * 1000 // 2 minutes
  });

  // Update user profile (admin)
  const updateUserMutation = useMutation({
    mutationFn: async ({
      userId,
      data
    }: {
      userId: UUID;
      data: ProfileUpdate & { role_id?: number; is_active?: boolean };
    }) => {
      return apiClient.patch<Profile>(`/profiles/${userId}`, data, {
        tenantId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });

  // Activate user
  const activateUserMutation = useMutation({
    mutationFn: async (userId: UUID) => {
      return apiClient.post<Profile>(
        `/profiles/${userId}/activate`,
        {},
        { tenantId }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  // Deactivate user
  const deactivateUserMutation = useMutation({
    mutationFn: async (userId: UUID) => {
      return apiClient.post<Profile>(
        `/profiles/${userId}/deactivate`,
        {},
        { tenantId }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  return {
    // Users data
    users: users || [],
    isLoading,
    error,
    refetch,

    // Update user
    updateUser: updateUserMutation.mutate,
    updateUserAsync: updateUserMutation.mutateAsync,
    isUpdating: updateUserMutation.isPending,
    updateError: updateUserMutation.error,

    // Activate user
    activateUser: activateUserMutation.mutate,
    activateUserAsync: activateUserMutation.mutateAsync,
    isActivating: activateUserMutation.isPending,

    // Deactivate user
    deactivateUser: deactivateUserMutation.mutate,
    deactivateUserAsync: deactivateUserMutation.mutateAsync,
    isDeactivating: deactivateUserMutation.isPending
  };
}
