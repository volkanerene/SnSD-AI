import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  Contractor,
  ContractorCreate,
  ContractorUpdate,
  ContractorFilters,
  UUID
} from '@/types/api';
import { useMemo } from 'react';

interface UseContractorsOptions {
  tenantId?: string;
  filters?: ContractorFilters;
}

function getDefaultTenantId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  // senin tarafta aktif tenant nerede saklanıyorsa onu oku:
  // 1) localStorage
  const ls = window.localStorage.getItem('activeTenantId') ?? undefined;
  // 2) (opsiyonel) global store’dan oku (ör: Zustand)
  // const storeTenant = useActiveTenantId(); // varsa
  return ls; // veya storeTenant ?? ls;
}
/**
 * Custom hook for managing contractors list with filtering and pagination
 */
export function useContractors(options: UseContractorsOptions = {}) {
  const queryClient = useQueryClient();
  const { tenantId: propTenantId, filters } = options;
  const tenantId = useMemo(
    () => propTenantId ?? getDefaultTenantId(),
    [propTenantId]
  );
  // Build query params
  const queryParams = new URLSearchParams();
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());
  if (filters?.offset) queryParams.append('offset', filters.offset.toString());

  const queryString = queryParams.toString();
  // Add trailing slash to prevent 307 redirect
  const endpoint = `/contractors/${queryString ? `?${queryString}` : ''}`;

  // Get contractors list
  const {
    data: contractors,
    isLoading,
    error,
    refetch
  } = useQuery<Contractor[]>({
    queryKey: ['contractors', tenantId, filters],
    queryFn: async () => apiClient.get<Contractor[]>(endpoint, { tenantId }),
    enabled: !!tenantId, // 👈 tenant yoksa istek atma
    staleTime: 2 * 60 * 1000
  });

  // Create contractor mutation
  const createContractorMutation = useMutation({
    mutationFn: async (data: ContractorCreate) => {
      return apiClient.post<Contractor>('/contractors/', data, { tenantId });
    },
    onSuccess: (newContractor) => {
      // Add new contractor to cache
      queryClient.setQueryData<Contractor[]>(
        ['contractors', tenantId, filters],
        (old) => (old ? [...old, newContractor] : [newContractor])
      );

      // Invalidate contractors list to refetch
      queryClient.invalidateQueries({ queryKey: ['contractors', tenantId] });
    }
  });

  return {
    contractors: contractors || [],
    isLoading,
    error,
    refetch,

    // Create contractor
    createContractor: createContractorMutation.mutate,
    createContractorAsync: createContractorMutation.mutateAsync,
    isCreating: createContractorMutation.isPending,
    createError: createContractorMutation.error
  };
}

/**
 * Custom hook for managing a single contractor
 */
export function useContractor(contractorId: UUID, tenantId?: string) {
  const queryClient = useQueryClient();

  // Get contractor details
  const {
    data: contractor,
    isLoading,
    error,
    refetch
  } = useQuery<Contractor>({
    queryKey: ['contractor', contractorId, tenantId],
    queryFn: async () => {
      return apiClient.get<Contractor>(`/contractors/${contractorId}`, {
        tenantId
      });
    },
    enabled: !!contractorId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Update contractor mutation
  const updateContractorMutation = useMutation({
    mutationFn: async (data: ContractorUpdate) => {
      return apiClient.patch<Contractor>(`/contractors/${contractorId}`, data, {
        tenantId
      });
    },
    onSuccess: (updatedContractor) => {
      // Update cache with new contractor data
      queryClient.setQueryData<Contractor>(
        ['contractor', contractorId, tenantId],
        updatedContractor
      );

      // Update contractor in the list cache
      queryClient.setQueriesData<Contractor[]>(
        { queryKey: ['contractors', tenantId] },
        (old) => {
          if (!old) return old;
          return old.map((c) =>
            c.id === contractorId ? updatedContractor : c
          );
        }
      );

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['contractors', tenantId]
      });
    }
  });

  // Delete contractor mutation
  const deleteContractorMutation = useMutation({
    mutationFn: async () => {
      return apiClient.delete(`/contractors/${contractorId}`, { tenantId });
    },
    onSuccess: () => {
      // Remove contractor from cache
      queryClient.removeQueries({
        queryKey: ['contractor', contractorId, tenantId]
      });

      // Remove from list cache
      queryClient.setQueriesData<Contractor[]>(
        { queryKey: ['contractors', tenantId] },
        (old) => {
          if (!old) return old;
          return old.filter((c) => c.id !== contractorId);
        }
      );

      // Invalidate contractors list
      queryClient.invalidateQueries({
        queryKey: ['contractors', tenantId]
      });
    }
  });

  // Update risk level mutation
  const updateRiskLevelMutation = useMutation({
    mutationFn: async (data: {
      risk_level: 'green' | 'yellow' | 'red';
      evaluation_score?: number;
    }) => {
      return apiClient.patch<Contractor>(
        `/contractors/${contractorId}/risk-level`,
        data,
        { tenantId }
      );
    },
    onSuccess: (updatedContractor) => {
      queryClient.setQueryData<Contractor>(
        ['contractor', contractorId, tenantId],
        updatedContractor
      );
      queryClient.invalidateQueries({
        queryKey: ['contractors', tenantId]
      });
    }
  });

  // Blacklist contractor mutation
  const blacklistContractorMutation = useMutation({
    mutationFn: async (reason?: string) => {
      return apiClient.post<Contractor>(
        `/contractors/${contractorId}/blacklist`,
        { reason },
        { tenantId }
      );
    },
    onSuccess: (updatedContractor) => {
      queryClient.setQueryData<Contractor>(
        ['contractor', contractorId, tenantId],
        updatedContractor
      );
      queryClient.invalidateQueries({
        queryKey: ['contractors', tenantId]
      });
    }
  });

  // Activate contractor mutation
  const activateContractorMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post<Contractor>(
        `/contractors/${contractorId}/activate`,
        {},
        { tenantId }
      );
    },
    onSuccess: (updatedContractor) => {
      queryClient.setQueryData<Contractor>(
        ['contractor', contractorId, tenantId],
        updatedContractor
      );
      queryClient.invalidateQueries({
        queryKey: ['contractors', tenantId]
      });
    }
  });

  return {
    // Contractor data
    contractor,
    isLoading,
    error,
    refetch,

    // Update contractor
    updateContractor: updateContractorMutation.mutate,
    updateContractorAsync: updateContractorMutation.mutateAsync,
    isUpdating: updateContractorMutation.isPending,
    updateError: updateContractorMutation.error,

    // Delete contractor
    deleteContractor: deleteContractorMutation.mutate,
    deleteContractorAsync: deleteContractorMutation.mutateAsync,
    isDeleting: deleteContractorMutation.isPending,
    deleteError: deleteContractorMutation.error,

    // Update risk level
    updateRiskLevel: updateRiskLevelMutation.mutate,
    updateRiskLevelAsync: updateRiskLevelMutation.mutateAsync,
    isUpdatingRiskLevel: updateRiskLevelMutation.isPending,
    updateRiskLevelError: updateRiskLevelMutation.error,

    // Blacklist contractor
    blacklistContractor: blacklistContractorMutation.mutate,
    blacklistContractorAsync: blacklistContractorMutation.mutateAsync,
    isBlacklisting: blacklistContractorMutation.isPending,
    blacklistError: blacklistContractorMutation.error,

    // Activate contractor
    activateContractor: activateContractorMutation.mutate,
    activateContractorAsync: activateContractorMutation.mutateAsync,
    isActivating: activateContractorMutation.isPending,
    activateError: activateContractorMutation.error
  };
}
