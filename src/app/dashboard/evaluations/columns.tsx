'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Pencil, Trash } from 'lucide-react';
import type { FRM32Submission } from '@/types/api';
import { formatDate } from '@/lib/format';
import Link from 'next/link';

const statusColors = {
  draft: 'bg-gray-500',
  submitted: 'bg-blue-500',
  in_review: 'bg-yellow-500',
  completed: 'bg-green-500',
  rejected: 'bg-red-500'
};

const statusLabels = {
  draft: 'Draft',
  submitted: 'Submitted',
  in_review: 'In Review',
  completed: 'Completed',
  rejected: 'Rejected'
};

const riskColors = {
  green: 'bg-green-500 text-white',
  yellow: 'bg-yellow-500 text-white',
  red: 'bg-red-500 text-white'
};

const evaluationTypeLabels = {
  periodic: 'Periodic',
  incident: 'Incident',
  audit: 'Audit'
};

export const evaluationsColumns: ColumnDef<FRM32Submission>[] = [
  {
    accessorKey: 'evaluation_period',
    header: 'Period',
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='font-medium'>{row.original.evaluation_period}</span>
        <span className='text-muted-foreground text-xs'>
          {evaluationTypeLabels[row.original.evaluation_type]}
        </span>
      </div>
    )
  },
  {
    accessorKey: 'contractor_id',
    header: 'Contractor',
    cell: ({ row }) => (
      <div className='font-medium'>
        {/* TODO: Load contractor name from ID */}
        {row.original.contractor_id.substring(0, 8)}...
      </div>
    )
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          variant='outline'
          className={`${statusColors[status]} text-white`}
        >
          {statusLabels[status]}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'progress_percentage',
    header: 'Progress',
    cell: ({ row }) => {
      const progress = row.original.progress_percentage;
      return (
        <div className='flex items-center gap-2'>
          <Progress value={progress} className='w-[60px]' />
          <span className='text-muted-foreground text-sm'>{progress}%</span>
        </div>
      );
    }
  },
  {
    accessorKey: 'final_score',
    header: 'Score',
    cell: ({ row }) => {
      const score = row.original.final_score;
      if (!score) return <span className='text-muted-foreground'>-</span>;
      return (
        <div className='font-medium'>
          <span className='text-lg'>{score.toFixed(1)}</span>
          <span className='text-muted-foreground text-xs'>/100</span>
        </div>
      );
    }
  },
  {
    accessorKey: 'risk_classification',
    header: 'Risk',
    cell: ({ row }) => {
      const risk = row.original.risk_classification;
      if (!risk) return <span className='text-muted-foreground'>-</span>;
      return (
        <Badge
          variant='outline'
          className={`${riskColors[risk]} font-bold uppercase`}
        >
          {risk}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'submitted_at',
    header: 'Submitted',
    cell: ({ row }) => {
      const date = row.original.submitted_at;
      if (!date) return <span className='text-muted-foreground'>-</span>;
      return <span className='text-sm'>{formatDate(date)}</span>;
    }
  },
  {
    accessorKey: 'completed_at',
    header: 'Completed',
    cell: ({ row }) => {
      const date = row.original.completed_at;
      if (!date) return <span className='text-muted-foreground'>-</span>;
      return <span className='text-sm'>{formatDate(date)}</span>;
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const submission = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(submission.id)}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/evaluations/${submission.id}`}>
                <Eye className='mr-2 h-4 w-4' />
                View Details
              </Link>
            </DropdownMenuItem>
            {(submission.status === 'draft' ||
              submission.status === 'submitted') && (
              <DropdownMenuItem>
                <Pencil className='mr-2 h-4 w-4' />
                Edit
              </DropdownMenuItem>
            )}
            {submission.status === 'draft' && (
              <DropdownMenuItem className='text-red-600'>
                <Trash className='mr-2 h-4 w-4' />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
