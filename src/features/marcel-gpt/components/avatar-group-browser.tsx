'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  type HeyGenAvatarGroup,
  type HeyGenAvatar,
  useAvatarGroups
} from '@/hooks/useMarcelGPT';
import { IconUserCircle } from '@tabler/icons-react';

interface AvatarGroupBrowserProps {
  selectedGroupId?: string;
  selectedAvatarId?: string;
  onSelectGroup: (groupId?: string) => void;
  onSelectAvatar: (groupId: string, avatarId?: string) => void;
  onClearFilters: () => void;
}

export function AvatarGroupBrowser({
  selectedGroupId,
  selectedAvatarId,
  onSelectGroup,
  onSelectAvatar,
  onClearFilters
}: AvatarGroupBrowserProps) {
  const { data, isLoading, isFetching } = useAvatarGroups(true);
  const groups = data?.groups ?? [];

  const activeGroup = useMemo<HeyGenAvatarGroup | undefined>(() => {
    if (!selectedGroupId) return undefined;
    return groups.find((group) => group.id === selectedGroupId);
  }, [groups, selectedGroupId]);

  const groupAvatarCount = activeGroup?.avatars?.length ?? 0;

  const handleSelectGroup = (groupId: string) => {
    if (selectedGroupId === groupId) {
      onSelectGroup(undefined);
      return;
    }
    onSelectGroup(groupId);
  };

  const handleSelectAvatar = (groupId: string, avatar: HeyGenAvatar) => {
    if (selectedAvatarId === avatar.avatar_id) {
      onSelectAvatar(groupId, undefined);
      return;
    }
    onSelectAvatar(groupId, avatar.avatar_id);
  };

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <CardTitle>Avatar Groups</CardTitle>
          <CardDescription>
            Browse curated HeyGen groups and reuse looks instantly.
          </CardDescription>
        </div>
        <Button
          variant='ghost'
          size='sm'
          className='h-7'
          onClick={onClearFilters}
          disabled={!selectedGroupId && !selectedAvatarId}
        >
          Clear
        </Button>
      </CardHeader>
      <CardContent className='space-y-4'>
        {isLoading ? (
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className='h-20 rounded-lg' />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className='text-muted-foreground text-sm'>
            No avatar groups found. Confirm your HeyGen account has access to
            custom groups.
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            {groups.map((group) => {
              const isActive = group.id === selectedGroupId;
              return (
                <button
                  key={group.id}
                  type='button'
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                    isActive
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                  onClick={() => handleSelectGroup(group.id)}
                >
                  <div className='bg-muted flex h-12 w-12 items-center justify-center overflow-hidden rounded-md'>
                    {group.previewImage ? (
                      <img
                        src={group.previewImage}
                        alt={group.name || 'Group preview'}
                        className='h-full w-full object-cover'
                      />
                    ) : (
                      <IconUserCircle className='text-muted-foreground h-6 w-6' />
                    )}
                  </div>
                  <div className='flex flex-1 flex-col gap-1'>
                    <span className='text-sm font-medium'>
                      {group.name || 'Unnamed Group'}
                    </span>
                    <div className='text-muted-foreground flex items-center gap-2 text-xs'>
                      <Badge variant='outline'>{group.numLooks} looks</Badge>
                      {isActive && (
                        <span className='text-primary font-medium'>
                          Selected
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {isFetching && (
          <p className='text-muted-foreground text-xs'>
            Refreshing groups from HeyGen…
          </p>
        )}

        {selectedGroupId && (
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>
                Group Avatars ({groupAvatarCount})
              </span>
              {groupAvatarCount === 0 && (
                <span className='text-muted-foreground text-xs'>
                  No avatars published in this group yet.
                </span>
              )}
            </div>

            {groupAvatarCount > 0 && (
              <div className='grid grid-cols-2 gap-3 md:grid-cols-3'>
                {activeGroup?.avatars?.map((avatar) => {
                  const isSelected = avatar.avatar_id === selectedAvatarId;
                  return (
                    <button
                      key={avatar.avatar_id}
                      type='button'
                      onClick={() => handleSelectAvatar(activeGroup.id, avatar)}
                      className={cn(
                        'flex flex-col gap-2 rounded-lg border p-2 text-left transition-colors',
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <div className='bg-muted h-24 w-full overflow-hidden rounded-md'>
                        {avatar.preview_image_url ? (
                          <img
                            src={avatar.preview_image_url}
                            alt={avatar.avatar_name || avatar.avatar_id}
                            className='h-full w-full object-cover'
                          />
                        ) : (
                          <div className='text-muted-foreground flex h-full w-full items-center justify-center text-xs'>
                            No preview
                          </div>
                        )}
                      </div>
                      <div>
                        <p className='line-clamp-1 text-sm font-medium'>
                          {avatar.avatar_name || avatar.avatar_id}
                        </p>
                        <p className='text-muted-foreground text-xs'>
                          {avatar.gender || 'Unknown'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
