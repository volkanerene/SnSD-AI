'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { IconPhoto, IconSparkles } from '@tabler/icons-react';

export interface AdvancedVideoConfig {
  // Background settings
  backgroundType: 'color' | 'image' | 'green_screen';
  backgroundColor?: string;
  backgroundImageUrl?: string;

  // Clothing prompt
  clothingPrompt?: string;
  avatarStyle: 'circle' | 'closeUp' | 'full' | 'normal' | 'voiceOnly';

  // Voice & Speech settings
  language: string;
  speed: number; // 0.5 to 1.5
  tone?: 'professional' | 'casual' | 'friendly' | 'authoritative';

  // Subtitle settings
  enableSubtitles: boolean;
  subtitleLanguage?: string;

  // Video dimensions
  width: number;
  height: number;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
}

interface AdvancedVideoSettingsProps {
  config: AdvancedVideoConfig;
  onChange: (config: AdvancedVideoConfig) => void;
}

const BACKGROUND_EXAMPLES = [
  {
    name: 'Office',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'
  },
  {
    name: 'Studio',
    url: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=800'
  },
  {
    name: 'Home',
    url: 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800'
  },
  {
    name: 'Nature',
    url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800'
  }
];

const CLOTHING_EXAMPLES = [
  'Business suit with tie',
  'Casual polo shirt',
  'Professional dress shirt',
  'Medical scrubs',
  'Lab coat',
  'Casual t-shirt'
];

const AVATAR_STYLES = [
  { value: 'normal', label: 'Normal (default waist-up)' },
  { value: 'full', label: 'Full body' },
  { value: 'closeUp', label: 'Close-up framing' },
  { value: 'circle', label: 'Circular crop' },
  { value: 'voiceOnly', label: 'Voice only (no avatar)' }
] as const;

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'tr', name: 'Turkish' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' }
];

export function AdvancedVideoSettings({
  config,
  onChange
}: AdvancedVideoSettingsProps) {
  const updateConfig = (updates: Partial<AdvancedVideoConfig>) => {
    onChange({ ...config, ...updates });
  };

  const handleAspectRatioChange = (ratio: '16:9' | '9:16' | '1:1' | '4:5') => {
    const dimensions = {
      '16:9': { width: 1280, height: 720 },
      '9:16': { width: 720, height: 1280 },
      '1:1': { width: 720, height: 720 },
      '4:5': { width: 864, height: 1080 }
    };

    updateConfig({
      aspectRatio: ratio,
      ...dimensions[ratio]
    });
  };

  return (
    <div className='space-y-6'>
      <Tabs defaultValue='background' className='w-full'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='background'>Background</TabsTrigger>
          <TabsTrigger value='clothing'>Clothing</TabsTrigger>
          <TabsTrigger value='voice'>Voice</TabsTrigger>
          <TabsTrigger value='video'>Video</TabsTrigger>
        </TabsList>

        {/* Background Settings */}
        <TabsContent value='background' className='space-y-4'>
          <div className='space-y-2'>
            <Label>Background Type</Label>
            <Select
              value={config.backgroundType}
              onValueChange={(val) =>
                updateConfig({
                  backgroundType: val as 'color' | 'image' | 'green_screen'
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='color'>Solid Color</SelectItem>
                <SelectItem value='image'>Image</SelectItem>
                <SelectItem value='green_screen'>Green Screen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.backgroundType === 'color' && (
            <div className='space-y-2'>
              <Label htmlFor='bg-color'>Background Color</Label>
              <div className='flex gap-2'>
                <Input
                  id='bg-color'
                  type='color'
                  value={config.backgroundColor || '#ffffff'}
                  onChange={(e) =>
                    updateConfig({ backgroundColor: e.target.value })
                  }
                  className='h-10 w-20'
                />
                <Input
                  type='text'
                  value={config.backgroundColor || '#ffffff'}
                  onChange={(e) =>
                    updateConfig({ backgroundColor: e.target.value })
                  }
                  placeholder='#ffffff'
                  className='flex-1'
                />
              </div>
            </div>
          )}

          {config.backgroundType === 'image' && (
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='bg-image'>Background Image URL</Label>
                <Input
                  id='bg-image'
                  type='url'
                  placeholder='https://example.com/image.jpg'
                  value={config.backgroundImageUrl || ''}
                  onChange={(e) =>
                    updateConfig({ backgroundImageUrl: e.target.value })
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label>Example Backgrounds</Label>
                <div className='grid grid-cols-2 gap-2'>
                  {BACKGROUND_EXAMPLES.map((bg) => (
                    <button
                      key={bg.name}
                      onClick={() =>
                        updateConfig({ backgroundImageUrl: bg.url })
                      }
                      className={`group relative aspect-video overflow-hidden rounded-lg border-2 transition-all ${
                        config.backgroundImageUrl === bg.url
                          ? 'border-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <img
                        src={bg.url}
                        alt={bg.name}
                        className='h-full w-full object-cover'
                      />
                      <div className='bg-background/80 absolute right-0 bottom-0 left-0 p-1 text-center text-xs'>
                        {bg.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {config.backgroundType === 'green_screen' && (
            <div className='bg-muted rounded-lg p-4'>
              <div className='flex gap-3'>
                <IconPhoto className='text-muted-foreground h-5 w-5 flex-shrink-0' />
                <div className='space-y-1'>
                  <p className='text-sm font-medium'>Green Screen Mode</p>
                  <p className='text-muted-foreground text-sm'>
                    Video will be generated with a green screen background,
                    allowing you to replace it in post-production.
                  </p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Clothing Settings */}
        <TabsContent value='clothing' className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='clothing-prompt'>Clothing Description</Label>
            <Textarea
              id='clothing-prompt'
              placeholder='Describe what the avatar should wear...'
              value={config.clothingPrompt || ''}
              onChange={(e) => updateConfig({ clothingPrompt: e.target.value })}
              rows={4}
            />
            <p className='text-muted-foreground text-sm'>
              Describe the clothing style for the avatar. This will influence
              how the avatar appears.
            </p>
          </div>

          <div className='space-y-2'>
            <Label>Example Clothing Styles</Label>
            <div className='flex flex-wrap gap-2'>
              {CLOTHING_EXAMPLES.map((example) => (
                <Badge
                  key={example}
                  variant='outline'
                  className='hover:bg-primary hover:text-primary-foreground cursor-pointer'
                  onClick={() => updateConfig({ clothingPrompt: example })}
                >
                  <IconSparkles className='mr-1 h-3 w-3' />
                  {example}
                </Badge>
              ))}
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='avatar-style'>Avatar Framing</Label>
            <Select
              value={config.avatarStyle}
              onValueChange={(val) =>
                updateConfig({
                  avatarStyle: val as
                    | 'circle'
                    | 'closeUp'
                    | 'full'
                    | 'normal'
                    | 'voiceOnly'
                })
              }
            >
              <SelectTrigger id='avatar-style'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVATAR_STYLES.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className='text-muted-foreground text-sm'>
              Choose how the avatar should be framed in the final video.
            </p>
          </div>
        </TabsContent>

        {/* Voice Settings */}
        <TabsContent value='voice' className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='language'>Language</Label>
            <Select
              value={config.language}
              onValueChange={(val) => updateConfig({ language: val })}
            >
              <SelectTrigger id='language'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='speed'>
              Speech Speed: {config.speed.toFixed(1)}x
            </Label>
            <Slider
              id='speed'
              min={0.5}
              max={1.5}
              step={0.1}
              value={[config.speed]}
              onValueChange={(vals) => updateConfig({ speed: vals[0] })}
            />
            <p className='text-muted-foreground text-sm'>
              Adjust how fast the avatar speaks (0.5x = slow, 1.5x = fast)
            </p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='tone'>Tone / Style</Label>
            <Select
              value={config.tone || 'professional'}
              onValueChange={(val) =>
                updateConfig({
                  tone: val as
                    | 'professional'
                    | 'casual'
                    | 'friendly'
                    | 'authoritative'
                })
              }
            >
              <SelectTrigger id='tone'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='professional'>Professional</SelectItem>
                <SelectItem value='casual'>Casual</SelectItem>
                <SelectItem value='friendly'>Friendly</SelectItem>
                <SelectItem value='authoritative'>Authoritative</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        {/* Video Settings */}
        <TabsContent value='video' className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='aspect-ratio'>Aspect Ratio</Label>
            <Select
              value={config.aspectRatio}
              onValueChange={(val) =>
                handleAspectRatioChange(val as '16:9' | '9:16' | '1:1' | '4:5')
              }
            >
              <SelectTrigger id='aspect-ratio'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='16:9'>16:9 (Landscape)</SelectItem>
                <SelectItem value='9:16'>9:16 (Portrait / Stories)</SelectItem>
                <SelectItem value='1:1'>1:1 (Square)</SelectItem>
                <SelectItem value='4:5'>4:5 (Instagram)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className='text-muted-foreground text-xs'>
            HeyGen&apos;s Free API tier is limited to 1280×720 output. Choose a
            higher plan before setting larger resolutions.
          </p>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='width'>Width</Label>
              <Input
                id='width'
                type='number'
                value={config.width}
                onChange={(e) =>
                  updateConfig({ width: parseInt(e.target.value) })
                }
                min={480}
                max={3840}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='height'>Height</Label>
              <Input
                id='height'
                type='number'
                value={config.height}
                onChange={(e) =>
                  updateConfig({ height: parseInt(e.target.value) })
                }
                min={480}
                max={3840}
              />
            </div>
          </div>

          <div className='flex items-center justify-between space-x-2'>
            <div className='space-y-1'>
              <Label htmlFor='subtitles'>Enable Subtitles</Label>
              <p className='text-muted-foreground text-sm'>
                Add subtitles to your video
              </p>
            </div>
            <Switch
              id='subtitles'
              checked={config.enableSubtitles}
              onCheckedChange={(checked) =>
                updateConfig({ enableSubtitles: checked })
              }
            />
          </div>

          {config.enableSubtitles && (
            <div className='space-y-2'>
              <Label htmlFor='subtitle-language'>Subtitle Language</Label>
              <Select
                value={config.subtitleLanguage || config.language}
                onValueChange={(val) => updateConfig({ subtitleLanguage: val })}
              >
                <SelectTrigger id='subtitle-language'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
