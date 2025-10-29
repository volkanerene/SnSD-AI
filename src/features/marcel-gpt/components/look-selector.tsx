'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  AdvancedVideoConfig,
  AdvancedVideoSettings
} from './advanced-video-settings';
import {
  type PhotoAvatarLook,
  type HeyGenVoice,
  type HeyGenAvatar,
  type CreateLookPayload,
  usePhotoAvatarLooks,
  useCreatePhotoAvatarLook,
  useRefreshPhotoAvatarLook,
  useVoices,
  useAvatars
} from '@/hooks/useMarcelGPT';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  IconPlus,
  IconSparkles,
  IconLoader2,
  IconRefresh,
  IconAlertTriangle
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface LookSelectorProps {
  selectedLookId?: number;
  onSelectLook: (look: PhotoAvatarLook) => void;
}

const DEFAULT_CONFIG: AdvancedVideoConfig = {
  backgroundType: 'color',
  backgroundColor: '#ffffff',
  language: 'en',
  speed: 1.0,
  tone: 'professional',
  enableSubtitles: false,
  width: 1280,
  height: 720,
  aspectRatio: '16:9',
  avatarStyle: 'normal'
};

const NOTE_PROMPTS = [
  'Smart casual outfit with office background for weekly updates',
  'Formal suit in white studio for corporate announcements',
  'Construction PPE with safety signage backdrop',
  'Medical scrubs on clean clinic background with calm tone',
  'Bright energy marketing look with branded colors',
  'Plain white background for easy compositing'
];

const STATUS_VARIANTS: Record<
  string,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  ready: { label: 'Ready', variant: 'outline' },
  completed: { label: 'Ready', variant: 'outline' },
  pending: { label: 'Pending', variant: 'secondary' },
  generating: { label: 'Generating', variant: 'secondary' },
  processing: { label: 'Processing', variant: 'secondary' },
  training: { label: 'Training', variant: 'secondary' },
  failed: { label: 'Failed', variant: 'destructive' },
  error: { label: 'Failed', variant: 'destructive' }
};

function getStatusBadge(status: string) {
  const normalized = status.toLowerCase();
  return STATUS_VARIANTS[normalized] || { label: status, variant: 'secondary' };
}

export function LookSelector({
  selectedLookId,
  onSelectLook
}: LookSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [lookName, setLookName] = useState('');
  const [notes, setNotes] = useState('');
  const [creationMode, setCreationMode] = useState<'existing' | 'generate'>(
    'generate'
  );
  const [selectedBaseAvatarId, setSelectedBaseAvatarId] = useState('');
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('');
  const [advancedConfig, setAdvancedConfig] =
    useState<AdvancedVideoConfig>(DEFAULT_CONFIG);

  const { data: looksData, isLoading: isLooksLoading } = usePhotoAvatarLooks();
  const looks = looksData?.looks ?? [];

  const { data: voicesData, isLoading: isVoicesLoading } = useVoices();
  const voices: HeyGenVoice[] = voicesData?.voices ?? [];
  const { data: avatarsData } = useAvatars();
  const avatars: HeyGenAvatar[] = avatarsData?.avatars ?? [];

  const createLookMutation = useCreatePhotoAvatarLook();
  const refreshLookMutation = useRefreshPhotoAvatarLook();

  const selectedBaseAvatar = useMemo(() => {
    return avatars.find((avatar) => avatar.avatar_id === selectedBaseAvatarId);
  }, [avatars, selectedBaseAvatarId]);

  useEffect(() => {
    if (!selectedVoiceId && voices.length > 0) {
      setSelectedVoiceId(voices[0].voice_id);
    }
  }, [voices, selectedVoiceId]);

  const handleResetForm = () => {
    setLookName('');
    setNotes('');
    setCreationMode('existing');
    setSelectedBaseAvatarId('');
    setSelectedVoiceId('');
    setAdvancedConfig(DEFAULT_CONFIG);
  };

  const handleCreateLook = async () => {
    if (!lookName.trim()) {
      toast.error('Please give your look a name');
      return;
    }
    if (!selectedVoiceId) {
      toast.error('Please choose a default voice (you can change it later)');
      return;
    }
    if (creationMode === 'existing' && !selectedBaseAvatarId) {
      toast.error('Please select a HeyGen avatar to base this look on');
      return;
    }

    const payloadConfig = { ...advancedConfig };

    try {
      const payload: CreateLookPayload = {
        name: lookName.trim(),
        prompt: notes || advancedConfig.clothingPrompt,
        notes,
        voiceId: selectedVoiceId,
        config: payloadConfig
      };

      if (creationMode === 'existing') {
        payload.baseAvatarId = selectedBaseAvatarId;
        if (selectedBaseAvatar?.preview_image_url) {
          payload.baseAvatarPreviewUrl = selectedBaseAvatar.preview_image_url;
        }
      } else {
        payload.lookOptions = {
          orientation: 'front',
          pose: 'neutral',
          style: 'studio'
        };
      }

      const { look: createdLook } =
        await createLookMutation.mutateAsync(payload);

      toast.success(
        `Look "${lookName}" has been submitted. Generation may take a minute.`
      );
      setIsDialogOpen(false);
      handleResetForm();
      if (createdLook && createdLook.status === 'ready') {
        onSelectLook(createdLook);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create look');
    }
  };

  const handleSelectLook = (look: PhotoAvatarLook) => {
    if (look.status !== 'ready' && look.status !== 'completed') {
      toast.info(
        'This look is still generating. Refresh to check the latest status.'
      );
      return;
    }
    if (!look.avatarId) {
      toast.error('Look is missing avatar data from HeyGen. Please refresh.');
      return;
    }
    onSelectLook(look);
  };

  const selectedLook = useMemo(
    () => looks.find((look) => look.id === selectedLookId),
    [looks, selectedLookId]
  );

  const getBackgroundPreview = (look: PhotoAvatarLook) => {
    if (look.coverUrl) {
      return (
        <div className='relative h-24 w-full overflow-hidden rounded-md'>
          <img
            src={look.coverUrl}
            alt={look.name}
            className='h-full w-full object-cover'
          />
        </div>
      );
    }

    if (look.previewUrls && look.previewUrls.length > 0) {
      return (
        <div className='relative h-24 w-full overflow-hidden rounded-md'>
          <img
            src={look.previewUrls[0]}
            alt={look.name}
            className='h-full w-full object-cover'
          />
        </div>
      );
    }

    const bgType = look.config?.backgroundType;
    const bgValue =
      look.config?.backgroundColor || look.config?.backgroundImageUrl;

    if (bgType === 'image' && bgValue) {
      return (
        <div className='relative h-24 w-full overflow-hidden rounded-md'>
          <img
            src={bgValue}
            alt='Background'
            className='h-full w-full object-cover opacity-75'
          />
        </div>
      );
    }

    const color = bgType === 'green_screen' ? '#00FF00' : bgValue || '#f5f5f5';

    return (
      <div
        className='h-24 w-full rounded-md border'
        style={{ backgroundColor: color }}
      />
    );
  };

  const renderLookCard = (look: PhotoAvatarLook) => {
    const status = getStatusBadge(look.status);
    const isSelected = selectedLook?.id === look.id;
    const isReady =
      ['ready', 'completed'].includes(look.status) && !!look.avatarId;

    const cardClasses = cn(
      'flex flex-col rounded-lg border p-3 text-left transition-colors',
      isSelected
        ? 'border-primary bg-primary/5'
        : 'border-border hover:border-primary/50'
    );

    const cardBody = (
      <>
        <div className='flex items-start justify-between gap-2'>
          <div>
            <p className='font-medium'>{look.name}</p>
            {look.notes && (
              <p className='text-muted-foreground line-clamp-2 text-xs'>
                {look.notes}
              </p>
            )}
          </div>
          <Badge variant={status.variant} className='flex items-center gap-1'>
            {status.label}
            {!isReady && <IconLoader2 className='h-3 w-3 animate-spin' />}
          </Badge>
        </div>

        {isSelected && (
          <Badge variant='outline' className='mt-2 w-fit'>
            Selected
          </Badge>
        )}

        <div className='mt-3 space-y-2'>
          {getBackgroundPreview(look)}
          <div className='text-muted-foreground flex justify-between text-xs'>
            <span>
              {look.config?.width}×{look.config?.height}
            </span>
            <span>{look.config?.aspectRatio}</span>
          </div>
        </div>

        {!isReady && look.errorMessage && (
          <div className='text-destructive mt-2 flex items-center gap-1 text-xs'>
            <IconAlertTriangle className='h-3 w-3' />
            {look.errorMessage}
          </div>
        )}

        <div className='text-muted-foreground mt-3 flex items-center justify-between text-xs'>
          <span>Voice: {look.voiceId || 'Not set'}</span>
          <span
            role='button'
            tabIndex={0}
            aria-label='Refresh look status'
            className='hover:bg-muted inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full'
            onClick={(e) => {
              e.stopPropagation();
              refreshLookMutation.mutateAsync(look.id);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                refreshLookMutation.mutateAsync(look.id);
              }
            }}
          >
            <IconRefresh className='h-3 w-3' />
          </span>
        </div>
      </>
    );

    const containerProps = isReady
      ? {
          onClick: () => handleSelectLook(look),
          role: 'button' as const,
          tabIndex: 0 as const,
          onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleSelectLook(look);
            }
          }
        }
      : {
          onClick: () =>
            toast.info(
              'This look is still generating. Refresh to check the latest status.'
            )
        };

    return (
      <div
        key={look.id}
        {...containerProps}
        className={cn(
          cardClasses,
          isReady ? 'cursor-pointer' : 'cursor-pointer opacity-80'
        )}
      >
        {cardBody}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <CardTitle>Looks</CardTitle>
          <CardDescription>
            Generate custom photo avatars with background and framing presets.
          </CardDescription>
        </div>
        <Button
          size='sm'
          onClick={() => setIsDialogOpen(true)}
          className='shrink-0'
        >
          <IconPlus className='mr-2 h-4 w-4' />
          New Look
        </Button>
      </CardHeader>
      <CardContent className='space-y-4'>
        {isLooksLoading ? (
          <div className='text-muted-foreground flex items-center gap-2 text-sm'>
            <IconLoader2 className='h-4 w-4 animate-spin' />
            Loading looks...
          </div>
        ) : looks.length === 0 ? (
          <div className='text-muted-foreground text-sm'>
            No looks yet. Create your first look to get started.
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            {looks.map((look) => renderLookCard(look))}
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Create a Look</DialogTitle>
            <DialogDescription>
              Define visual settings and notes. HeyGen will generate a unique
              photo avatar for you.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-6 py-2'>
            <div className='space-y-2'>
              <Label htmlFor='look-name'>Look Name</Label>
              <Input
                id='look-name'
                placeholder='e.g., Studio Close-up'
                value={lookName}
                onChange={(e) => setLookName(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label>Look Type</Label>
              <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                <button
                  type='button'
                  onClick={() => {
                    setCreationMode('existing');
                  }}
                  className={cn(
                    'rounded-md border p-3 text-left transition-colors',
                    creationMode === 'existing'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <span className='block text-sm font-medium'>
                    Use existing HeyGen avatar
                  </span>
                  <span className='text-muted-foreground text-sm'>
                    Pick an avatar from your HeyGen catalog.
                  </span>
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setCreationMode('generate');
                    setSelectedBaseAvatarId('');
                  }}
                  className={cn(
                    'rounded-md border p-3 text-left transition-colors',
                    creationMode === 'generate'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <span className='block text-sm font-medium'>
                    Generate AI photo avatar
                  </span>
                  <span className='text-muted-foreground text-sm'>
                    Use HeyGen photo avatar pipeline (takes ~1-2 minutes).
                  </span>
                </button>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='look-notes'>
                Notes (optional – describe clothing, tone, background)
              </Label>
              <Textarea
                id='look-notes'
                rows={3}
                placeholder='e.g., Smart casual outfit, warm lighting, friendly tone'
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className='flex flex-wrap gap-2'>
                {NOTE_PROMPTS.map((prompt) => (
                  <Badge
                    key={prompt}
                    variant='outline'
                    className='hover:bg-primary hover:text-primary-foreground cursor-pointer'
                    onClick={() => setNotes(prompt)}
                  >
                    {prompt}
                  </Badge>
                ))}
              </div>
            </div>

            {creationMode === 'existing' && (
              <div className='space-y-3'>
                <Label htmlFor='base-avatar'>Select Avatar</Label>
                <Select
                  value={selectedBaseAvatarId}
                  onValueChange={(val) => setSelectedBaseAvatarId(val)}
                  disabled={avatars.length === 0}
                >
                  <SelectTrigger id='base-avatar'>
                    <SelectValue
                      placeholder={
                        avatars.length === 0
                          ? 'No avatars available'
                          : 'Choose a HeyGen avatar'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className='max-h-72'>
                    {avatars.map((avatar) => (
                      <SelectItem
                        key={avatar.avatar_id}
                        value={avatar.avatar_id}
                      >
                        <div className='flex flex-col'>
                          <span>{avatar.avatar_name || avatar.avatar_id}</span>
                          <span className='text-muted-foreground text-xs'>
                            {avatar.gender || 'Unknown'}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {avatars.length === 0 && (
                  <p className='text-muted-foreground text-xs'>
                    No avatars found in your HeyGen catalog. Try refreshing the
                    catalog or check your HeyGen account.
                  </p>
                )}
                {selectedBaseAvatar?.preview_image_url && (
                  <div className='rounded-md border p-2'>
                    <Label className='text-muted-foreground text-xs'>
                      Preview
                    </Label>
                    <img
                      src={selectedBaseAvatar.preview_image_url}
                      alt={selectedBaseAvatar.avatar_name || 'Avatar preview'}
                      className='mt-2 h-32 w-full rounded-md object-cover'
                    />
                  </div>
                )}
              </div>
            )}

            {creationMode === 'generate' && (
              <div className='text-muted-foreground rounded-md border border-dashed p-3 text-sm'>
                HeyGen will create a brand new photo avatar based on your notes.
                This may take a minute.
              </div>
            )}

            <div className='space-y-3'>
              <Label>Default Voice</Label>
              {isVoicesLoading ? (
                <p className='text-muted-foreground text-sm'>
                  Loading voices...
                </p>
              ) : (
                <Select
                  value={selectedVoiceId}
                  onValueChange={setSelectedVoiceId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Choose a default voice' />
                  </SelectTrigger>
                  <SelectContent className='max-h-72'>
                    {voices.map((voice) => (
                      <SelectItem key={voice.voice_id} value={voice.voice_id}>
                        <div className='flex flex-col'>
                          <span>{voice.name}</span>
                          <span className='text-muted-foreground text-xs'>
                            {voice.language} · {voice.gender}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <p className='text-muted-foreground text-xs'>
                You can override the voice at generation time if needed.
              </p>
            </div>

            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <IconSparkles className='text-muted-foreground h-4 w-4' />
                <span className='text-sm font-medium'>Visual Settings</span>
              </div>
              <AdvancedVideoSettings
                config={advancedConfig}
                onChange={setAdvancedConfig}
              />
            </div>
          </div>
          <DialogFooter className='gap-2'>
            <Button
              variant='outline'
              onClick={() => {
                setIsDialogOpen(false);
                handleResetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateLook}
              disabled={createLookMutation.isPending || isVoicesLoading}
            >
              {createLookMutation.isPending ? (
                <>
                  <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                  Creating...
                </>
              ) : (
                'Create Look'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
