'use client';

import { useState } from 'react';
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
import { useGenerateVideo, usePresets } from '@/hooks/useMarcelGPT';
import { AvatarSelector } from './avatar-selector';
import { VoiceSelector } from './voice-selector';
import {
  IconPlayerPlay,
  IconAlertCircle,
  IconCheck
} from '@tabler/icons-react';
import { toast } from 'sonner';

export function VideoGenerationForm() {
  const [inputText, setInputText] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [engine, setEngine] = useState<'v2' | 'av4'>('v2');

  const { data: presetsData } = usePresets();
  const presets = presetsData?.presets || [];

  const generateMutation = useGenerateVideo();

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = presets.find((p) => p.id.toString() === presetId);
    if (preset) {
      setSelectedAvatar(preset.avatar_id);
      setSelectedVoice(preset.voice_id);
      setEngine(preset.engine as 'v2' | 'av4');
    }
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
      const result = await generateMutation.mutateAsync({
        engine,
        input_text: inputText,
        avatar_id: selectedAvatar,
        voice_id: selectedVoice
      });

      toast.success(
        `Job #${result.job_id} has been created and is now processing.`
      );

      // Reset form
      setInputText('');
      setSelectedAvatar('');
      setSelectedVoice('');
      setSelectedPreset('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to start video generation');
    }
  };

  const charCount = inputText.length;
  const maxChars = 1500;
  const isOverLimit = charCount > maxChars;

  return (
    <div className='grid gap-6 lg:grid-cols-2'>
      {/* Left Column: Input & Settings */}
      <div className='space-y-4'>
        <Card>
          <CardHeader>
            <CardTitle>Video Configuration</CardTitle>
            <CardDescription>
              Configure your video settings and input text
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* Preset Selector */}
            <div className='space-y-2'>
              <Label htmlFor='preset'>Load from Preset (Optional)</Label>
              <Select value={selectedPreset} onValueChange={handlePresetChange}>
                <SelectTrigger id='preset'>
                  <SelectValue placeholder='Choose a preset...' />
                </SelectTrigger>
                <SelectContent>
                  {presets.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id.toString()}>
                      {preset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Engine Selection */}
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

            {/* Text Input */}
            <div className='space-y-2'>
              <Label htmlFor='input-text'>Video Script</Label>
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

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={
                generateMutation.isPending || isOverLimit || !inputText.trim()
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

      {/* Right Column: Avatar & Voice Selection */}
      <div className='space-y-4'>
        <AvatarSelector
          selectedAvatarId={selectedAvatar}
          onSelectAvatar={setSelectedAvatar}
        />

        <VoiceSelector
          selectedVoiceId={selectedVoice}
          onSelectVoice={setSelectedVoice}
        />
      </div>
    </div>
  );
}
