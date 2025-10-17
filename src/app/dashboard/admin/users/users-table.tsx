'use client';

import { DataTable } from '@/components/ui/data-table';
import { AdminUser } from '@/hooks/useUsersAdmin';
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
import { MoreHorizontal, Pencil, Trash2, Key, UserPlus } from 'lucide-react';
import { Can } from '@/contexts/PermissionContext';

interface UsersTableProps {
  users: AdminUser[];
  isLoading: boolean;
  onEdit?: (user: AdminUser) => void;
  onDelete?: (userId: string) => void;
  onResetPassword?: (userId: string) => void;
  onManageTenants?: (user: AdminUser) => void;
}

export function UsersTable({
  users,
  isLoading,
  onEdit,
  onDelete,
  onResetPassword,
  onManageTenants
}: UsersTableProps) {
  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: 'full_name',
      header: 'Name',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className='flex flex-col'>
            <span className='font-medium'>{user.full_name}</span>
            <span className='text-muted-foreground text-sm'>{user.email}</span>
          </div>
        );
      }
    },
    {
      accessorKey: 'roles',
      header: 'Role',
      cell: ({ row }) => {
        const role = row.original.roles;
        if (!role) {
          return <span className='text-muted-foreground'>-</span>;
        }
        // Different colors for different role levels
        const getRoleColor = (roleId: number) => {
          if (roleId <= 1)
            return 'bg-purple-100 text-purple-800 hover:bg-purple-100'; // Admin
          if (roleId === 2)
            return 'bg-blue-100 text-blue-800 hover:bg-blue-100'; // HSE Manager
          if (roleId === 3)
            return 'bg-teal-100 text-teal-800 hover:bg-teal-100'; // HSE Specialist
          return 'bg-orange-100 text-orange-800 hover:bg-orange-100'; // Contractor
        };
        return <Badge className={getRoleColor(role.id)}>{role.name}</Badge>;
      }
    },
    {
      accessorKey: 'tenant',
      header: 'Tenant',
      cell: ({ row }) => {
        const tenant = row.original.tenant;
        return tenant ? (
          <span>{tenant.name}</span>
        ) : (
          <span className='text-muted-foreground'>No tenant</span>
        );
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const statusConfig = {
          active: {
            label: 'Active',
            className: 'bg-green-100 text-green-800 hover:bg-green-100'
          },
          inactive: {
            label: 'Inactive',
            className: 'bg-gray-100 text-gray-800 hover:bg-gray-100'
          },
          suspended: {
            label: 'Suspended',
            className: 'bg-red-100 text-red-800 hover:bg-red-100'
          }
        };
        const config =
          statusConfig[status as keyof typeof statusConfig] ||
          statusConfig.inactive;
        return <Badge className={config.className}>{config.label}</Badge>;
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
      cell: ({ row }) => {
        const user = row.original;

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
              <DropdownMenuSeparator />
              <Can permission='users.update'>
                <DropdownMenuItem onClick={() => onEdit?.(user)}>
                  <Pencil className='mr-2 h-4 w-4' />
                  Edit
                </DropdownMenuItem>
              </Can>
              <Can permission='users.reset_password'>
                <DropdownMenuItem onClick={() => onResetPassword?.(user.id)}>
                  <Key className='mr-2 h-4 w-4' />
                  Reset Password
                </DropdownMenuItem>
              </Can>
              <Can permission='tenants.users.manage'>
                <DropdownMenuItem onClick={() => onManageTenants?.(user)}>
                  <UserPlus className='mr-2 h-4 w-4' />
                  Manage Tenants
                </DropdownMenuItem>
              </Can>
              <DropdownMenuSeparator />
              <Can permission='users.delete'>
                <DropdownMenuItem
                  onClick={() => onDelete?.(user.id)}
                  className='text-destructive'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete
                </DropdownMenuItem>
              </Can>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-muted-foreground'>Loading users...</div>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={users}
      searchKey='full_name'
      searchPlaceholder='Search users...'
    />
  );
}
