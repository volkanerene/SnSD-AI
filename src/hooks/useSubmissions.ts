import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  FRM32Submission,
  FRM32SubmissionCreate,
  FRM32SubmissionUpdate,
  SubmissionFilters
} from '@/types/api';

export function useSubmissions(tenantId: string, filters?: SubmissionFilters) {
  const queryClient = useQueryClient();

  const queryString = new URLSearchParams();
  if (filters?.status) queryString.append('status', filters.status);
  if (filters?.contractor_id)
    queryString.append('contractor_id', filters.contractor_id);
  if (filters?.limit) queryString.append('limit', filters.limit.toString());
  if (filters?.offset) queryString.append('offset', filters.offset.toString());

  const endpoint = `/frm32/submissions${
    queryString.toString() ? `?${queryString}` : ''
  }`;

  const {
    data: submissions,
    isLoading,
    error
  } = useQuery({
    queryKey: ['submissions', tenantId, filters],
    queryFn: () => apiClient.get<FRM32Submission[]>(endpoint, { tenantId }),
    enabled: !!tenantId
  });

  const createSubmission = useMutation({
    mutationFn: (data: FRM32SubmissionCreate) =>
      apiClient.post<FRM32Submission>('/frm32/submissions', data, {
        tenantId
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions', tenantId] });
    }
  });

  const updateSubmission = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FRM32SubmissionUpdate }) =>
      apiClient.put<FRM32Submission>(`/frm32/submissions/${id}`, data, {
        tenantId
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions', tenantId] });
    }
  });

  return {
    submissions: submissions || [],
    isLoading,
    error,
    createSubmission: createSubmission.mutate,
    createSubmissionAsync: createSubmission.mutateAsync,
    isCreating: createSubmission.isPending,
    updateSubmission: updateSubmission.mutate,
    updateSubmissionAsync: updateSubmission.mutateAsync,
    isUpdating: updateSubmission.isPending
  };
}

export function useSubmission(tenantId: string, submissionId: string) {
  const {
    data: submission,
    isLoading,
    error
  } = useQuery({
    queryKey: ['submissions', tenantId, submissionId],
    queryFn: () =>
      apiClient.get<FRM32Submission>(`/frm32/submissions/${submissionId}`, {
        tenantId
      }),
    enabled: !!tenantId && !!submissionId
  });

  return { submission, isLoading, error };
}
