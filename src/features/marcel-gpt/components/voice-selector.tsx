'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useVoices } from '@/hooks/useMarcelGPT';
import { IconSearch, IconVolume, IconCheck } from '@tabler/icons-react';

interface VoiceSelectorProps {
  selectedVoiceId: string;
  onSelectVoice: (voiceId: string) => void;
}

export function VoiceSelector({
  selectedVoiceId,
  onSelectVoice
}: VoiceSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<string>('');

  const { data: voicesData, isLoading } = useVoices({
    language: languageFilter || undefined,
    gender: genderFilter || undefined
  });
  const voices = voicesData?.voices || [];

  const filteredVoices = voices.filter((voice) => {
    const query = searchQuery.toLowerCase();
    return (
      voice.name?.toLowerCase().includes(query) ||
      voice.language?.toLowerCase().includes(query)
    );
  });

  // Extract unique languages and genders for filters
  const uniqueLanguages = Array.from(
    new Set(voices.map((v) => v.language).filter(Boolean))
  );
  const uniqueGenders = Array.from(
    new Set(voices.map((v) => v.gender).filter(Boolean))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Voice</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Search */}
        <div className='relative'>
          <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
          <Input
            placeholder='Search voices...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-9'
          />
        </div>

        {/* Filters */}
        <div className='grid grid-cols-2 gap-2'>
          <Select value={languageFilter} onValueChange={setLanguageFilter}>
            <SelectTrigger>
              <SelectValue placeholder='All Languages' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=''>All Languages</SelectItem>
              {uniqueLanguages.map((lang) => (
                <SelectItem key={lang} value={lang || ''}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger>
              <SelectValue placeholder='All Genders' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=''>All Genders</SelectItem>
              {uniqueGenders.map((gender) => (
                <SelectItem key={gender} value={gender || ''}>
                  {gender}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Voice List */}
        <ScrollArea className='h-[400px] pr-4'>
          {isLoading ? (
            <div className='text-muted-foreground flex items-center justify-center py-8'>
              Loading voices...
            </div>
          ) : filteredVoices.length === 0 ? (
            <div className='text-muted-foreground flex items-center justify-center py-8'>
              No voices found
            </div>
          ) : (
            <div className='space-y-2'>
              {filteredVoices.map((voice) => {
                const isSelected = selectedVoiceId === voice.voice_id;
                return (
                  <button
                    key={voice.voice_id}
                    onClick={() => onSelectVoice(voice.voice_id)}
                    className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex-1 space-y-1'>
                        <div className='flex items-center gap-2'>
                          <p className='font-medium'>
                            {voice.name || 'Unknown Voice'}
                          </p>
                          {isSelected && (
                            <IconCheck className='text-primary h-4 w-4' />
                          )}
                        </div>
                        <div className='flex flex-wrap gap-1'>
                          {voice.language && (
                            <Badge variant='outline' className='text-xs'>
                              {voice.language}
                            </Badge>
                          )}
                          {voice.gender && (
                            <Badge variant='outline' className='text-xs'>
                              {voice.gender}
                            </Badge>
                          )}
                          {voice.age && (
                            <Badge variant='outline' className='text-xs'>
                              {voice.age}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Preview button (future enhancement) */}
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-8 w-8 p-0'
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement voice preview
                        }}
                      >
                        <IconVolume className='h-4 w-4' />
                      </Button>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Selection Info */}
        {selectedVoiceId && (
          <div className='bg-muted rounded-md p-3 text-sm'>
            <p className='font-medium'>Selected:</p>
            <p className='text-muted-foreground'>
              {voices.find((v) => v.voice_id === selectedVoiceId)?.name ||
                selectedVoiceId}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
