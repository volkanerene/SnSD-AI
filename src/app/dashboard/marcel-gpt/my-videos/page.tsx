'use client';

import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Play, CheckCircle2, Clock, Eye } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface VideoAssignment {
  id: string;
  status: string;
  viewed_at: string | null;
  completed_at: string | null;
  email_sent_at: string;
  notes: string | null;
  created_at: string;
  video: {
    id: string;
    title: string;
    description: string;
    video_url: string;
    thumbnail_url: string;
    duration_seconds: number;
    category: string;
    tags: string[];
  };
  assigned_by_user: {
    full_name: string;
    email: string;
  };
}

export default function MyVideosPage() {
  const featureEnabled = process.env.NEXT_PUBLIC_ENABLE_MARCEL_GPT === 'true';

  // All hooks must be called at the top level, before any early returns
  const { profile } = useProfile();
  const [assignments, setAssignments] = useState<VideoAssignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] =
    useState<VideoAssignment | null>(null);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const tenantId = profile?.tenant_id;

  useEffect(() => {
    if (!featureEnabled) return;
    if (!tenantId) return;
    loadAssignments(tenantId);
  }, [featureEnabled, tenantId]);

  if (!featureEnabled) {
    return (
      <PageContainer scrollable>
        <Card>
          <CardHeader>
            <CardTitle>MarcelGPT Videos Disabled</CardTitle>
            <CardDescription>
              Video assignments are not available in this environment.
            </CardDescription>
          </CardHeader>
        </Card>
      </PageContainer>
    );
  }

  const loadAssignments = async (currentTenantId: string) => {
    try {
      const data = await apiClient.get<{ assignments: VideoAssignment[] }>(
        '/marcel-gpt/library/my-assignments',
        { tenantId: currentTenantId }
      );

      setAssignments(data.assignments || []);
    } catch (error) {
      toast.error('Failed to load video assignments');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWatchVideo = async (assignment: VideoAssignment) => {
    setSelectedAssignment(assignment);
    setVideoDialogOpen(true);

    // Mark as viewed if not already
    if (assignment.status === 'pending' && tenantId) {
      try {
        await apiClient.patch(
          `/marcel-gpt/library/assignments/${assignment.id}/mark-viewed`,
          {},
          { tenantId }
        );

        setAssignments((prev) =>
          prev.map((a) =>
            a.id === assignment.id
              ? { ...a, status: 'viewed', viewed_at: new Date().toISOString() }
              : a
          )
        );
      } catch (error) {
        console.error('Failed to mark as viewed:', error);
      }
    }
  };

  const handleMarkCompleted = async (assignmentId: string) => {
    try {
      await apiClient.patch(
        `/marcel-gpt/library/assignments/${assignmentId}/mark-completed`,
        {},
        { tenantId }
      );

      toast.success('Video marked as completed!');
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === assignmentId
            ? {
                ...a,
                status: 'completed',
                completed_at: new Date().toISOString()
              }
            : a
        )
      );
      setVideoDialogOpen(false);
    } catch (error) {
      toast.error('Failed to mark video as completed');
      console.error(error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; icon: any; label: string }> =
      {
        pending: { color: 'bg-yellow-500', icon: Clock, label: 'Not Watched' },
        viewed: { color: 'bg-blue-500', icon: Eye, label: 'Viewed' },
        completed: {
          color: 'bg-green-500',
          icon: CheckCircle2,
          label: 'Completed'
        }
      };
    return configs[status] || configs.pending;
  };

  const pendingCount = assignments.filter((a) => a.status === 'pending').length;
  const completedCount = assignments.filter(
    (a) => a.status === 'completed'
  ).length;
  const completionRate =
    assignments.length > 0
      ? Math.round((completedCount / assignments.length) * 100)
      : 0;

  return (
    <PageContainer scrollable>
      <div className='space-y-6'>
        {/* Header */}
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            My Training Videos
          </h1>
          <p className='text-muted-foreground mt-2'>
            Videos assigned to you by your administrator
          </p>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-muted-foreground text-sm font-medium'>
                Total Assigned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{assignments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-muted-foreground text-sm font-medium'>
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-yellow-600'>
                {pendingCount}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-muted-foreground text-sm font-medium'>
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {completedCount}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-muted-foreground text-sm font-medium'>
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <div className='text-2xl font-bold'>{completionRate}%</div>
                <Progress value={completionRate} className='h-2' />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Videos List */}
        {isLoading ? (
          <div className='py-12 text-center'>
            <p className='text-muted-foreground'>Loading your videos...</p>
          </div>
        ) : assignments.length === 0 ? (
          <Card>
            <CardContent className='py-12 text-center'>
              <Play className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
              <p className='text-muted-foreground'>No videos assigned yet</p>
              <p className='text-muted-foreground mt-2 text-sm'>
                When your administrator assigns training videos to you, they
                will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {assignments.map((assignment) => {
              const statusConfig = getStatusConfig(assignment.status);
              const StatusIcon = statusConfig.icon;

              return (
                <Card key={assignment.id} className='overflow-hidden'>
                  <div className='relative aspect-video bg-slate-100 dark:bg-slate-900'>
                    {assignment.video.thumbnail_url ? (
                      <img
                        src={assignment.video.thumbnail_url}
                        alt={assignment.video.title}
                        className='h-full w-full object-cover'
                      />
                    ) : (
                      <div className='flex h-full w-full items-center justify-center'>
                        <Play className='text-muted-foreground h-12 w-12' />
                      </div>
                    )}

                    {/* Status Indicator */}
                    <div className='absolute top-2 left-2'>
                      <div
                        className={`${statusConfig.color} flex items-center gap-1 rounded-md px-2 py-1 text-xs text-white`}
                      >
                        <StatusIcon className='h-3 w-3' />
                        {statusConfig.label}
                      </div>
                    </div>

                    {/* Duration */}
                    <div className='absolute right-2 bottom-2'>
                      <Badge
                        variant='secondary'
                        className='bg-background/80 backdrop-blur-sm'
                      >
                        {formatDuration(assignment.video.duration_seconds)}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className='text-lg'>
                      {assignment.video.title}
                    </CardTitle>
                    <CardDescription>
                      {assignment.video.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className='space-y-3'>
                      {assignment.notes && (
                        <div className='rounded-lg bg-blue-50 p-3 dark:bg-blue-950'>
                          <p className='mb-1 text-xs font-medium text-blue-900 dark:text-blue-100'>
                            Note from {assignment.assigned_by_user.full_name}:
                          </p>
                          <p className='text-sm text-blue-800 dark:text-blue-200'>
                            {assignment.notes}
                          </p>
                        </div>
                      )}

                      <div className='flex flex-wrap gap-2'>
                        <Badge variant='outline'>
                          {assignment.video.category}
                        </Badge>
                        {assignment.video.tags?.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant='secondary'
                            className='text-xs'
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <Button
                        className='w-full'
                        onClick={() => handleWatchVideo(assignment)}
                      >
                        <Play className='mr-2 h-4 w-4' />
                        Watch Video
                      </Button>

                      <div className='text-muted-foreground text-xs'>
                        Assigned on{' '}
                        {new Date(assignment.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Video Player Dialog */}
        <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
          <DialogContent className='max-w-4xl'>
            <DialogHeader>
              <DialogTitle>{selectedAssignment?.video.title}</DialogTitle>
            </DialogHeader>

            <div className='space-y-4'>
              {selectedAssignment && (
                <>
                  <div className='aspect-video overflow-hidden rounded-lg bg-black'>
                    <video
                      controls
                      autoPlay
                      className='h-full w-full'
                      src={selectedAssignment.video.video_url}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>

                  <div>
                    <p className='text-muted-foreground text-sm'>
                      {selectedAssignment.video.description}
                    </p>
                  </div>

                  {selectedAssignment.status !== 'completed' && (
                    <div className='flex justify-end'>
                      <Button
                        onClick={() =>
                          handleMarkCompleted(selectedAssignment.id)
                        }
                      >
                        <CheckCircle2 className='mr-2 h-4 w-4' />
                        Mark as Completed
                      </Button>
                    </div>
                  )}

                  {selectedAssignment.status === 'completed' && (
                    <div className='rounded-lg bg-green-50 p-4 text-center dark:bg-green-950'>
                      <CheckCircle2 className='mx-auto mb-2 h-8 w-8 text-green-600' />
                      <p className='text-sm text-green-900 dark:text-green-100'>
                        You completed this video on{' '}
                        {selectedAssignment.completed_at &&
                          new Date(
                            selectedAssignment.completed_at
                          ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
