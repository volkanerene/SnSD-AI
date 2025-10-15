'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import type { Contractor } from '@/types/api';
import { formatDate } from '@/lib/format';

const statusColors = {
  active: 'bg-green-500',
  inactive: 'bg-gray-500',
  blacklisted: 'bg-red-500'
};

const riskColors = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500'
};

export const contractorsColumns: ColumnDef<Contractor>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='font-medium'>{row.original.name}</span>
        <span className='text-muted-foreground text-xs'>
          {row.original.tax_number}
        </span>
      </div>
    )
  },
  {
    accessorKey: 'contact_person',
    header: 'Contact',
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span>{row.original.contact_person}</span>
        <span className='text-muted-foreground text-xs'>
          {row.original.contact_email}
        </span>
      </div>
    )
  },
  {
    accessorKey: 'city',
    header: 'Location',
    cell: ({ row }) => `${row.original.city}, ${row.original.country}`
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
          {status}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'risk_level',
    header: 'Risk Level',
    cell: ({ row }) => {
      const risk = row.original.risk_level;
      if (!risk) return <span className='text-muted-foreground'>-</span>;
      return (
        <Badge
          variant='outline'
          className={`${riskColors[risk]} text-white uppercase`}
        >
          {risk}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'last_evaluation_score',
    header: 'Last Score',
    cell: ({ row }) => {
      const score = row.original.last_evaluation_score;
      if (!score) return <span className='text-muted-foreground'>-</span>;
      return <span className='font-medium'>{score.toFixed(1)}</span>;
    }
  },
  {
    accessorKey: 'last_evaluation_date',
    header: 'Last Evaluation',
    cell: ({ row }) => {
      const date = row.original.last_evaluation_date;
      if (!date) return <span className='text-muted-foreground'>-</span>;
      return formatDate(date);
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const contractor = row.original;

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
              onClick={() => navigator.clipboard.writeText(contractor.id)}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Pencil className='mr-2 h-4 w-4' />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className='text-red-600'>
              <Trash className='mr-2 h-4 w-4' />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
