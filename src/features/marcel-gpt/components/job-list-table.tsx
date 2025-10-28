'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  useVideoJobs,
  useCancelJob,
  type VideoJob
} from '@/hooks/useMarcelGPT';
import {
  IconDownload,
  IconX,
  IconClock,
  IconPlayerPlay,
  IconCheck,
  IconAlertCircle,
  IconRefresh
} from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export function JobListTable() {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: jobsData, isLoading } = useVideoJobs(
    statusFilter !== 'all' ? statusFilter : undefined
  );
  const jobs = jobsData?.jobs || [];
  const totalCount = jobsData?.count || 0;

  const cancelMutation = useCancelJob();

  const handleCancel = async (jobId: number) => {
    try {
      await cancelMutation.mutateAsync(jobId);
      toast.success(`Job #${jobId} has been cancelled.`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel job');
    }
  };

  const handleDownload = (url: string, jobId: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `marcel-video-${jobId}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: VideoJob['status']) => {
    const variants: Record<
      VideoJob['status'],
      {
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
        icon: any;
      }
    > = {
      pending: { variant: 'secondary', icon: IconClock },
      queued: { variant: 'secondary', icon: IconClock },
      processing: { variant: 'default', icon: IconPlayerPlay },
      completed: { variant: 'outline', icon: IconCheck },
      failed: { variant: 'destructive', icon: IconAlertCircle }
    };

    const { variant, icon: Icon } = variants[status] || {
      variant: 'secondary',
      icon: IconClock
    };

    return (
      <Badge variant={variant} className='flex w-fit items-center gap-1'>
        <Icon className='h-3 w-3' />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className='space-y-4'>
      {/* Header with Filter */}
      <div className='flex items-center justify-between'>
        <div className='text-muted-foreground text-sm'>
          {totalCount} {totalCount === 1 ? 'job' : 'jobs'} total
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='All Statuses' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Statuses</SelectItem>
            <SelectItem value='pending'>Pending</SelectItem>
            <SelectItem value='queued'>Queued</SelectItem>
            <SelectItem value='processing'>Processing</SelectItem>
            <SelectItem value='completed'>Completed</SelectItem>
            <SelectItem value='failed'>Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[80px]'>Job ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Text Preview</TableHead>
              <TableHead>Engine</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className='h-24 text-center'>
                  <div className='text-muted-foreground flex items-center justify-center gap-2'>
                    <IconRefresh className='h-4 w-4 animate-spin' />
                    Loading jobs...
                  </div>
                </TableCell>
              </TableRow>
            ) : jobs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className='text-muted-foreground h-24 text-center'
                >
                  No jobs found
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className='font-mono text-sm'>#{job.id}</TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                  <TableCell className='max-w-[300px]'>
                    <p className='truncate text-sm'>{job.input_text}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline'>
                      {job.engine?.toUpperCase() || 'V2'}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-muted-foreground text-sm'>
                    {job.created_at
                      ? formatDistanceToNow(new Date(job.created_at), {
                          addSuffix: true
                        })
                      : 'N/A'}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-2'>
                      {job.status === 'completed' &&
                        job.artifacts &&
                        job.artifacts.length > 0 && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              handleDownload(
                                job.artifacts![0].video_url,
                                job.id
                              )
                            }
                          >
                            <IconDownload className='h-4 w-4' />
                          </Button>
                        )}

                      {(job.status === 'pending' ||
                        job.status === 'queued' ||
                        job.status === 'processing') && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleCancel(job.id)}
                          disabled={cancelMutation.isPending}
                        >
                          <IconX className='h-4 w-4' />
                        </Button>
                      )}

                      {job.status === 'failed' && job.error_message && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            toast.error(job.error_message || 'Unknown error');
                          }}
                        >
                          <IconAlertCircle className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Auto-refresh indicator */}
      {jobs.some((job) =>
        ['pending', 'queued', 'processing'].includes(job.status)
      ) && (
        <div className='text-muted-foreground flex items-center justify-center gap-2 text-sm'>
          <IconRefresh className='h-3 w-3 animate-spin' />
          Auto-refreshing every 5 seconds...
        </div>
      )}
    </div>
  );
}
