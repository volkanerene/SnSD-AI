'use client';

import { VideoJob } from '@/hooks/useMarcelGPTLibrary';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconPlay, IconDownload, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { VideoPlayerModal } from './video-player-modal';

interface VideoLibraryGridProps {
  jobs: VideoJob[];
}

export function VideoLibraryGrid({ jobs }: VideoLibraryGridProps) {
  const [selectedJob, setSelectedJob] = useState<VideoJob | null>(null);

  return (
    <>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {jobs.map((job) => (
          <Card key={job.id} className='overflow-hidden'>
            {/* Thumbnail */}
            <div className='bg-muted relative flex h-48 w-full items-center justify-center'>
              {job.artifacts?.[0]?.thumbnail_url ? (
                <img
                  src={job.artifacts[0].thumbnail_url}
                  alt={job.title || `Video ${job.id}`}
                  className='h-full w-full object-cover'
                />
              ) : (
                <div className='text-muted-foreground flex flex-col items-center gap-2'>
                  <IconPlay className='h-12 w-12' />
                  <span className='text-sm'>No thumbnail</span>
                </div>
              )}
              <button
                onClick={() => setSelectedJob(job)}
                className='absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100'
              >
                <IconPlay className='h-12 w-12 text-white' />
              </button>
            </div>

            {/* Content */}
            <CardHeader className='pb-3'>
              <CardTitle className='truncate text-lg'>
                {job.title || `Video #${job.id}`}
              </CardTitle>
              <CardDescription>
                {job.completed_at &&
                  new Date(job.completed_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Duration */}
              {job.artifacts?.[0]?.duration && (
                <p className='text-muted-foreground mb-4 text-sm'>
                  Duration: {formatDuration(job.artifacts[0].duration)}
                </p>
              )}

              {/* File Size */}
              {job.artifacts?.[0]?.file_size && (
                <p className='text-muted-foreground mb-4 text-sm'>
                  Size: {formatFileSize(job.artifacts[0].file_size)}
                </p>
              )}

              {/* Actions */}
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  variant='outline'
                  className='flex-1 gap-2'
                  onClick={() => setSelectedJob(job)}
                >
                  <IconPlay className='h-4 w-4' />
                  Play
                </Button>
                {job.artifacts?.[0]?.signed_url && (
                  <Button
                    size='sm'
                    variant='outline'
                    className='gap-2'
                    onClick={() => {
                      const url = job.artifacts[0].signed_url;
                      if (url) {
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `video-${job.id}.mp4`;
                        a.click();
                      }
                    }}
                  >
                    <IconDownload className='h-4 w-4' />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedJob && (
        <VideoPlayerModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
