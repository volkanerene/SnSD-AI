import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { buildQueryString } from '@/lib/query-params';
import { apiClient } from '@/lib/api-client';

// Types
export interface Invitation {
  id: string;
  email: string;
  tenant_id: string;
  role_id: number;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  token: string;
  expires_at: string;
  invited_by?: string;
  invited_by_name?: string;
  accepted_at?: string;
  accepted_by?: string;
  created_at: string;
  metadata?: Record<string, any>;
  tenant?: {
    id: string;
    name: string;
  };
  role?: {
    id: number;
    name: string;
  };
}

export interface InvitationFilters {
  tenant_id?: string;
  status?: 'pending' | 'accepted' | 'expired' | 'cancelled';
  limit?: number;
  offset?: number;
}

export interface CreateInvitationDto {
  email: string;
  tenant_id: string;
  role_id: number;
  metadata?: Record<string, any>;
}

export interface AcceptInvitationDto {
  user_id: string;
}

// Get all invitations with filters
export function useInvitations(filters?: InvitationFilters) {
  return useQuery<Invitation[]>({
    queryKey: ['invitations', filters],
    queryFn: async () => {
      const response = await apiClient.get<Invitation[]>(
        `/invitations${buildQueryString(filters)}`
      );
      return response;
    }
  });
}

// Get single invitation by ID
export function useInvitation(invitationId: string | undefined) {
  return useQuery<Invitation>({
    queryKey: ['invitations', invitationId],
    queryFn: async () => {
      if (!invitationId) throw new Error('Invitation ID is required');
      const response = await apiClient.get<Invitation>(
        `/invitations/${invitationId}`
      );
      return response;
    },
    enabled: !!invitationId
  });
}

// Get invitation by token (public - no auth required)
export function useInvitationByToken(token: string | undefined) {
  return useQuery<Invitation>({
    queryKey: ['invitations', 'token', token],
    queryFn: async () => {
      if (!token) throw new Error('Token is required');
      const response = await apiClient.get<Invitation>(
        `/invitations/token/${token}`
      );
      return response;
    },
    enabled: !!token
  });
}

// Create new invitation
export function useCreateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateInvitationDto) => {
      const response = await apiClient.post<Invitation>('/invitations', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    }
  });
}

// Accept invitation
export function useAcceptInvitation(invitationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AcceptInvitationDto) => {
      const response = await apiClient.post<Invitation>(
        `/invitations/${invitationId}/accept`,
        data
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({
        queryKey: ['invitations', invitationId]
      });
      queryClient.invalidateQueries({ queryKey: ['tenant-users'] });
    }
  });
}

// Resend invitation
export function useResendInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const response = await apiClient.post<Invitation>(
        `/invitations/${invitationId}/resend`,
        {}
      );
      return response;
    },
    onSuccess: (_, invitationId) => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({
        queryKey: ['invitations', invitationId]
      });
    }
  });
}

// Cancel invitation
export function useCancelInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      await apiClient.delete(`/invitations/${invitationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    }
  });
}
