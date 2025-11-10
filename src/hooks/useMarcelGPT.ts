import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

const isMarcelEnabled = process.env.NEXT_PUBLIC_ENABLE_MARCEL_GPT === 'true';

function assertMarcelEnabled() {
  if (!isMarcelEnabled) {
    throw new Error('MarcelGPT module is disabled');
  }
}

function isMarcelConfigError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message : String(error ?? '').toLowerCase();

  if (!message) return false;

  return (
    message.includes('heygen api key not configured') ||
    message.includes('user not assigned to a tenant') ||
    message.includes('not found') ||
    message.includes('http 400')
  );
}

async function safeMarcelCall<T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (isMarcelConfigError(error)) {
      return fallback;
    }
    throw error;
  }
}

// Types
export interface HeyGenAvatar {
  avatar_id: string;
  avatar_name: string;
  gender?: string;
  preview_image_url?: string;
  preview_video_url?: string;
  is_public?: boolean;
  is_instant?: boolean;
  default_voice_id?: string;
  resolution?: {
    width?: number;
    height?: number;
  };
}

export interface HeyGenAvatarGroup {
  id: string;
  name?: string;
  numLooks: number;
  previewImage?: string;
  avatars?: HeyGenAvatar[];
  meta?: Record<string, any>;
}

export interface HeyGenVoice {
  voice_id: string;
  name: string;
  language?: string;
  gender?: string;
  accent?: string;
  age_range?: string;
  supports_emotion?: boolean;
}

export interface BrandPreset {
  id: number;
  tenant_id: number;
  user_id: string;
  name: string;
  description?: string;
  avatar_id: string;
  avatar_style?: string;
  voice_id: string;
  language?: string;
  tts_speed?: number;
  bg_type?: string;
  bg_value?: string;
  overlay_logo_url?: string;
  enable_subtitles?: boolean;
  subtitle_language?: string;
  subtitle_format?: string;
  video_width?: number;
  video_height?: number;
  aspect_ratio?: string;
  created_at: string;
}

export interface LookVisualConfig {
  backgroundType: 'color' | 'image' | 'green_screen';
  backgroundColor?: string;
  backgroundImageUrl?: string;
  clothingPrompt?: string;
  language: string;
  speed: number;
  tone?: string;
  enableSubtitles: boolean;
  subtitleLanguage?: string;
  width: number;
  height: number;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
  avatarStyle: 'circle' | 'closeUp' | 'full' | 'normal' | 'voiceOnly';
}

export interface PhotoAvatarLook {
  id: number | string;
  name: string;
  notes?: string;
  status: string;
  avatarId?: string;
  voiceId?: string;
  previewUrls: string[];
  coverUrl?: string;
  generationId?: string;
  errorMessage?: string;
  config: LookVisualConfig & Record<string, any>;
  presetId?: number;
  source?: string;
  meta?: Record<string, any>;
  groupId?: string;
  groupName?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CreateLookPayload {
  name: string;
  prompt?: string;
  notes?: string;
  voiceId: string;
  config: LookVisualConfig & Record<string, any>;
  lookOptions?: Record<string, any>;
  baseAvatarId?: string;
  baseAvatarPreviewUrl?: string;
}

export interface VideoJob {
  id: number;
  tenant_id: number;
  user_id: string;
  preset_id?: number;
  title?: string;
  engine: 'v2' | 'av4' | 'template';
  status:
    | 'pending'
    | 'queued'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'cancelled';
  heygen_job_id?: string;
  input_text: string;
  input_config: Record<string, any>;
  error_message?: string;
  retry_count: number;
  created_at: string;
  completed_at?: string;
  actual_duration?: number;
  artifacts?: VideoArtifact[];
}

export interface VideoArtifact {
  id: number;
  job_id: number;
  heygen_url?: string;
  storage_key: string;
  signed_url?: string;
  duration?: number;
  file_size?: number;
  thumbnail_url?: string;
  subtitle_url?: string;
  created_at: string;
}

export interface GenerateVideoRequest {
  title?: string;
  input_text: string;
  avatar_id: string;
  voice_id: string;
  engine?: 'v2' | 'av4';
  preset_id?: number;
  config?: {
    speed?: number;
    avatar_style?: string;
    width?: number;
    height?: number;
    background?: any;
  };
}

export interface GenerateVideoResponse {
  job_id: number;
  heygen_job_id: string;
  status: 'pending' | 'queued' | 'processing' | 'completed' | 'failed';
  message?: string;
}

// Avatars
export function useAvatars(forceRefresh = false) {
  return useQuery<{ avatars: HeyGenAvatar[]; count: number }>({
    queryKey: ['marcel-gpt', 'avatars', forceRefresh],
    queryFn: () =>
      safeMarcelCall(
        () => {
          assertMarcelEnabled();
          return apiClient.get(
            `/marcel-gpt/avatars?force_refresh=${forceRefresh}`
          );
        },
        { avatars: [], count: 0 }
      ),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    enabled: isMarcelEnabled
  });
}

export function useAvatarGroups(includeAvatars = false) {
  return useQuery<{ groups: HeyGenAvatarGroup[]; count: number }>({
    queryKey: ['marcel-gpt', 'avatar-groups', includeAvatars],
    queryFn: () =>
      safeMarcelCall(
        () => {
          assertMarcelEnabled();
          const query = includeAvatars ? '?include_avatars=true' : '';
          return apiClient.get(`/marcel-gpt/avatar-groups-v2${query}`);
        },
        { groups: [], count: 0 }
      ),
    staleTime: 6 * 60 * 60 * 1000,
    enabled: isMarcelEnabled
  });
}

export function useCustomGroupAvatars(groupId?: string, enabled = false) {
  return useQuery<{ avatars: HeyGenAvatar[]; count: number; group_id: string }>(
    {
      queryKey: ['marcel-gpt', 'custom-group', groupId],
      queryFn: () =>
        safeMarcelCall(
          () => {
            assertMarcelEnabled();
            if (!groupId) throw new Error('Group ID is required');
            return apiClient.get(
              `/marcel-gpt/avatar-groups/${groupId}/avatars`
            );
          },
          { avatars: [], count: 0, group_id: groupId || '' }
        ),
      staleTime: 6 * 60 * 60 * 1000,
      enabled: isMarcelEnabled && enabled && !!groupId
    }
  );
}

// Voices
export function useVoices(filters?: { language?: string; gender?: string }) {
  const queryKey = ['marcel-gpt', 'voices', filters];

  return useQuery<{ voices: HeyGenVoice[]; count: number }>({
    queryKey,
    queryFn: () =>
      safeMarcelCall(
        () => {
          assertMarcelEnabled();
          const params = new URLSearchParams();
          params.append('limit', '15'); // Max 15 voices
          if (filters?.language) params.append('language', filters.language);
          if (filters?.gender) params.append('gender', filters.gender);

          return apiClient.get(
            `/marcel-gpt/voices${
              params.toString() ? '?' + params.toString() : ''
            }`
          );
        },
        { voices: [], count: 0 }
      ),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    enabled: isMarcelEnabled
  });
}

// Photo Avatar Looks
export function usePhotoAvatarLooks() {
  return useQuery<{ looks: PhotoAvatarLook[]; count: number }>({
    queryKey: ['marcel-gpt', 'photo-avatars', 'looks'],
    queryFn: () =>
      safeMarcelCall(
        () => {
          assertMarcelEnabled();
          return apiClient.get('/marcel-gpt/photo-avatars/looks?limit=15');
        },
        { looks: [], count: 0 }
      ),
    enabled: isMarcelEnabled,
    refetchInterval: (query) => {
      const data = query.state.data;
      const pending = data?.looks?.some(
        (look) => !['ready', 'failed', 'error'].includes(look.status)
      );
      return pending ? 4000 : false;
    }
  });
}

export function useCreatePhotoAvatarLook() {
  const queryClient = useQueryClient();

  return useMutation<{ look: PhotoAvatarLook }, unknown, CreateLookPayload>({
    mutationFn: async (payload: CreateLookPayload) => {
      assertMarcelEnabled();
      return await apiClient.post('/marcel-gpt/photo-avatars/looks', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['marcel-gpt', 'photo-avatars', 'looks']
      });
      queryClient.invalidateQueries({ queryKey: ['marcel-gpt', 'presets'] });
    }
  });
}

export function usePhotoAvatarLook(lookId?: number, enabled = true) {
  return useQuery<{ look: PhotoAvatarLook }>({
    queryKey: ['marcel-gpt', 'photo-avatars', 'looks', lookId],
    queryFn: async () => {
      assertMarcelEnabled();
      return await apiClient.get(`/marcel-gpt/photo-avatars/looks/${lookId}`);
    },
    enabled: isMarcelEnabled && enabled && !!lookId
  });
}

export function useRefreshPhotoAvatarLook() {
  const queryClient = useQueryClient();

  return useMutation<{ look: PhotoAvatarLook }, unknown, number>({
    mutationFn: async (lookId: number) => {
      assertMarcelEnabled();
      return await apiClient.post(
        `/marcel-gpt/photo-avatars/looks/${lookId}/refresh`,
        {}
      );
    },
    onSuccess: (_, lookId) => {
      queryClient.invalidateQueries({
        queryKey: ['marcel-gpt', 'photo-avatars', 'looks']
      });
      queryClient.invalidateQueries({
        queryKey: ['marcel-gpt', 'photo-avatars', 'looks', lookId]
      });
    }
  });
}

// Brand Presets
export function usePresets() {
  return useQuery<{ presets: BrandPreset[]; count: number }>({
    queryKey: ['marcel-gpt', 'presets'],
    queryFn: () =>
      safeMarcelCall(
        () => {
          assertMarcelEnabled();
          return apiClient.get('/marcel-gpt/presets');
        },
        { presets: [], count: 0 }
      ),
    enabled: isMarcelEnabled
  });
}

export function useCreatePreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<BrandPreset>) => {
      assertMarcelEnabled();
      return await apiClient.post('/marcel-gpt/presets', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marcel-gpt', 'presets'] });
    }
  });
}

export function useDeletePreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (presetId: number) => {
      assertMarcelEnabled();
      return await apiClient.delete(`/marcel-gpt/presets/${presetId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marcel-gpt', 'presets'] });
    }
  });
}

// Video Generation
export function useGenerateVideo() {
  const queryClient = useQueryClient();

  return useMutation<GenerateVideoResponse, unknown, GenerateVideoRequest>({
    mutationFn: async (data: GenerateVideoRequest) => {
      assertMarcelEnabled();
      return await apiClient.post<GenerateVideoResponse>(
        '/marcel-gpt/generate',
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marcel-gpt', 'jobs'] });
    }
  });
}

// Video Jobs
export function useVideoJobs(status?: string) {
  const queryKey = ['marcel-gpt', 'jobs', status];

  return useQuery<{ jobs: VideoJob[]; count: number }>({
    queryKey,
    queryFn: () =>
      safeMarcelCall(
        () => {
          assertMarcelEnabled();
          const params = status ? `?status=${status}` : '';
          return apiClient.get(`/marcel-gpt/jobs${params}`);
        },
        { jobs: [], count: 0 }
      ),
    enabled: isMarcelEnabled,
    refetchInterval: (query) => {
      // Auto-refresh if there are pending/processing jobs
      const data = query.state.data;
      const hasActiveJobs = data?.jobs?.some((job) =>
        ['pending', 'queued', 'processing'].includes(job.status)
      );
      return hasActiveJobs ? 5000 : false; // 5 seconds
    }
  });
}

export function useVideoJob(jobId: number) {
  return useQuery<VideoJob>({
    queryKey: ['marcel-gpt', 'jobs', jobId],
    queryFn: async () => {
      assertMarcelEnabled();
      return await apiClient.get(`/marcel-gpt/jobs/${jobId}`);
    },
    enabled: isMarcelEnabled && !!jobId,
    refetchInterval: (query) => {
      // Auto-refresh while job is active
      const data = query.state.data;
      if (data && ['pending', 'queued', 'processing'].includes(data.status)) {
        return 3000; // 3 seconds
      }
      return false;
    }
  });
}

export function useCancelJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: number) => {
      assertMarcelEnabled();
      return await apiClient.post(`/marcel-gpt/jobs/${jobId}/cancel`, {});
    },
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: ['marcel-gpt', 'jobs'] });
      queryClient.invalidateQueries({
        queryKey: ['marcel-gpt', 'jobs', jobId]
      });
    }
  });
}

export function useCheckJobStatus() {
  return useMutation({
    mutationFn: async (jobId: number) => {
      assertMarcelEnabled();
      return await apiClient.get(`/marcel-gpt/jobs/${jobId}/status`);
    }
  });
}

// =========================================================================
// Script Generation Hooks (ChatGPT Integration)
// =========================================================================

export interface GenerateScriptPayload {
  prompt: string;
  context?: string;
  max_tokens?: number;
  temperature?: number;
}

export interface ScriptResponse {
  script: string;
  prompt?: string;
  generated_at?: string;
  source?: string;
  filename?: string;
  original_script?: string;
  refinement_instructions?: string;
}

export interface RefineScriptPayload {
  original_script: string;
  refinement_instructions: string;
}

export interface GenerateIncidentScriptPayload {
  what_happened: string;
  why_did_it_happen?: string;
  what_did_they_learn?: string;
  ask_yourself_or_crew?: string;
}

export function useGenerateScript() {
  return useMutation<ScriptResponse, unknown, GenerateScriptPayload>({
    mutationFn: async (payload: GenerateScriptPayload) => {
      assertMarcelEnabled();
      return await apiClient.post<ScriptResponse>(
        '/marcel-gpt/scripts/generate',
        payload
      );
    }
  });
}

export function useGenerateScriptFromPDF() {
  return useMutation<ScriptResponse, unknown, File>({
    mutationFn: async (file: File) => {
      assertMarcelEnabled();
      const formData = new FormData();
      formData.append('file', file);

      return await apiClient.post<ScriptResponse>(
        '/marcel-gpt/scripts/from-pdf',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
    }
  });
}

export function useRefineScript() {
  return useMutation<ScriptResponse, unknown, RefineScriptPayload>({
    mutationFn: async (payload: RefineScriptPayload) => {
      assertMarcelEnabled();
      return await apiClient.post<ScriptResponse>(
        '/marcel-gpt/scripts/refine',
        payload
      );
    }
  });
}

export function useGenerateIncidentScript() {
  return useMutation<ScriptResponse, unknown, GenerateIncidentScriptPayload>({
    mutationFn: async (payload: GenerateIncidentScriptPayload) => {
      assertMarcelEnabled();
      return await apiClient.post<ScriptResponse>(
        '/marcel-gpt/scripts/from-incident',
        payload
      );
    }
  });
}
