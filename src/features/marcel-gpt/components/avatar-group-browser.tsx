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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  type HeyGenAvatarGroup,
  type HeyGenAvatar,
  useAvatarGroups,
  useCustomGroupAvatars
} from '@/hooks/useMarcelGPT';
import { IconUserCircle, IconSearch } from '@tabler/icons-react';
import { PhotoAvatarGenerator } from './photo-avatar-generator';

interface AvatarGroupBrowserProps {
  selectedGroupId?: string;
  selectedAvatarId?: string;
  onSelectGroup: (groupId?: string) => void;
  onSelectAvatar: (groupId: string, avatar?: HeyGenAvatar) => void;
  onClearFilters: () => void;
  onImageKeySelect?: (imageKey: string) => void;
}

const DEFAULT_CUSTOM_GROUP_ID =
  process.env.NEXT_PUBLIC_MARCEL_CUSTOM_GROUP_ID?.trim() || '';

export function AvatarGroupBrowser({
  selectedGroupId,
  selectedAvatarId,
  onSelectGroup,
  onSelectAvatar,
  onClearFilters,
  onImageKeySelect
}: AvatarGroupBrowserProps) {
  const [customGroupId, setCustomGroupId] = useState(DEFAULT_CUSTOM_GROUP_ID);
  const [activeCustomGroupId, setActiveCustomGroupId] = useState<
    string | undefined
  >(DEFAULT_CUSTOM_GROUP_ID || undefined);

  const { data, isLoading, isFetching } = useAvatarGroups(true);
  const groups = data?.groups ?? [];

  const {
    data: customGroupData,
    isLoading: customGroupLoading,
    error: customGroupError
  } = useCustomGroupAvatars(activeCustomGroupId, Boolean(activeCustomGroupId));

  const activeGroup = useMemo<HeyGenAvatarGroup | undefined>(() => {
    if (!selectedGroupId) return undefined;

    const resolvedCustomGroupId =
      customGroupData?.group_id || activeCustomGroupId;

    if (
      resolvedCustomGroupId &&
      selectedGroupId === resolvedCustomGroupId &&
      customGroupData
    ) {
      return {
        id: resolvedCustomGroupId,
        name:
          customGroupData?.avatars?.[0]?.avatar_name ||
          `Custom Group (${customGroupData.count ?? 0})`,
        numLooks: customGroupData?.count ?? 0,
        avatars: customGroupData?.avatars
      };
    }

    return groups.find((group) => group.id === selectedGroupId);
  }, [groups, selectedGroupId, customGroupData, activeCustomGroupId]);

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
    onSelectAvatar(groupId, avatar);
  };

  const handleSearchCustomGroup = () => {
    const trimmed = customGroupId.trim();
    if (!trimmed) {
      return;
    }
    setActiveCustomGroupId(trimmed);
    onSelectGroup(trimmed);
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
        <div className='space-y-2'>
          <div className='text-sm font-medium'>
            Search Custom Group (Marcel, etc.)
          </div>
          <div className='flex gap-2'>
            <Input
              placeholder='Paste custom group ID (e.g., 4280ce1878e74185bdb8471aaa3e13cc)'
              value={customGroupId}
              onChange={(e) => setCustomGroupId(e.target.value)}
              className='flex-1'
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchCustomGroup();
                }
              }}
            />
            <Button
              onClick={handleSearchCustomGroup}
              disabled={!customGroupId.trim() || customGroupLoading}
              size='sm'
              variant='outline'
              className='gap-2'
            >
              <IconSearch className='h-4 w-4' />
              {customGroupLoading ? 'Loading...' : 'Search'}
            </Button>
          </div>
          {customGroupError && (
            <p className='text-destructive text-xs'>
              Error loading group. Check the ID and try again.
            </p>
          )}
          {activeCustomGroupId && customGroupLoading && (
            <p className='text-muted-foreground text-xs'>
              Loading custom group…
            </p>
          )}
          {activeCustomGroupId && customGroupData && (
            <p className='text-muted-foreground text-xs'>
              Loaded {customGroupData.count} avatars from custom group{' '}
              <span className='font-mono'>{activeCustomGroupId}</span>
              {DEFAULT_CUSTOM_GROUP_ID &&
                activeCustomGroupId === DEFAULT_CUSTOM_GROUP_ID &&
                ' (auto-configured)'}
            </p>
          )}
        </div>

        {customGroupData && customGroupData.avatars?.length ? (
          <div className='space-y-2'>
            {(() => {
              const resolvedId =
                customGroupData.group_id || activeCustomGroupId || '';
              if (!resolvedId) {
                return null;
              }
              const isActive = selectedGroupId === resolvedId;
              return (
                <>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>Custom Group</span>
                    <Badge variant='outline'>
                      {customGroupData.count} avatars
                    </Badge>
                  </div>
                  <button
                    type='button'
                    className={cn(
                      'flex items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                      isActive
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                    onClick={() => handleSelectGroup(resolvedId)}
                  >
                    <div className='bg-muted flex h-12 w-12 items-center justify-center overflow-hidden rounded-md'>
                      {customGroupData.avatars[0]?.preview_image_url ? (
                        <img
                          src={customGroupData.avatars[0].preview_image_url}
                          alt={
                            customGroupData.avatars[0].avatar_name ||
                            'Custom group'
                          }
                          className='h-full w-full object-cover'
                        />
                      ) : (
                        <IconUserCircle className='text-muted-foreground h-6 w-6' />
                      )}
                    </div>
                    <div className='flex flex-1 flex-col gap-1'>
                      <span className='text-sm font-medium'>
                        {customGroupData.avatars[0]?.avatar_name ||
                          resolvedId ||
                          'Custom Group'}
                      </span>
                      <div className='text-muted-foreground flex items-center gap-2 text-xs'>
                        <Badge variant='outline'>Custom</Badge>
                        {isActive && (
                          <span className='text-primary font-medium'>
                            Selected
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </>
              );
            })()}
          </div>
        ) : null}

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
                {activeGroup?.avatars?.map((avatar, idx) => {
                  const isSelected = avatar.avatar_id === selectedAvatarId;
                  // Use combination of group_id and avatar_id to ensure unique key
                  const uniqueKey = `${activeGroup.id}-${avatar.avatar_id}-${idx}`;
                  return (
                    <div
                      key={uniqueKey}
                      className={cn(
                        'group flex flex-col gap-2 rounded-lg border p-2 transition-colors',
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <button
                        type='button'
                        onClick={() =>
                          handleSelectAvatar(activeGroup.id, avatar)
                        }
                        className='flex-1 text-left'
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
                      <PhotoAvatarGenerator
                        avatar={avatar}
                        groupId={activeGroup.id}
                        onImageKeySelect={onImageKeySelect}
                      />
                    </div>
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
