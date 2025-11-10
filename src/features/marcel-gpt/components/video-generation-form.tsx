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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGenerateVideo, type HeyGenAvatar } from '@/hooks/useMarcelGPT';
import { VoiceSelector } from './voice-selector';
import { AvatarGroupBrowser } from './avatar-group-browser';
import {
  IconPlayerPlay,
  IconAlertCircle,
  IconInfoCircle
} from '@tabler/icons-react';
import { toast } from 'sonner';

interface VideoGenerationFormProps {
  initialScript?: string;
}

export function VideoGenerationForm({
  initialScript
}: VideoGenerationFormProps = {}) {
  const [inputText] = useState(initialScript || '');
  const [selectedAvatar, setSelectedAvatar] = useState<HeyGenAvatar | null>(
    null
  );
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [filteredGroupId, setFilteredGroupId] = useState<string | undefined>();
  const [filteredAvatarId, setFilteredAvatarId] = useState<
    string | undefined
  >();

  const generateMutation = useGenerateVideo();

  // Always use V2 engine for standard avatars
  const engine = 'v2';
  const avatarId = selectedAvatar?.avatar_id ?? '';

  const handleGroupSelect = (groupId?: string) => {
    setFilteredGroupId(groupId);
    if (!groupId) {
      setFilteredAvatarId(undefined);
    }
  };

  const handleAvatarSelect = (groupId: string, avatar?: HeyGenAvatar) => {
    setFilteredGroupId(groupId || filteredGroupId);
    setFilteredAvatarId(avatar?.avatar_id);
    if (avatar) {
      setSelectedAvatar(avatar);
    }
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

    if (!selectedAvatar) {
      toast.error('Please select an avatar');
      return;
    }

    if (!selectedVoice) {
      toast.error('Please select a voice');
      return;
    }

    try {
      const payload: any = {
        engine,
        input_text: inputText,
        avatar_id: avatarId,
        voice_id: selectedVoice,
        title: selectedAvatar.avatar_name || 'Video'
      };

      const response = await generateMutation.mutateAsync(payload);

      toast.success(
        `Job #${response.job_id} has been created and is now processing.`
      );

      setSelectedAvatar(null);
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
              <Label htmlFor='input-text'>Video Script</Label>
              <Textarea
                id='input-text'
                placeholder='No script provided'
                value={inputText}
                disabled
                readOnly
                rows={6}
                className='bg-muted resize-none'
              />
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>
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
                  Summary of the avatar and voice that will be used for this
                  video.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-3 text-sm'>
                {selectedAvatar ? (
                  <>
                    <div className='space-y-1'>
                      <span className='font-medium'>Avatar</span>
                      <p>{selectedAvatar.avatar_name}</p>
                    </div>

                    <div className='space-y-1'>
                      <span className='font-medium'>Gender</span>
                      <p className='text-muted-foreground'>
                        {selectedAvatar.gender || 'Unknown'}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className='text-muted-foreground flex items-start gap-2'>
                    <IconInfoCircle className='mt-0.5 h-4 w-4 flex-shrink-0' />
                    <p>Select an avatar from the panel on the right.</p>
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
                !selectedAvatar ||
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

        <VoiceSelector
          selectedVoiceId={selectedVoice}
          onSelectVoice={setSelectedVoice}
        />
      </div>
    </div>
  );
}
