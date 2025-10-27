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
import { MoreHorizontal, Building2, Crown } from 'lucide-react';
import type { Tenant } from '@/types/api';
import { toast } from 'sonner';

export const tenantsColumns: ColumnDef<Tenant>[] = [
  {
    accessorKey: 'name',
    header: 'Tenant Name',
    cell: ({ row }) => {
      return (
        <div className='flex items-center gap-2'>
          <Building2 className='text-muted-foreground h-4 w-4' />
          <div className='flex flex-col'>
            <span className='font-medium'>{row.original.name}</span>
            <span className='text-muted-foreground text-xs'>
              {row.original.subdomain}.snsd.com
            </span>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: 'license_plan',
    header: 'Plan',
    cell: ({ row }) => {
      const plan = row.original.license_plan;
      const planColors: Record<string, string> = {
        basic: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
        professional:
          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        enterprise:
          'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      };
      return (
        <Badge className={planColors[plan]} variant='outline'>
          {plan === 'enterprise' && <Crown className='mr-1 h-3 w-3' />}
          {plan.toUpperCase()}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      const statusColors: Record<string, string> = {
        active:
          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        inactive:
          'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
        suspended: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      };
      return (
        <Badge className={statusColors[status]} variant='outline'>
          {status.toUpperCase()}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'max_users',
    header: 'Users Limit',
    cell: ({ row }) => {
      return <span className='text-sm'>∞</span>;
    }
  },
  {
    accessorKey: 'max_contractors',
    header: 'Contractors Limit',
    cell: ({ row }) => {
      return <span className='text-sm'>∞</span>;
    }
  },
  {
    accessorKey: 'max_video_requests_monthly',
    header: 'Video Requests',
    cell: ({ row }) => {
      return <span className='text-sm'>∞</span>;
    }
  },
  {
    accessorKey: 'contact_email',
    header: 'Contact',
    cell: ({ row }) => {
      return (
        <div className='flex flex-col'>
          <span className='text-sm'>{row.original.contact_email}</span>
          {row.original.contact_phone && (
            <span className='text-muted-foreground text-xs'>
              {row.original.contact_phone}
            </span>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: 'created_at',
    header: 'Created',
    cell: ({ row }) => {
      const date = new Date(row.original.created_at);
      return <span className='text-sm'>{date.toLocaleDateString()}</span>;
    }
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const tenant = row.original;
      const meta = table.options.meta as any;

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
              onClick={() => {
                navigator.clipboard.writeText(tenant.id);
                toast.success('Tenant ID copied to clipboard');
              }}
            >
              Copy tenant ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {tenant.status === 'active' ? (
              <DropdownMenuItem
                onClick={() => meta?.onSuspend?.(tenant.id)}
                className='text-orange-600'
              >
                Suspend tenant
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => meta?.onActivate?.(tenant.id)}
                className='text-green-600'
              >
                Activate tenant
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => meta?.onDelete?.(tenant.id)}
              className='text-red-600'
            >
              Delete tenant
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
