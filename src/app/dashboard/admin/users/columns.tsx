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
import { MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';
import type { Profile } from '@/types/api';
import { getRoleName } from '@/lib/auth-utils';

export const usersColumns: ColumnDef<Profile>[] = [
  {
    accessorKey: 'full_name',
    header: 'Name',
    cell: ({ row }) => {
      return (
        <div className='flex flex-col'>
          <span className='font-medium'>{row.original.full_name}</span>
          <span className='text-muted-foreground text-xs'>
            {row.original.username}
          </span>
        </div>
      );
    }
  },
  {
    accessorKey: 'role_id',
    header: 'Role',
    cell: ({ row }) => {
      const roleName = getRoleName(row.original.role_id);
      const roleColors: Record<string, string> = {
        'SNSD Admin':
          'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
        'Company Admin':
          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        'HSE Specialist':
          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        'Contractor Admin':
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        Supervisor:
          'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
        Worker: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      };
      return (
        <Badge className={roleColors[roleName] || ''} variant='outline'>
          {roleName}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'department',
    header: 'Department',
    cell: ({ row }) => {
      return <span className='text-sm'>{row.original.department || '-'}</span>;
    }
  },
  {
    accessorKey: 'job_title',
    header: 'Job Title',
    cell: ({ row }) => {
      return <span className='text-sm'>{row.original.job_title || '-'}</span>;
    }
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.original.is_active;
      return (
        <div className='flex items-center gap-2'>
          {isActive ? (
            <>
              <CheckCircle className='h-4 w-4 text-green-600' />
              <span className='text-sm text-green-600'>Active</span>
            </>
          ) : (
            <>
              <XCircle className='h-4 w-4 text-red-600' />
              <span className='text-sm text-red-600'>Inactive</span>
            </>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: 'last_login_at',
    header: 'Last Login',
    cell: ({ row }) => {
      const lastLogin = row.original.last_login_at;
      if (!lastLogin)
        return <span className='text-muted-foreground text-sm'>Never</span>;

      const date = new Date(lastLogin);
      return (
        <span className='text-sm'>
          {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </span>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const user = row.original;
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
              onClick={() => navigator.clipboard.writeText(user.id)}
            >
              Copy user ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => meta?.onEdit?.(user)}>
              Edit user
            </DropdownMenuItem>
            {user.is_active ? (
              <DropdownMenuItem
                onClick={() => meta?.onDeactivate?.(user.id)}
                className='text-red-600'
              >
                Deactivate user
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => meta?.onActivate?.(user.id)}
                className='text-green-600'
              >
                Activate user
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
