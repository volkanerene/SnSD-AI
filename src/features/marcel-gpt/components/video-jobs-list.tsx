'use client';

import { VideoJob } from '@/hooks/useMarcelGPTLibrary';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  IconLoader2,
  IconAlertCircle,
  IconCheckCircle
} from '@tabler/icons-react';

interface VideoJobsListProps {
  jobs: VideoJob[];
}

export function VideoJobsList({ jobs }: VideoJobsListProps) {
  return (
    <div className='w-full overflow-x-auto'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className='text-right'>Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell className='font-mono text-sm'>#{job.id}</TableCell>
              <TableCell className='max-w-xs truncate'>
                {job.title || `Video ${job.id}`}
              </TableCell>
              <TableCell>
                <StatusBadge status={job.status} />
              </TableCell>
              <TableCell className='text-sm'>
                {new Date(job.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className='text-right text-sm'>
                {job.duration ? formatDuration(job.duration) : '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {jobs.some((job) => job.error_message) && (
        <div className='mt-6 space-y-4'>
          <h3 className='font-semibold'>Error Details</h3>
          {jobs
            .filter((job) => job.error_message)
            .map((job) => (
              <div
                key={job.id}
                className='rounded-lg bg-red-50 p-4 dark:bg-red-950'
              >
                <p className='font-mono text-sm text-red-700 dark:text-red-200'>
                  Job #{job.id}
                </p>
                <p className='mt-1 text-sm text-red-600 dark:text-red-300'>
                  {job.error_message}
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({
  status
}: {
  status:
    | 'pending'
    | 'queued'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'cancelled';
}) {
  const statusConfig = {
    pending: {
      label: 'Pending',
      icon: IconLoader2,
      variant: 'outline' as const
    },
    queued: {
      label: 'Queued',
      icon: IconLoader2,
      variant: 'outline' as const
    },
    processing: {
      label: 'Processing',
      icon: IconLoader2,
      variant: 'outline' as const
    },
    completed: {
      label: 'Completed',
      icon: IconCheckCircle,
      variant: 'default' as const
    },
    failed: {
      label: 'Failed',
      icon: IconAlertCircle,
      variant: 'destructive' as const
    },
    cancelled: {
      label: 'Cancelled',
      icon: IconAlertCircle,
      variant: 'secondary' as const
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className='gap-1'>
      <Icon className='h-3 w-3' />
      {config.label}
    </Badge>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
}
