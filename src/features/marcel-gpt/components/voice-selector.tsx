'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useVoices } from '@/hooks/useMarcelGPT';
import type { HeyGenVoice } from '@/hooks/useMarcelGPT';
import { IconSearch, IconVolume, IconCheck } from '@tabler/icons-react';
import { List } from 'react-window';
import type { RowComponentProps } from 'react-window';

interface VoiceSelectorProps {
  selectedVoiceId: string;
  onSelectVoice: (voiceId: string) => void;
}

export function VoiceSelector({
  selectedVoiceId,
  onSelectVoice
}: VoiceSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');

  const { data: voicesData, isLoading } = useVoices({
    language: languageFilter !== 'all' ? languageFilter : undefined,
    gender: genderFilter !== 'all' ? genderFilter : undefined
  });
  const voices = voicesData?.voices || [];

  const filteredVoices = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return voices.filter((voice) => {
      return (
        voice.name?.toLowerCase().includes(query) ||
        voice.language?.toLowerCase().includes(query)
      );
    });
  }, [voices, searchQuery]);

  // Extract unique languages and genders for filters
  const uniqueLanguages = useMemo(
    () =>
      Array.from(
        new Set(voices.map((v) => v.language).filter(Boolean))
      ) as string[],
    [voices]
  );
  const uniqueGenders = useMemo(
    () =>
      Array.from(
        new Set(voices.map((v) => v.gender).filter(Boolean))
      ) as string[],
    [voices]
  );

  interface VoiceRowData {
    filteredVoices: HeyGenVoice[];
    onSelectVoice: (voiceId: string) => void;
    selectedVoiceId: string;
  }

  const rowProps = useMemo(
    (): VoiceRowData => ({
      filteredVoices,
      onSelectVoice,
      selectedVoiceId
    }),
    [filteredVoices, onSelectVoice, selectedVoiceId]
  );

  // Voice Row component for virtualized list
  const VoiceRow = useCallback(
    ({
      ariaAttributes,
      index,
      style,
      filteredVoices,
      onSelectVoice,
      selectedVoiceId
    }: RowComponentProps<VoiceRowData>) => {
      const voice = filteredVoices[index];
      if (!voice) {
        return <div style={style} className='px-2 py-1' {...ariaAttributes} />;
      }

      const isSelected = selectedVoiceId === voice.voice_id;

      return (
        <div style={style} className='px-2 py-1' {...ariaAttributes}>
          <div
            onClick={() => onSelectVoice(voice.voice_id)}
            className={`w-full cursor-pointer rounded-lg border-2 p-3 text-left transition-all ${
              isSelected
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
          >
            <div className='flex items-start justify-between gap-2'>
              <div className='flex-1 space-y-1'>
                <div className='flex items-center gap-2'>
                  <p className='font-medium'>{voice.name || 'Unknown Voice'}</p>
                  {isSelected && <IconCheck className='text-primary h-4 w-4' />}
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
                  {voice.age_range && (
                    <Badge variant='outline' className='text-xs'>
                      {voice.age_range}
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
          </div>
        </div>
      );
    },
    []
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
              <SelectItem value='all'>All Languages</SelectItem>
              {uniqueLanguages.map((lang) => (
                <SelectItem key={lang} value={lang}>
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
              <SelectItem value='all'>All Genders</SelectItem>
              {uniqueGenders.map((gender) => (
                <SelectItem key={gender} value={gender}>
                  {gender}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Voice List with Virtualization */}
        <div className='h-[400px]'>
          {isLoading ? (
            <div className='text-muted-foreground flex h-full items-center justify-center'>
              Loading voices...
            </div>
          ) : filteredVoices.length === 0 ? (
            <div className='text-muted-foreground flex h-full items-center justify-center'>
              No voices found
            </div>
          ) : (
            <List
              className='scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border'
              defaultHeight={400}
              rowComponent={VoiceRow}
              rowProps={rowProps}
              rowCount={filteredVoices.length}
              rowHeight={110}
              style={{ width: '100%' }}
            />
          )}
        </div>

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
