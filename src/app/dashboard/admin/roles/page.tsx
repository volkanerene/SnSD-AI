'use client';

import { useState } from 'react';
import { Plus, Shield, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Can } from '@/contexts/PermissionContext';
import { useRoles, useDeleteRole } from '@/hooks/useRoles';
import { CreateRoleDialog } from './create-role-dialog';
import { EditRoleDialog } from './edit-role-dialog';
import { ManagePermissionsDialog } from './manage-permissions-dialog';
import { toast } from 'sonner';
import type { Role } from '@/types/api';

export default function RolesPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const { data: roles, isLoading } = useRoles();
  const { mutate: deleteRole } = useDeleteRole();

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setEditDialogOpen(true);
  };

  const handleManagePermissions = (role: Role) => {
    setSelectedRole(role);
    setPermissionsDialogOpen(true);
  };

  const handleDelete = (roleId: number) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    deleteRole(roleId, {
      onSuccess: () => toast.success('Role deleted successfully'),
      onError: (error: any) =>
        toast.error(error.message || 'Failed to delete role')
    });
  };

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: 'name',
      header: 'Role Name',
      cell: ({ row }) => {
        const role = row.original;
        return (
          <div className='flex items-center gap-2'>
            <Shield className='text-muted-foreground h-4 w-4' />
            <div>
              <div className='font-medium'>{role.name}</div>
              <div className='text-muted-foreground text-sm'>{role.slug}</div>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className='text-muted-foreground text-sm'>
          {row.original.description || '-'}
        </span>
      )
    },
    {
      accessorKey: 'level',
      header: 'Level',
      cell: ({ row }) => {
        const level = row.original.level;
        const levelNames: Record<number, string> = {
          0: 'SnSD Admin',
          1: 'Company Admin',
          2: 'HSE Manager',
          3: 'HSE Specialist',
          4: 'Contractor'
        };
        return (
          <Badge variant='outline'>
            Level {level} - {levelNames[level] || 'Unknown'}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'permissions',
      header: 'Permissions',
      cell: ({ row }) => {
        const count = row.original.permissions?.length || 0;
        return (
          <div className='flex items-center gap-2'>
            <Badge variant='secondary'>{count} permissions</Badge>
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
      cell: ({ row }) => {
        const role = row.original;

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
              <Can permission='roles.update'>
                <DropdownMenuItem onClick={() => handleEdit(role)}>
                  <Pencil className='mr-2 h-4 w-4' />
                  Edit Role
                </DropdownMenuItem>
              </Can>
              <Can permission='permissions.assign'>
                <DropdownMenuItem onClick={() => handleManagePermissions(role)}>
                  <Shield className='mr-2 h-4 w-4' />
                  Manage Permissions
                </DropdownMenuItem>
              </Can>
              <DropdownMenuSeparator />
              <Can permission='roles.delete'>
                <DropdownMenuItem
                  onClick={() => handleDelete(role.id)}
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
      <div className='container mx-auto py-6'>
        <div className='flex items-center justify-center p-8'>
          <div className='text-muted-foreground'>Loading roles...</div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto space-y-6 py-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Roles & Permissions
          </h1>
          <p className='text-muted-foreground'>
            Manage user roles and their permission assignments
          </p>
        </div>
        <Can permission='roles.create'>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className='mr-2 h-4 w-4' />
            Create Role
          </Button>
        </Can>
      </div>

      {/* Stats */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Total Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{roles?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Admin Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>
              {roles?.filter((r) => r.level <= 1).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>User Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {roles?.filter((r) => r.level > 1).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className='pt-6'>
          <DataTable
            columns={columns}
            data={roles || []}
            searchKey='name'
            searchPlaceholder='Search roles...'
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateRoleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {selectedRole && (
        <>
          <EditRoleDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            role={selectedRole}
          />
          <ManagePermissionsDialog
            open={permissionsDialogOpen}
            onOpenChange={setPermissionsDialogOpen}
            role={selectedRole}
          />
        </>
      )}
    </div>
  );
}
