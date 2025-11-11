'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  useGeneratePhotoAvatarLook,
  usePhotoAvatarGenerationStatus,
  type HeyGenAvatar,
  type GeneratePhotoAvatarLookResponse
} from '@/hooks/useMarcelGPT';
import {
  IconWand,
  IconAlertCircle,
  IconCheck,
  IconLoader
} from '@tabler/icons-react';
import { toast } from 'sonner';

interface PhotoAvatarGeneratorProps {
  avatar: HeyGenAvatar;
  groupId: string;
  onGenerationSuccess?: (response: GeneratePhotoAvatarLookResponse) => void;
  onImageKeySelect?: (imageKey: string) => void;
}

const STYLE_OPTIONS = [
  'Realistic',
  'Pixar',
  'Cinematic',
  'Vintage',
  'Noir',
  'Cyberpunk',
  'Unspecified'
] as const;

const ORIENTATION_OPTIONS = ['square', 'horizontal', 'vertical'] as const;

const POSE_OPTIONS = ['half_body', 'close_up', 'full_body'] as const;

// Helper function to determine if avatar can generate photo looks
// Photo avatar generation only works with transparent background avatars
function canGeneratePhotoLooks(avatar: HeyGenAvatar): boolean {
  // If explicitly marked as transparent, allow generation
  if (avatar.has_transparent_background === true) {
    return true;
  }

  // If explicitly marked as NOT transparent (false), disallow
  if (avatar.has_transparent_background === false) {
    return false;
  }

  // If background_type is specified, check it
  if (avatar.background_type) {
    const transparentTypes = ['transparent', 'none', 'green_screen'];
    return transparentTypes.includes(avatar.background_type.toLowerCase());
  }

  // Default to true (allow generation) if unknown
  return true;
}

export function PhotoAvatarGenerator({
  avatar,
  groupId,
  onGenerationSuccess,
  onImageKeySelect
}: PhotoAvatarGeneratorProps) {
  const canGenerate = canGeneratePhotoLooks(avatar);
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] =
    useState<(typeof STYLE_OPTIONS)[number]>('Realistic');
  const [orientation, setOrientation] =
    useState<(typeof ORIENTATION_OPTIONS)[number]>('square');
  const [pose, setPose] = useState<(typeof POSE_OPTIONS)[number]>('half_body');
  const [showResults, setShowResults] = useState(false);
  const [generatedImageKeys, setGeneratedImageKeys] = useState<string[]>([]);
  const [selectedImageKey, setSelectedImageKey] = useState<
    string | undefined
  >();
  const [generationId, setGenerationId] = useState<string | undefined>();
  const [isPolling, setIsPolling] = useState(false);

  const generateMutation = useGeneratePhotoAvatarLook();

  // Poll for generation status when we have a generation_id
  const { data: generationStatus, isFetching: isCheckingStatus } =
    usePhotoAvatarGenerationStatus(generationId, isPolling && !!generationId);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description for the look');
      return;
    }

    if (!avatar.preview_image_url) {
      toast.error('Avatar preview image URL is required');
      return;
    }

    try {
      const response = await generateMutation.mutateAsync({
        image_url: avatar.preview_image_url,
        group_id: groupId,
        prompt: prompt.trim(),
        style,
        orientation,
        pose
      });

      const imageKeys = response.image_keys || [];
      setGeneratedImageKeys(imageKeys);
      setShowResults(true);

      // Store generation_id and start polling if we got one
      if (response.generation_id) {
        setGenerationId(response.generation_id);
        setIsPolling(true);
        console.log(
          '[PhotoAvatarGenerator] Started polling for generation:',
          response.generation_id
        );
      }

      if (imageKeys.length === 0) {
        toast.warning(
          'Generation started. Processing your photo avatar looks...'
        );
      } else {
        toast.success(`Generated ${imageKeys.length} new photo avatar looks!`);
      }

      console.log('[PhotoAvatarGenerator] Generation response:', response);
      onGenerationSuccess?.(response);
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate photo avatar looks');
      setIsPolling(false);
    }
  };

  const handleSelectImage = (imageKey: string) => {
    setSelectedImageKey(imageKey);
    onImageKeySelect?.(imageKey);
  };

  // Handle polling updates
  useEffect(() => {
    if (generationStatus && isPolling) {
      console.log('[PhotoAvatarGenerator] Polling status:', generationStatus);

      const imageKeys = generationStatus.image_keys || [];

      // Update image keys if new ones arrived
      if (imageKeys.length > 0 && generatedImageKeys.length === 0) {
        setGeneratedImageKeys(imageKeys);
        toast.success(`Generated ${imageKeys.length} new photo avatar looks!`);
        console.log('[PhotoAvatarGenerator] Images loaded:', imageKeys);
      }

      // Stop polling once generation completes
      if (generationStatus.status !== 'processing') {
        setIsPolling(false);
        console.log(
          '[PhotoAvatarGenerator] Generation complete with status:',
          generationStatus.status
        );
      }
    }
  }, [generationStatus, isPolling, generatedImageKeys.length]);

  const handleReset = () => {
    setPrompt('');
    setStyle('Realistic');
    setOrientation('square');
    setPose('half_body');
    setShowResults(false);
    setGeneratedImageKeys([]);
    setSelectedImageKey(undefined);
    setGenerationId(undefined);
    setIsPolling(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (!selectedImageKey) {
      handleReset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='gap-2'
          disabled={!canGenerate}
          title={
            !canGenerate
              ? 'Photo look generation only works with transparent background avatars'
              : 'Generate new photo avatar looks using AI'
          }
        >
          <IconWand className='h-4 w-4' />
          Generate Looks
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Generate Photo Avatar Looks</DialogTitle>
          <DialogDescription>
            Create new visual variations of {avatar.avatar_name} using AI
          </DialogDescription>
        </DialogHeader>

        {!showResults ? (
          <div className='space-y-6 py-4'>
            <Alert>
              <IconAlertCircle className='h-4 w-4' />
              <AlertDescription>
                This will generate 4 new photo avatar look variations based on
                your description and styling preferences.
              </AlertDescription>
            </Alert>

            <div className='space-y-2'>
              <Label htmlFor='prompt'>Look Description</Label>
              <Textarea
                id='prompt'
                placeholder='Describe the look you want to generate (e.g., "professional business attire with glasses")'
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className='resize-none'
              />
              <p className='text-muted-foreground text-xs'>
                Be specific about clothing, accessories, pose, and setting
              </p>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='style'>Style</Label>
                <Select value={style} onValueChange={(v: any) => setStyle(v)}>
                  <SelectTrigger id='style'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLE_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='orientation'>Orientation</Label>
                <Select
                  value={orientation}
                  onValueChange={(v: any) => setOrientation(v)}
                >
                  <SelectTrigger id='orientation'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORIENTATION_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o.charAt(0).toUpperCase() + o.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='pose'>Pose</Label>
                <Select value={pose} onValueChange={(v: any) => setPose(v)}>
                  <SelectTrigger id='pose'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POSE_OPTIONS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p === 'half_body'
                          ? 'Half Body'
                          : p === 'close_up'
                            ? 'Close Up'
                            : 'Full Body'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='flex gap-2 pt-4'>
              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending || !prompt.trim()}
                className='flex-1'
              >
                {generateMutation.isPending ? (
                  <>
                    <IconLoader className='mr-2 h-4 w-4 animate-spin' />
                    Generating...
                  </>
                ) : (
                  <>
                    <IconWand className='mr-2 h-4 w-4' />
                    Generate Looks
                  </>
                )}
              </Button>
              <Button variant='outline' onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className='space-y-4 py-4'>
            {isPolling && generatedImageKeys.length === 0 ? (
              // Loading state while polling for images
              <div className='flex flex-col items-center gap-4 py-8'>
                <div className='flex w-full items-center gap-2 rounded-lg bg-blue-50 p-3'>
                  <IconLoader className='h-5 w-5 animate-spin text-blue-600' />
                  <div>
                    <p className='font-medium text-blue-900'>
                      Generating photo avatar looks...
                    </p>
                    <p className='text-sm text-blue-800'>
                      This may take up to 60 seconds
                    </p>
                  </div>
                </div>

                <div>
                  <Label className='mb-3 block'>Processing (4 looks)</Label>
                  <div className='grid grid-cols-2 gap-3'>
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className='aspect-square rounded-lg' />
                    ))}
                  </div>
                </div>

                <Alert>
                  <IconAlertCircle className='h-4 w-4' />
                  <AlertDescription>
                    Images will appear here as they are generated. You can close
                    this dialog and come back later.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              // Results view with images
              <>
                <div className='flex items-center gap-2 rounded-lg bg-green-50 p-3'>
                  <IconCheck className='h-5 w-5 text-green-600' />
                  <div>
                    <p className='font-medium text-green-900'>
                      Generation Complete!
                    </p>
                    <p className='text-sm text-green-800'>
                      {generatedImageKeys.length} new photo avatar looks have
                      been created
                    </p>
                  </div>
                </div>

                <div>
                  <Label className='mb-3 block'>
                    Generated Images {selectedImageKey && '✓ Selected'}
                  </Label>
                  <div className='grid grid-cols-2 gap-3'>
                    {generatedImageKeys.length > 0 ? (
                      generatedImageKeys.map((imageKey, idx) => {
                        const isSelected = selectedImageKey === imageKey;
                        return (
                          <button
                            key={idx}
                            type='button'
                            onClick={() => handleSelectImage(imageKey)}
                            className={`group relative overflow-hidden rounded-lg border-2 transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <img
                              src={`https://resource2.heygen.ai/${imageKey}`}
                              alt={`Generated look ${idx + 1}`}
                              className='aspect-square object-cover'
                            />
                            <Badge className='bg-primary absolute top-2 right-2'>
                              {idx + 1}
                            </Badge>
                            {isSelected && (
                              <div className='absolute inset-0 flex items-center justify-center bg-black/20'>
                                <IconCheck className='h-8 w-8 text-white' />
                              </div>
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <>
                        {[1, 2, 3, 4].map((i) => (
                          <Skeleton
                            key={i}
                            className='aspect-square rounded-lg'
                          />
                        ))}
                      </>
                    )}
                  </div>
                </div>

                <Alert>
                  <IconAlertCircle className='h-4 w-4' />
                  <AlertDescription>
                    {selectedImageKey
                      ? 'Image selected! Close this dialog to use it in video generation.'
                      : 'Click an image to select it, then close to use it for video generation.'}
                  </AlertDescription>
                </Alert>

                <div className='flex gap-2 pt-4'>
                  <Button
                    onClick={handleClose}
                    className='flex-1'
                    disabled={!selectedImageKey}
                  >
                    Use Selected Look
                  </Button>
                  <Button variant='outline' onClick={handleReset}>
                    Generate More
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
