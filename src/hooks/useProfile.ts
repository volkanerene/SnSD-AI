import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Profile, ProfileUpdate, UUID } from '@/types/api';

interface UseProfileOptions {
  tenantId?: string;
  userId?: UUID;
}

/**
 * Custom hook for user profile management
 * Handles fetching, updating user profiles
 */
export function useProfile(options: UseProfileOptions = {}) {
  const queryClient = useQueryClient();
  const { tenantId, userId } = options;

  // Get current user profile
  const {
    data: profile,
    isLoading,
    error,
    refetch
  } = useQuery<Profile>({
    queryKey: ['profile', userId, tenantId],
    queryFn: async () => {
      const endpoint = userId ? `/profiles/${userId}` : '/profiles/me';
      return apiClient.get<Profile>(endpoint, { tenantId });
    },
    enabled: true,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileUpdate) => {
      const endpoint = userId ? `/profiles/${userId}` : '/profiles/me';
      return apiClient.patch<Profile>(endpoint, data, { tenantId });
    },
    onSuccess: (updatedProfile) => {
      // Update cache with new profile data
      queryClient.setQueryData<Profile>(
        ['profile', userId, tenantId],
        updatedProfile
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      // This assumes your backend has an endpoint for avatar upload
      const endpoint = userId
        ? `/profiles/${userId}/avatar`
        : '/profiles/me/avatar';

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${endpoint}`,
        {
          method: 'POST',
          headers: {
            ...(await apiClient['getAuthHeaders'](tenantId))
          },
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['profile', userId, tenantId]
      });
    }
  });

  // Deactivate profile mutation
  const deactivateProfileMutation = useMutation({
    mutationFn: async () => {
      const endpoint = userId
        ? `/profiles/${userId}/deactivate`
        : '/profiles/me/deactivate';
      return apiClient.post(endpoint, {}, { tenantId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['profile', userId, tenantId]
      });
    }
  });

  // Activate profile mutation
  const activateProfileMutation = useMutation({
    mutationFn: async () => {
      const endpoint = userId
        ? `/profiles/${userId}/activate`
        : '/profiles/me/activate';
      return apiClient.post(endpoint, {}, { tenantId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['profile', userId, tenantId]
      });
    }
  });

  return {
    // Profile data
    profile,
    isLoading,
    error,
    refetch,

    // Update profile
    updateProfile: updateProfileMutation.mutate,
    updateProfileAsync: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
    updateError: updateProfileMutation.error,

    // Upload avatar
    uploadAvatar: uploadAvatarMutation.mutate,
    uploadAvatarAsync: uploadAvatarMutation.mutateAsync,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    uploadAvatarError: uploadAvatarMutation.error,

    // Deactivate profile
    deactivateProfile: deactivateProfileMutation.mutate,
    deactivateProfileAsync: deactivateProfileMutation.mutateAsync,
    isDeactivating: deactivateProfileMutation.isPending,
    deactivateError: deactivateProfileMutation.error,

    // Activate profile
    activateProfile: activateProfileMutation.mutate,
    activateProfileAsync: activateProfileMutation.mutateAsync,
    isActivating: activateProfileMutation.isPending,
    activateError: activateProfileMutation.error
  };
}

/**
 * Hook for fetching multiple profiles (e.g., for a team list)
 */
export function useProfiles(tenantId?: string) {
  const {
    data: profiles,
    isLoading,
    error,
    refetch
  } = useQuery<Profile[]>({
    queryKey: ['profiles', tenantId],
    queryFn: async () => {
      return apiClient.get<Profile[]>('/profiles', { tenantId });
    },
    staleTime: 2 * 60 * 1000 // 2 minutes
  });

  return {
    profiles: profiles || [],
    isLoading,
    error,
    refetch
  };
}
