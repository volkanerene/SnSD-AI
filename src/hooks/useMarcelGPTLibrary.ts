import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface VideoJob {
  id: number;
  title?: string;
  status:
    | 'pending'
    | 'queued'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'cancelled';
  created_at: string;
  completed_at?: string;
  error_message?: string;
  duration?: number;
  artifacts?: VideoArtifact[];
}

export interface VideoArtifact {
  id: number;
  job_id: number;
  heygen_url?: string;
  storage_key?: string;
  signed_url?: string;
  duration?: number;
  file_size?: number;
  thumbnail_url?: string;
  created_at: string;
}

export function useVideoJobs(status?: string) {
  return useQuery<VideoJob[]>({
    queryKey: ['videoJobs', status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) {
        params.append('status', status);
      }
      const response = await apiClient.get(
        `/marcel-gpt/jobs?${params.toString()}`
      );
      // Backend returns { jobs: [...], count: ... }
      // Extract the jobs array from the response
      return response.data.jobs || [];
    },
    refetchInterval: 5000, // Refetch every 5 seconds to check for updates
    staleTime: 2000
  });
}

export function useVideoJobDetails(jobId: number) {
  return useQuery<VideoJob>({
    queryKey: ['videoJob', jobId],
    queryFn: async () => {
      const response = await apiClient.get(`/marcel-gpt/jobs/${jobId}`);
      return response.data;
    },
    refetchInterval: (data) => {
      // Stop polling if job is completed or failed
      if (
        data?.status === 'completed' ||
        data?.status === 'failed' ||
        data?.status === 'cancelled'
      ) {
        return false;
      }
      return 3000; // Poll every 3 seconds for active jobs
    }
  });
}

export function useInvalidateVideoJobs() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['videoJobs'] });
  };
}
