import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { buildQueryString } from '@/lib/query-params';
import { apiClient } from '@/lib/api-client';

// Types
export interface SubscriptionTier {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  price_monthly?: number;
  price_yearly?: number;
  max_users?: number;
  max_evaluations_per_month?: number;
  max_contractors?: number;
  max_storage_gb?: number;
  features: Record<string, any>;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TenantSubscription {
  id: string;
  tenant_id: string;
  tier_id: number;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  billing_cycle?: 'monthly' | 'yearly';
  starts_at: string;
  ends_at?: string;
  trial_ends_at?: string;
  cancelled_at?: string;
  metadata?: Record<string, any>;
  tier?: SubscriptionTier;
}

export interface UsageTracking {
  tenant_id: string;
  period_start: string;
  period_end: string;
  users_count: number;
  evaluations_count: number;
  contractors_count: number;
  storage_used_gb?: number;
  api_calls_count?: number;
}

export interface CreateTierDto {
  name: string;
  display_name: string;
  description?: string;
  price_monthly?: number;
  price_yearly?: number;
  max_users?: number;
  max_evaluations_per_month?: number;
  max_contractors?: number;
  max_storage_gb?: number;
  features?: Record<string, any>;
  sort_order?: number;
}

export interface UpdateTierDto {
  display_name?: string;
  description?: string;
  price_monthly?: number;
  price_yearly?: number;
  max_users?: number;
  max_evaluations_per_month?: number;
  max_contractors?: number;
  max_storage_gb?: number;
  features?: Record<string, any>;
  is_active?: boolean;
  sort_order?: number;
}

// Get all subscription tiers
export function useSubscriptionTiers(isActive?: boolean) {
  return useQuery<SubscriptionTier[]>({
    queryKey: ['subscription-tiers', isActive],
    queryFn: async () => {
      const params = isActive !== undefined ? { is_active: isActive } : {};
      const endpoint = `/tiers${buildQueryString(params)}`;
      const response = await apiClient.get<SubscriptionTier[]>(endpoint);
      return response;
    },
    staleTime: 10 * 60 * 1000 // Cache for 10 minutes
  });
}

// Get single tier
export function useSubscriptionTier(tierId: number | undefined) {
  return useQuery<SubscriptionTier>({
    queryKey: ['subscription-tiers', tierId],
    queryFn: async () => {
      if (!tierId) throw new Error('Tier ID is required');
      const response = await apiClient.get<SubscriptionTier>(
        `/tiers/${tierId}`
      );
      return response;
    },
    enabled: !!tierId
  });
}

// Get tier features
export function useTierFeatures(tierId: number | undefined) {
  return useQuery<Record<string, any>>({
    queryKey: ['subscription-tiers', tierId, 'features'],
    queryFn: async () => {
      if (!tierId) throw new Error('Tier ID is required');
      const response = await apiClient.get<Record<string, any>>(
        `/tiers/${tierId}/features`
      );
      return response;
    },
    enabled: !!tierId
  });
}

// Get current subscription for a tenant
export function useCurrentSubscription(tenantId: string | undefined) {
  return useQuery<TenantSubscription>({
    queryKey: ['subscriptions', 'current', tenantId],
    queryFn: async () => {
      if (!tenantId) throw new Error('Tenant ID is required');
      const response = await apiClient.get<TenantSubscription>(
        `/subscriptions/current/${tenantId}`
      );
      return response;
    },
    enabled: !!tenantId
  });
}

// Get usage tracking for a tenant
export function useUsageTracking(tenantId: string | undefined) {
  return useQuery<UsageTracking>({
    queryKey: ['usage', tenantId],
    queryFn: async () => {
      if (!tenantId) throw new Error('Tenant ID is required');
      const response = await apiClient.get<UsageTracking>(`/usage/${tenantId}`);
      return response;
    },
    enabled: !!tenantId
  });
}

// Create subscription tier (super admin only)
export function useCreateSubscriptionTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTierDto) => {
      const response = await apiClient.post<SubscriptionTier>('/tiers', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-tiers'] });
    }
  });
}

// Update subscription tier (super admin only)
export function useUpdateSubscriptionTier(tierId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateTierDto) => {
      const response = await apiClient.patch<SubscriptionTier>(
        `/tiers/${tierId}`,
        data
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-tiers'] });
      queryClient.invalidateQueries({
        queryKey: ['subscription-tiers', tierId]
      });
    }
  });
}
