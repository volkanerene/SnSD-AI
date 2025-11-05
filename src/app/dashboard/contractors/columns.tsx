'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { Contractor } from '@/types/api';
import { formatDate } from '@/lib/format';
import { ContractorActionsCell } from '@/app/dashboard/contractors/contractor-actions-cell';

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

export const contractorsColumns = (
  selectedIds: string[],
  setSelectedIds: (ids: string[]) => void
): ColumnDef<Contractor>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => {
          table.toggleAllPageRowsSelected(!!value);
          if (value) {
            const allIds = table
              .getRowModel()
              .rows.map((row) => row.original.id);
            setSelectedIds(allIds);
          } else {
            setSelectedIds([]);
          }
        }}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={selectedIds.includes(row.original.id)}
        onCheckedChange={(value) => {
          if (value) {
            setSelectedIds([...selectedIds, row.original.id]);
          } else {
            setSelectedIds(selectedIds.filter((id) => id !== row.original.id));
          }
        }}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
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
    accessorKey: 'tenant_name',
    header: 'Tenant',
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='text-sm'>{row.original.tenant_name || 'N/A'}</span>
        {row.original.tenant_id && (
          <span className='text-muted-foreground text-xs'>
            ID: {row.original.tenant_id.slice(0, 8)}...
          </span>
        )}
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
    cell: ({ row }) => <ContractorActionsCell contractor={row.original} />
  }
];
