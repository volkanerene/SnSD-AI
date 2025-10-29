'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAvatars } from '@/hooks/useMarcelGPT';
import type { HeyGenAvatar } from '@/hooks/useMarcelGPT';
import { IconSearch, IconRefresh, IconCheck } from '@tabler/icons-react';
import Image from 'next/image';
import { Grid } from 'react-window';
import type { CellComponentProps } from 'react-window';

interface AvatarSelectorProps {
  selectedAvatarId: string;
  onSelectAvatar: (avatarId: string) => void;
}

export function AvatarSelector({
  selectedAvatarId,
  onSelectAvatar
}: AvatarSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [forceRefresh, setForceRefresh] = useState(false);

  const { data: avatarsData, isLoading, refetch } = useAvatars(forceRefresh);
  const avatars = avatarsData?.avatars || [];

  const handleRefresh = () => {
    setForceRefresh(true);
    refetch().finally(() => setForceRefresh(false));
  };

  const filteredAvatars = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return avatars.filter((avatar) => {
      return (
        avatar.avatar_name?.toLowerCase().includes(query) ||
        avatar.gender?.toLowerCase().includes(query)
      );
    });
  }, [avatars, searchQuery]);

  // Grid configuration for virtualization
  const columnCount = 2;
  const columnWidth = 200;
  const rowHeight = 280;
  const rowCount = Math.ceil(filteredAvatars.length / columnCount);

  interface AvatarCellData {
    filteredAvatars: HeyGenAvatar[];
    columnCount: number;
    selectedAvatarId: string;
    onSelectAvatar: (avatarId: string) => void;
  }

  const cellProps = useMemo(
    (): AvatarCellData => ({
      filteredAvatars,
      columnCount,
      selectedAvatarId,
      onSelectAvatar
    }),
    [filteredAvatars, columnCount, selectedAvatarId, onSelectAvatar]
  );

  // Avatar Cell component for virtualized grid
  const AvatarCell = useCallback(
    ({
      ariaAttributes,
      columnIndex,
      rowIndex,
      style,
      filteredAvatars,
      columnCount,
      selectedAvatarId,
      onSelectAvatar
    }: CellComponentProps<AvatarCellData>) => {
      const index = rowIndex * columnCount + columnIndex;
      if (index >= filteredAvatars.length) {
        return <div style={style} className='p-1.5' {...ariaAttributes} />;
      }

      const avatar = filteredAvatars[index];
      const isSelected = selectedAvatarId === avatar.avatar_id;

      return (
        <div style={style} className='p-1.5' {...ariaAttributes}>
          <button
            onClick={() => onSelectAvatar(avatar.avatar_id)}
            className={`group relative h-full w-full overflow-hidden rounded-lg border-2 transition-all ${
              isSelected
                ? 'border-primary shadow-md'
                : 'border-border hover:border-primary/50'
            }`}
          >
            {/* Avatar Preview Image */}
            <div className='bg-muted relative aspect-[3/4] w-full overflow-hidden'>
              {avatar.preview_image_url ? (
                <Image
                  src={avatar.preview_image_url}
                  alt={avatar.avatar_name || 'Avatar'}
                  fill
                  className='object-cover'
                  sizes='200px'
                  loading='lazy'
                />
              ) : (
                <div className='text-muted-foreground flex h-full items-center justify-center'>
                  No preview
                </div>
              )}

              {/* Selected Overlay */}
              {isSelected && (
                <div className='bg-primary/20 absolute inset-0 flex items-center justify-center'>
                  <div className='bg-primary rounded-full p-2'>
                    <IconCheck className='text-primary-foreground h-6 w-6' />
                  </div>
                </div>
              )}
            </div>

            {/* Avatar Info */}
            <div className='space-y-1 p-2'>
              <p className='truncate text-sm font-medium'>
                {avatar.avatar_name || 'Unknown Avatar'}
              </p>
              <div className='flex flex-wrap gap-1'>
                {avatar.gender && (
                  <Badge variant='secondary' className='text-xs'>
                    {avatar.gender}
                  </Badge>
                )}
              </div>
            </div>
          </button>
        </div>
      );
    },
    []
  );

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>Select Avatar</CardTitle>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <IconRefresh
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Search */}
        <div className='relative'>
          <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
          <Input
            placeholder='Search avatars...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-9'
          />
        </div>

        {/* Avatar Grid with Virtualization */}
        <div className='h-[400px]'>
          {isLoading ? (
            <div className='text-muted-foreground flex h-full items-center justify-center'>
              Loading avatars...
            </div>
          ) : filteredAvatars.length === 0 ? (
            <div className='text-muted-foreground flex h-full items-center justify-center'>
              No avatars found
            </div>
          ) : (
            <Grid
              cellComponent={AvatarCell}
              cellProps={cellProps}
              columnCount={columnCount}
              columnWidth={columnWidth}
              rowCount={rowCount}
              rowHeight={rowHeight}
              defaultHeight={400}
              defaultWidth={420}
              className='scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border'
            />
          )}
        </div>

        {/* Selection Info */}
        {selectedAvatarId && (
          <div className='bg-muted rounded-md p-3 text-sm'>
            <p className='font-medium'>Selected:</p>
            <p className='text-muted-foreground'>
              {avatars.find((a) => a.avatar_id === selectedAvatarId)
                ?.avatar_name || selectedAvatarId}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
