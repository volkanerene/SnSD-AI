'use client';

import { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { useGenerateVideo, type PhotoAvatarLook } from '@/hooks/useMarcelGPT';
import { VoiceSelector } from './voice-selector';
import { ScriptGenerator } from './script-generator';
import { AvatarGroupBrowser } from './avatar-group-browser';
import {
  IconPlayerPlay,
  IconAlertCircle,
  IconInfoCircle
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { LookSelector } from './look-selector';

interface VideoGenerationFormProps {
  initialScript?: string;
}

export function VideoGenerationForm({
  initialScript
}: VideoGenerationFormProps = {}) {
  const [inputText, setInputText] = useState(initialScript || '');
  const [selectedLook, setSelectedLook] = useState<PhotoAvatarLook | null>(
    null
  );
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [engine, setEngine] = useState<'v2' | 'av4'>('v2');
  const [filteredGroupId, setFilteredGroupId] = useState<string | undefined>();
  const [filteredAvatarId, setFilteredAvatarId] = useState<
    string | undefined
  >();

  const generateMutation = useGenerateVideo();

  const selectedAvatar = selectedLook?.avatarId ?? '';

  const lookResolution = useMemo(() => {
    if (!selectedLook?.config?.width || !selectedLook?.config?.height)
      return null;
    return `${selectedLook.config.width} × ${selectedLook.config.height}`;
  }, [selectedLook]);

  const lookBackground = useMemo(() => {
    if (!selectedLook) return null;
    if (
      selectedLook.config?.backgroundType === 'image' &&
      selectedLook.config?.backgroundImageUrl
    ) {
      return `Image • ${selectedLook.config.backgroundImageUrl}`;
    }
    if (selectedLook.config?.backgroundType === 'green_screen') {
      return 'Green Screen';
    }
    if (selectedLook.config?.backgroundType === 'color') {
      return `Solid Color ${selectedLook.config.backgroundColor ?? '#ffffff'}`;
    }
    return null;
  }, [selectedLook]);

  const handleLookSelect = (look: PhotoAvatarLook) => {
    setSelectedLook(look);
    if (look.voiceId) {
      setSelectedVoice(look.voiceId);
    }
  };

  const handleGroupSelect = (groupId?: string) => {
    setFilteredGroupId(groupId);
    if (!groupId) {
      setFilteredAvatarId(undefined);
    }
  };

  const handleAvatarSelect = (groupId: string, avatarId?: string) => {
    setFilteredGroupId(groupId || filteredGroupId);
    setFilteredAvatarId(avatarId);
  };

  const handleClearFilters = () => {
    setFilteredGroupId(undefined);
    setFilteredAvatarId(undefined);
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter text for the video');
      return;
    }

    if (!selectedLook) {
      toast.error('Please choose or create a look first');
      return;
    }

    if (!selectedAvatar) {
      toast.error('Please select an avatar');
      return;
    }

    if (!selectedVoice) {
      toast.error('Please select a voice');
      return;
    }

    try {
      const lookConfig = selectedLook.config || {};
      const config: any = {
        speed: lookConfig.speed ?? 1,
        language: lookConfig.language ?? 'en',
        width: lookConfig.width ?? 1280,
        height: lookConfig.height ?? 720,
        avatar_style: lookConfig.avatarStyle ?? 'normal'
      };

      if (lookConfig.backgroundType === 'color') {
        config.background = {
          type: 'color',
          value: lookConfig.backgroundColor ?? '#ffffff'
        };
      } else if (
        lookConfig.backgroundType === 'image' &&
        lookConfig.backgroundImageUrl
      ) {
        config.background = {
          type: 'image',
          url: lookConfig.backgroundImageUrl
        };
      } else if (lookConfig.backgroundType === 'green_screen') {
        config.background = {
          type: 'color',
          value: '#00FF00'
        };
      }

      if (lookConfig.enableSubtitles) {
        config.enable_subtitles = true;
        config.subtitle_language =
          lookConfig.subtitleLanguage || lookConfig.language || 'en';
      }

      const presetId =
        selectedLook.presetId ?? selectedLook.meta?.brand_preset_id;

      const response = await generateMutation.mutateAsync({
        engine,
        input_text: inputText,
        avatar_id: selectedAvatar,
        voice_id: selectedVoice,
        preset_id: presetId,
        config
      });

      toast.success(
        `Job #${response.job_id} has been created and is now processing.`
      );

      setInputText('');
      setSelectedLook(null);
      setSelectedVoice('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to start video generation');
    }
  };

  const charCount = inputText.length;
  const maxChars = 1500;
  const isOverLimit = charCount > maxChars;

  return (
    <div className='grid gap-6 lg:grid-cols-2'>
      <div className='space-y-4'>
        <Card>
          <CardHeader>
            <CardTitle>Video Configuration</CardTitle>
            <CardDescription>
              Configure your video settings and input text
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='engine'>Video Engine</Label>
              <Select
                value={engine}
                onValueChange={(val) => setEngine(val as 'v2' | 'av4')}
              >
                <SelectTrigger id='engine'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='v2'>V2 (Standard)</SelectItem>
                  <SelectItem value='av4'>AV4 (Photorealistic)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='input-text'>Video Script</Label>
                <ScriptGenerator value={inputText} onChange={setInputText} />
              </div>
              <Textarea
                id='input-text'
                placeholder='Enter the text you want the avatar to speak...'
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={8}
                className={isOverLimit ? 'border-red-500' : ''}
              />
              <div className='flex justify-between text-sm'>
                <span
                  className={
                    isOverLimit ? 'text-red-500' : 'text-muted-foreground'
                  }
                >
                  {charCount} / {maxChars} characters
                </span>
              </div>
            </div>

            {isOverLimit && (
              <Alert variant='destructive'>
                <IconAlertCircle className='h-4 w-4' />
                <AlertDescription>
                  Text exceeds maximum length of {maxChars} characters
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Review Selection</CardTitle>
                <CardDescription>
                  Summary of the look and voice that will be used for this
                  video.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-3 text-sm'>
                {selectedLook ? (
                  <>
                    <div className='space-y-1'>
                      <span className='font-medium'>Look</span>
                      <p>{selectedLook.name}</p>
                      {selectedLook.notes && (
                        <p className='text-muted-foreground text-xs'>
                          {selectedLook.notes}
                        </p>
                      )}
                    </div>

                    {selectedLook.source && (
                      <div className='space-y-1'>
                        <span className='font-medium'>Source</span>
                        <p className='text-muted-foreground'>
                          {selectedLook.source === 'existing_avatar'
                            ? 'Existing HeyGen avatar'
                            : 'Generated photo avatar'}
                        </p>
                      </div>
                    )}

                    <div className='space-y-1'>
                      <span className='font-medium'>Resolution</span>
                      <p className='text-muted-foreground'>
                        {lookResolution ?? 'Default (1280×720)'}
                      </p>
                    </div>

                    {lookBackground && (
                      <div className='space-y-1'>
                        <span className='font-medium'>Background</span>
                        <p className='text-muted-foreground'>
                          {lookBackground}
                        </p>
                      </div>
                    )}

                    <div className='space-y-1'>
                      <span className='font-medium'>Avatar Style</span>
                      <p className='text-muted-foreground'>
                        {selectedLook.config?.avatarStyle ?? 'normal'}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className='text-muted-foreground flex items-start gap-2'>
                    <IconInfoCircle className='mt-0.5 h-4 w-4 flex-shrink-0' />
                    <p>Select or create a look to see its details here.</p>
                  </div>
                )}

                <div className='space-y-1'>
                  <span className='font-medium'>Voice</span>
                  <p className='text-muted-foreground'>
                    {selectedVoice
                      ? `Voice ID: ${selectedVoice}`
                      : 'Select a voice in the panel on the right.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleGenerate}
              disabled={
                generateMutation.isPending ||
                isOverLimit ||
                !inputText.trim() ||
                !selectedLook ||
                !selectedVoice
              }
              className='w-full'
              size='lg'
            >
              {generateMutation.isPending ? (
                <>Generating...</>
              ) : (
                <>
                  <IconPlayerPlay className='mr-2 h-4 w-4' />
                  Generate Video
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className='space-y-4'>
        <AvatarGroupBrowser
          selectedGroupId={filteredGroupId}
          selectedAvatarId={filteredAvatarId}
          onSelectGroup={handleGroupSelect}
          onSelectAvatar={handleAvatarSelect}
          onClearFilters={handleClearFilters}
        />

        <LookSelector
          selectedLookId={selectedLook?.id}
          activeVoiceId={selectedVoice}
          filterGroupId={filteredGroupId}
          filterAvatarId={filteredAvatarId}
          onClearFilter={handleClearFilters}
          onSelectLook={handleLookSelect}
        />

        <VoiceSelector
          selectedVoiceId={selectedVoice}
          onSelectVoice={setSelectedVoice}
        />
      </div>
    </div>
  );
}
