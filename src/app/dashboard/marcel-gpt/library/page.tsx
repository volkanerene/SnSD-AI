'use client';

import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { apiClient } from '@/lib/api-client';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Play, Send, CheckCircle2, XCircle, Users } from 'lucide-react';

interface PremadeVideo {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration_seconds: number;
  category: string;
  tags: string[];
}

interface Worker {
  id: string;
  full_name: string;
  email: string;
  role_id: number;
}

export default function MarcelGPTLibraryPage() {
  const featureEnabled = process.env.NEXT_PUBLIC_ENABLE_MARCEL_GPT === 'true';

  if (!featureEnabled) {
    return (
      <PageContainer scrollable>
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>MarcelGPT Library Disabled</CardTitle>
              <CardDescription>
                This library is not available in the current environment.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </PageContainer>
    );
  }

  const { profile } = useProfile();
  const [videos, setVideos] = useState<PremadeVideo[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);

  const tenantId = profile?.tenant_id;

  useEffect(() => {
    if (!tenantId) {
      setVideos([]);
      setWorkers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    loadVideos(tenantId);
    loadWorkers(tenantId);
  }, [tenantId]);

  const loadVideos = async (currentTenantId: string) => {
    try {
      const data = await apiClient.get<{ videos: PremadeVideo[] }>(
        '/marcel-gpt/library/premade-videos',
        { tenantId: currentTenantId }
      );
      setVideos(data.videos || []);
    } catch (error) {
      toast.error('Failed to load videos');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWorkers = async (currentTenantId: string) => {
    try {
      const data = await apiClient.get<Worker[]>('/users', {
        tenantId: currentTenantId
      });
      setWorkers(data || []);
    } catch (error) {
      console.error('Failed to load workers:', error);
    }
  };

  const handleVideoSelect = (videoId: string, checked: boolean) => {
    if (checked) {
      setSelectedVideos([...selectedVideos, videoId]);
    } else {
      setSelectedVideos(selectedVideos.filter((id) => id !== videoId));
    }
  };

  const handleWorkerSelect = (workerId: string, checked: boolean) => {
    if (checked) {
      setSelectedWorkers([...selectedWorkers, workerId]);
    } else {
      setSelectedWorkers(selectedWorkers.filter((id) => id !== workerId));
    }
  };

  const handleAssignVideos = async () => {
    if (selectedVideos.length === 0 || selectedWorkers.length === 0) {
      toast.error('Please select at least one video and one worker');
      return;
    }

    if (!tenantId) {
      toast.error('Tenant context missing');
      return;
    }

    setIsAssigning(true);

    try {
      const data = await apiClient.post<{
        workers_notified: number;
      }>(
        '/marcel-gpt/library/assign-videos',
        {
          video_ids: selectedVideos,
          worker_ids: selectedWorkers,
          notes
        },
        { tenantId }
      );

      toast.success(`Videos assigned to ${data.workers_notified} worker(s)`);
      setAssignDialogOpen(false);
      setSelectedVideos([]);
      setSelectedWorkers([]);
      setNotes('');
    } catch (error) {
      toast.error('Failed to assign videos');
      console.error(error);
    } finally {
      setIsAssigning(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <PageContainer scrollable>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Video Library</h1>
            <p className='text-muted-foreground mt-2'>
              Pre-made training videos ready to be assigned to workers
            </p>
          </div>

          {selectedVideos.length > 0 && (
            <Button onClick={() => setAssignDialogOpen(true)}>
              <Send className='mr-2 h-4 w-4' />
              Assign {selectedVideos.length} Video(s)
            </Button>
          )}
        </div>

        {/* Videos Grid */}
        {isLoading ? (
          <div className='py-12 text-center'>
            <p className='text-muted-foreground'>Loading videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <Card>
            <CardContent className='py-12 text-center'>
              <p className='text-muted-foreground'>No videos available</p>
            </CardContent>
          </Card>
        ) : (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {videos.map((video) => (
              <Card key={video.id} className='overflow-hidden'>
                <div className='relative aspect-video bg-slate-100 dark:bg-slate-900'>
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className='h-full w-full object-cover'
                    />
                  ) : (
                    <div className='flex h-full w-full items-center justify-center'>
                      <Play className='text-muted-foreground h-12 w-12' />
                    </div>
                  )}

                  {/* Selection Checkbox */}
                  <div className='absolute top-2 right-2'>
                    <div className='bg-background/80 rounded-md p-1.5 backdrop-blur-sm'>
                      <Checkbox
                        checked={selectedVideos.includes(video.id)}
                        onCheckedChange={(checked) =>
                          handleVideoSelect(video.id, checked as boolean)
                        }
                      />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className='absolute right-2 bottom-2'>
                    <Badge
                      variant='secondary'
                      className='bg-background/80 backdrop-blur-sm'
                    >
                      {formatDuration(video.duration_seconds)}
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className='text-lg'>{video.title}</CardTitle>
                  <CardDescription>{video.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className='flex flex-wrap gap-2'>
                    <Badge variant='outline'>{video.category}</Badge>
                    {video.tags?.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant='secondary' className='text-xs'>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Assign Dialog */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent className='max-h-[80vh] max-w-2xl overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Assign Videos to Workers</DialogTitle>
              <DialogDescription>
                Select workers to receive the selected {selectedVideos.length}{' '}
                video(s). They will receive an email notification.
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4 py-4'>
              {/* Workers Selection */}
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Select Workers</label>
                <div className='max-h-60 space-y-2 overflow-y-auto rounded-lg border p-4'>
                  {workers.length === 0 ? (
                    <p className='text-muted-foreground text-sm'>
                      No workers found
                    </p>
                  ) : (
                    workers.map((worker) => (
                      <div
                        key={worker.id}
                        className='flex items-center space-x-2'
                      >
                        <Checkbox
                          id={`worker-${worker.id}`}
                          checked={selectedWorkers.includes(worker.id)}
                          onCheckedChange={(checked) =>
                            handleWorkerSelect(worker.id, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={`worker-${worker.id}`}
                          className='flex-1 cursor-pointer text-sm'
                        >
                          <div className='font-medium'>{worker.full_name}</div>
                          <div className='text-muted-foreground text-xs'>
                            {worker.email}
                          </div>
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Notes (Optional)</label>
                <Textarea
                  placeholder='Add any notes or instructions for workers...'
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setAssignDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAssignVideos} disabled={isAssigning}>
                {isAssigning
                  ? 'Assigning...'
                  : `Assign to ${selectedWorkers.length} Worker(s)`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
