'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, X, Eye, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/format';

interface ContractorEvaluation {
  id: string;
  contractor_id: string;
  contractor_name: string;
  session_id: string;
  cycle: number;
  frm32_status: 'completed' | 'pending' | 'in_progress';
  frm33_status: 'completed' | 'pending' | 'in_progress';
  frm34_status: 'completed' | 'pending' | 'in_progress';
  frm35_status: 'completed' | 'pending' | 'in_progress';
  frm32_score: number | null;
  frm33_score: number | null;
  frm34_score: number | null;
  frm35_score: number | null;
  final_score: number | null;
  progress_percentage: number;
  last_updated: string;
  answers_available: boolean;
}

export const evaluationsColumns = (
  selectedRows: string[],
  setSelectedRows: (ids: string[]) => void
): ColumnDef<ContractorEvaluation>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => {
          table.toggleAllPageRowsSelected(!!value);
          if (value) {
            setSelectedRows(
              table.getRowModel().rows.map((row) => row.original.id)
            );
          } else {
            setSelectedRows([]);
          }
        }}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={selectedRows.includes(row.original.id)}
        onCheckedChange={(value) => {
          if (value) {
            setSelectedRows([...selectedRows, row.original.id]);
          } else {
            setSelectedRows(
              selectedRows.filter((id) => id !== row.original.id)
            );
          }
        }}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'contractor_name',
    header: 'Contractor',
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='font-medium'>{row.original.contractor_name}</span>
        <span className='text-muted-foreground text-xs'>
          Session: {row.original.session_id} | Cycle: {row.original.cycle}
        </span>
      </div>
    )
  },
  {
    accessorKey: 'frm32_score',
    header: 'FRM32',
    cell: ({ row }) => {
      const status = row.original.frm32_status;
      const score = row.original.frm32_score;

      if (status === 'completed' && score !== null) {
        return (
          <div className='flex items-center gap-2'>
            <Check className='h-4 w-4 text-green-500' />
            <span className='font-medium'>{score}</span>
          </div>
        );
      } else if (status === 'in_progress') {
        return (
          <div className='flex items-center gap-2'>
            <Clock className='h-4 w-4 text-yellow-500' />
            <span className='text-muted-foreground text-sm'>In Progress</span>
          </div>
        );
      } else {
        return (
          <div className='flex items-center gap-2'>
            <X className='h-4 w-4 text-red-500' />
            <span className='text-muted-foreground text-sm'>Pending</span>
          </div>
        );
      }
    }
  },
  {
    accessorKey: 'frm33_status',
    header: 'FRM33',
    cell: ({ row }) => {
      const status = row.original.frm33_status;
      const score = row.original.frm33_score;

      if (status === 'completed') {
        return (
          <div className='flex items-center gap-2'>
            <Check className='h-4 w-4 text-green-500' />
            <span className='text-muted-foreground text-sm'>
              {score || 'Done'}
            </span>
          </div>
        );
      } else if (status === 'in_progress') {
        return (
          <div className='flex items-center gap-2'>
            <Clock className='h-4 w-4 text-yellow-500' />
          </div>
        );
      } else {
        return <X className='h-4 w-4 text-red-500' />;
      }
    }
  },
  {
    accessorKey: 'frm34_status',
    header: 'FRM34',
    cell: ({ row }) => {
      const status = row.original.frm34_status;
      const score = row.original.frm34_score;

      if (status === 'completed') {
        return (
          <div className='flex items-center gap-2'>
            <Check className='h-4 w-4 text-green-500' />
            <span className='text-muted-foreground text-sm'>
              {score || 'Done'}
            </span>
          </div>
        );
      } else if (status === 'in_progress') {
        return (
          <div className='flex items-center gap-2'>
            <Clock className='h-4 w-4 text-yellow-500' />
          </div>
        );
      } else {
        return <X className='h-4 w-4 text-red-500' />;
      }
    }
  },
  {
    accessorKey: 'frm35_score',
    header: 'FRM35',
    cell: ({ row }) => {
      const status = row.original.frm35_status;
      const score = row.original.frm35_score;

      if (status === 'completed' && score !== null) {
        return (
          <div className='flex items-center gap-2'>
            <Check className='h-4 w-4 text-green-500' />
            <span className='font-medium'>{score}</span>
          </div>
        );
      } else if (status === 'in_progress') {
        return (
          <div className='flex items-center gap-2'>
            <Clock className='h-4 w-4 text-yellow-500' />
            <span className='text-muted-foreground text-sm'>In Progress</span>
          </div>
        );
      } else {
        return (
          <div className='flex items-center gap-2'>
            <X className='h-4 w-4 text-red-500' />
            <span className='text-muted-foreground text-sm'>Pending</span>
          </div>
        );
      }
    }
  },
  {
    accessorKey: 'progress_percentage',
    header: 'Progress',
    cell: ({ row }) => {
      const progress = row.original.progress_percentage;
      let color = 'bg-red-500';
      if (progress === 100) color = 'bg-green-500';
      else if (progress > 50) color = 'bg-yellow-500';
      else if (progress > 0) color = 'bg-orange-500';

      return (
        <div className='flex items-center gap-3'>
          <Progress value={progress} className='w-[80px]' />
          <span className='text-muted-foreground min-w-[45px] text-sm font-medium'>
            {progress}%
          </span>
        </div>
      );
    }
  },
  {
    accessorKey: 'final_score',
    header: 'Final Score',
    cell: ({ row }) => {
      const score = row.original.final_score;
      if (score === null) {
        return <span className='text-muted-foreground'>--</span>;
      }

      let badgeClass = 'bg-green-500 text-white';
      if (score < 50) badgeClass = 'bg-red-500 text-white';
      else if (score < 75) badgeClass = 'bg-yellow-500 text-white';

      return (
        <Badge variant='outline' className={badgeClass}>
          <span className='text-base font-bold'>{score.toFixed(1)}</span>
        </Badge>
      );
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const evaluation = row.original;

      return (
        <Button
          variant='ghost'
          size='sm'
          asChild
          disabled={!evaluation.answers_available}
        >
          <Link href={`/dashboard/evaluations/${evaluation.id}`}>
            <Eye className='mr-2 h-4 w-4' />
            View Answers
          </Link>
        </Button>
      );
    }
  }
];
