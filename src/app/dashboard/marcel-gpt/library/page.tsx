'use client';

import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { ProtectedRoute } from '@/components/protected-route';
import {
  IconVideo,
  IconLoader2,
  IconCircleCheck,
  IconAlertCircle
} from '@tabler/icons-react';
import { useVideoJobs } from '@/hooks/useMarcelGPTLibrary';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoLibraryGrid } from '@/features/marcel-gpt/components/video-library-grid';
import { VideoJobsList } from '@/features/marcel-gpt/components/video-jobs-list';

export default function MarcelGPTLibraryPage() {
  const featureEnabled = process.env.NEXT_PUBLIC_ENABLE_MARCEL_GPT === 'true';
  const { data: allJobs, isLoading, error } = useVideoJobs();

  if (error) {
    console.error('[LibraryPage] Error loading jobs:', error);
  }

  if (!featureEnabled) {
    return (
      <PageContainer scrollable>
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>MarcelGPT Disabled</CardTitle>
              <CardDescription>
                This module is turned off for your current environment. Enable
                `NEXT_PUBLIC_ENABLE_MARCEL_GPT` to access HeyGen video features.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </PageContainer>
    );
  }

  const completedJobs =
    allJobs?.filter((job) => job.status === 'completed') || [];
  const processingJobs =
    allJobs?.filter((job) =>
      ['pending', 'queued', 'processing'].includes(job.status)
    ) || [];
  const failedJobs = allJobs?.filter((job) => job.status === 'failed') || [];

  return (
    <ProtectedRoute requiredPermission='modules.access_marcel_gpt'>
      <PageContainer scrollable>
        <div className='space-y-6'>
          {/* Header */}
          <div className='flex items-center gap-3'>
            <IconVideo className='text-primary h-8 w-8' />
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>
                Video Library
              </h1>
              <p className='text-muted-foreground'>
                Browse and manage all your generated training videos
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <Card>
              <CardContent className='pt-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-muted-foreground text-sm'>
                      Completed Videos
                    </p>
                    <p className='text-3xl font-bold'>{completedJobs.length}</p>
                  </div>
                  <IconCircleCheck className='h-8 w-8 text-green-500' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='pt-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-muted-foreground text-sm'>Processing</p>
                    <p className='text-3xl font-bold'>
                      {processingJobs.length}
                    </p>
                  </div>
                  <IconLoader2 className='h-8 w-8 animate-spin text-blue-500' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='pt-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-muted-foreground text-sm'>Failed</p>
                    <p className='text-3xl font-bold'>{failedJobs.length}</p>
                  </div>
                  <IconAlertCircle className='h-8 w-8 text-red-500' />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Card>
            <CardHeader>
              <CardTitle>Your Videos</CardTitle>
              <CardDescription>
                All your generated training videos organized by status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue='completed' className='w-full'>
                <TabsList className='mb-6 grid w-full grid-cols-3'>
                  <TabsTrigger value='completed'>
                    Completed ({completedJobs.length})
                  </TabsTrigger>
                  <TabsTrigger value='processing'>
                    Processing ({processingJobs.length})
                  </TabsTrigger>
                  <TabsTrigger value='failed'>
                    Failed ({failedJobs.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value='completed'>
                  {isLoading ? (
                    <div className='space-y-4'>
                      <Skeleton className='h-48 w-full' />
                      <Skeleton className='h-48 w-full' />
                    </div>
                  ) : completedJobs.length === 0 ? (
                    <div className='py-12 text-center'>
                      <IconVideo className='text-muted-foreground mx-auto mb-3 h-12 w-12' />
                      <p className='text-muted-foreground mb-2'>
                        No completed videos yet
                      </p>
                      <p className='text-muted-foreground text-sm'>
                        Create a video and it will appear here once generation
                        is complete
                      </p>
                    </div>
                  ) : (
                    <VideoLibraryGrid jobs={completedJobs} />
                  )}
                </TabsContent>

                <TabsContent value='processing'>
                  {isLoading ? (
                    <div className='space-y-4'>
                      <Skeleton className='h-20 w-full' />
                      <Skeleton className='h-20 w-full' />
                    </div>
                  ) : processingJobs.length === 0 ? (
                    <div className='py-12 text-center'>
                      <IconLoader2 className='text-muted-foreground mx-auto mb-3 h-12 w-12' />
                      <p className='text-muted-foreground mb-2'>
                        No videos processing
                      </p>
                      <p className='text-muted-foreground text-sm'>
                        Videos will appear here while they are being generated
                      </p>
                    </div>
                  ) : (
                    <VideoJobsList jobs={processingJobs} />
                  )}
                </TabsContent>

                <TabsContent value='failed'>
                  {isLoading ? (
                    <div className='space-y-4'>
                      <Skeleton className='h-20 w-full' />
                      <Skeleton className='h-20 w-full' />
                    </div>
                  ) : failedJobs.length === 0 ? (
                    <div className='py-12 text-center'>
                      <IconAlertCircle className='text-muted-foreground mx-auto mb-3 h-12 w-12' />
                      <p className='text-muted-foreground mb-2'>
                        No failed videos
                      </p>
                      <p className='text-muted-foreground text-sm'>
                        Failed videos will appear here with error details
                      </p>
                    </div>
                  ) : (
                    <VideoJobsList jobs={failedJobs} />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </ProtectedRoute>
  );
}
