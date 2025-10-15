import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Payment, PaymentCreate, PaymentFilters } from '@/types/api';

export function usePayments(tenantId: string, filters?: PaymentFilters) {
  const queryClient = useQueryClient();

  const queryString = new URLSearchParams();
  if (filters?.status) queryString.append('status', filters.status);
  if (filters?.limit) queryString.append('limit', filters.limit.toString());
  if (filters?.offset) queryString.append('offset', filters.offset.toString());

  const endpoint = `/payments${queryString.toString() ? `?${queryString}` : ''}`;

  const {
    data: payments,
    isLoading,
    error
  } = useQuery({
    queryKey: ['payments', tenantId, filters],
    queryFn: () => apiClient.get<Payment[]>(endpoint, { tenantId }),
    enabled: !!tenantId
  });

  const createPayment = useMutation({
    mutationFn: (data: PaymentCreate) =>
      apiClient.post<Payment>('/payments', data, { tenantId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', tenantId] });
    }
  });

  return {
    payments: payments || [],
    isLoading,
    error,
    createPayment: createPayment.mutate,
    createPaymentAsync: createPayment.mutateAsync,
    isCreating: createPayment.isPending
  };
}

export function usePayment(tenantId: string, paymentId: string) {
  const {
    data: payment,
    isLoading,
    error
  } = useQuery({
    queryKey: ['payments', tenantId, paymentId],
    queryFn: () =>
      apiClient.get<Payment>(`/payments/${paymentId}`, { tenantId }),
    enabled: !!tenantId && !!paymentId
  });

  return { payment, isLoading, error };
}
