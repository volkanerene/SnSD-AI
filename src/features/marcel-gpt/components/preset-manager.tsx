'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  usePresets,
  useCreatePreset,
  useDeletePreset,
  useAvatars,
  useVoices
} from '@/hooks/useMarcelGPT';
import { IconPlus, IconTrash, IconSettings } from '@tabler/icons-react';
import { toast } from 'sonner';

export function PresetManager() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');

  const { data: presetsData, isLoading: presetsLoading } = usePresets();
  const presets = presetsData?.presets || [];

  const { data: avatarsData } = useAvatars();
  const avatars = avatarsData?.avatars || [];

  const { data: voicesData } = useVoices();
  const voices = voicesData?.voices || [];

  const createMutation = useCreatePreset();
  const deleteMutation = useDeletePreset();

  const handleCreatePreset = async () => {
    if (!presetName.trim()) {
      toast.error('Please enter a preset name');
      return;
    }

    if (!selectedAvatar || !selectedVoice) {
      toast.error('Please select both avatar and voice');
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: presetName,
        avatar_id: selectedAvatar,
        voice_id: selectedVoice
      });

      toast.success(`"${presetName}" has been saved successfully.`);

      // Reset form
      setPresetName('');
      setSelectedAvatar('');
      setSelectedVoice('');
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create preset');
    }
  };

  const handleDeletePreset = async (presetId: number, presetName: string) => {
    try {
      await deleteMutation.mutateAsync(presetId);
      toast.success(`"${presetName}" has been removed.`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete preset');
    }
  };

  return (
    <div className='space-y-4'>
      {/* Create Preset Button */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button className='w-full'>
            <IconPlus className='mr-2 h-4 w-4' />
            Create New Preset
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Brand Preset</DialogTitle>
            <DialogDescription>
              Save your favorite avatar and voice combination for quick access.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='preset-name'>Preset Name</Label>
              <Input
                id='preset-name'
                placeholder='e.g., Corporate English Male'
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='preset-avatar'>Avatar</Label>
              <Select value={selectedAvatar} onValueChange={setSelectedAvatar}>
                <SelectTrigger id='preset-avatar'>
                  <SelectValue placeholder='Select an avatar...' />
                </SelectTrigger>
                <SelectContent>
                  {avatars.map((avatar) => (
                    <SelectItem key={avatar.avatar_id} value={avatar.avatar_id}>
                      {avatar.avatar_name || avatar.avatar_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='preset-voice'>Voice</Label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger id='preset-voice'>
                  <SelectValue placeholder='Select a voice...' />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.voice_id} value={voice.voice_id}>
                      {voice.name || voice.voice_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePreset}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Preset'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Presets List */}
      {presetsLoading ? (
        <div className='text-muted-foreground flex items-center justify-center py-8'>
          Loading presets...
        </div>
      ) : presets.length === 0 ? (
        <div className='rounded-lg border border-dashed p-8 text-center'>
          <IconSettings className='text-muted-foreground mx-auto h-12 w-12' />
          <h3 className='mt-4 text-lg font-semibold'>No presets yet</h3>
          <p className='text-muted-foreground mt-2 text-sm'>
            Create your first preset to save time on future video generations
          </p>
        </div>
      ) : (
        <div className='grid gap-4 md:grid-cols-2'>
          {presets.map((preset) => (
            <Card key={preset.id}>
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div>
                    <CardTitle className='text-lg'>{preset.name}</CardTitle>
                    <CardDescription>
                      Created {new Date(preset.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleDeletePreset(preset.id, preset.name)}
                    disabled={deleteMutation.isPending}
                  >
                    <IconTrash className='text-destructive h-4 w-4' />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Avatar:</span>
                    <span className='font-medium'>{preset.avatar_id}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Voice:</span>
                    <span className='font-medium'>{preset.voice_id}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
