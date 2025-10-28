'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAvatars } from '@/hooks/useMarcelGPT';
import { IconSearch, IconRefresh, IconCheck } from '@tabler/icons-react';
import Image from 'next/image';

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

  const filteredAvatars = avatars.filter((avatar) => {
    const query = searchQuery.toLowerCase();
    return (
      avatar.avatar_name?.toLowerCase().includes(query) ||
      avatar.gender?.toLowerCase().includes(query)
    );
  });

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

        {/* Avatar Grid */}
        <ScrollArea className='h-[400px] pr-4'>
          {isLoading ? (
            <div className='text-muted-foreground flex items-center justify-center py-8'>
              Loading avatars...
            </div>
          ) : filteredAvatars.length === 0 ? (
            <div className='text-muted-foreground flex items-center justify-center py-8'>
              No avatars found
            </div>
          ) : (
            <div className='grid grid-cols-2 gap-3'>
              {filteredAvatars.map((avatar) => {
                const isSelected = selectedAvatarId === avatar.avatar_id;
                return (
                  <button
                    key={avatar.avatar_id}
                    onClick={() => onSelectAvatar(avatar.avatar_id)}
                    className={`group relative overflow-hidden rounded-lg border-2 transition-all ${
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
                          sizes='(max-width: 768px) 50vw, 200px'
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
                );
              })}
            </div>
          )}
        </ScrollArea>

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
