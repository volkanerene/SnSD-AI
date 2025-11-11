'use client';

import { VideoJob } from '@/hooks/useMarcelGPTLibrary';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface VideoPlayerModalProps {
  job: VideoJob;
  onClose: () => void;
}

export function VideoPlayerModal({ job, onClose }: VideoPlayerModalProps) {
  const videoUrl =
    job.artifacts?.[0]?.signed_url || job.artifacts?.[0]?.heygen_url;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl'>
        <DialogHeader>
          <DialogTitle>{job.title || `Video #${job.id}`}</DialogTitle>
          <DialogDescription>
            Generated on{' '}
            {job.completed_at &&
              new Date(job.completed_at).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className='w-full overflow-hidden rounded-lg bg-black'>
          {videoUrl ? (
            <video src={videoUrl} controls className='h-auto w-full' autoPlay />
          ) : (
            <div className='bg-muted flex aspect-video items-center justify-center'>
              <p className='text-muted-foreground'>Video not available</p>
            </div>
          )}
        </div>

        {job.artifacts?.[0]?.duration && (
          <div className='text-muted-foreground text-sm'>
            Duration: {formatDuration(job.artifacts[0].duration)}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
}
