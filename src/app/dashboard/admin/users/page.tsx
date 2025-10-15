'use client';

import { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { useProfile } from '@/hooks/useProfile';
import { DataTable } from '@/components/ui/data-table';
import { usersColumns } from './columns';
import { EditUserDialog } from './edit-user-dialog';
import type { Profile } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserX, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function UsersManagementPage() {
  const { profile } = useProfile();
  const tenantId = profile?.tenant_id || '';

  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const {
    users,
    isLoading,
    error,
    updateUserAsync,
    activateUser,
    deactivateUser
  } = useUsers({ tenantId, filters: { limit: 200 } });

  const handleEdit = (user: Profile) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const handleSave = async (userId: string, data: any) => {
    try {
      await updateUserAsync({ userId, data });
      toast.success('User updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user');
    }
  };

  const handleActivate = (userId: string) => {
    activateUser(userId, {
      onSuccess: () => toast.success('User activated'),
      onError: (error: any) =>
        toast.error(error.message || 'Failed to activate user')
    });
  };

  const handleDeactivate = (userId: string) => {
    deactivateUser(userId, {
      onSuccess: () => toast.success('User deactivated'),
      onError: (error: any) =>
        toast.error(error.message || 'Failed to deactivate user')
    });
  };

  if (isLoading) {
    return (
      <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center p-4'>
        <div className='text-muted-foreground'>Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center p-4'>
        <div className='text-destructive'>
          Error loading users: {error.message}
        </div>
      </div>
    );
  }

  const activeUsers = users.filter((u) => u.is_active);
  const inactiveUsers = users.filter((u) => !u.is_active);
  const adminUsers = users.filter((u) => u.role_id <= 1);

  return (
    <div className='flex-1 space-y-6 p-4 pt-6 md:p-8'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Users Management</h2>
        <p className='text-muted-foreground'>
          Manage user accounts, roles, and permissions across your organization
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            <Users className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{users.length}</div>
            <p className='text-muted-foreground text-xs'>
              Registered in tenant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Users</CardTitle>
            <UserCheck className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {activeUsers.length}
            </div>
            <p className='text-muted-foreground text-xs'>
              Currently active accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Inactive Users
            </CardTitle>
            <UserX className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {inactiveUsers.length}
            </div>
            <p className='text-muted-foreground text-xs'>
              Deactivated accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Administrators
            </CardTitle>
            <Shield className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-purple-600'>
              {adminUsers.length}
            </div>
            <p className='text-muted-foreground text-xs'>Admin-level access</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <DataTable
        columns={usersColumns}
        data={users}
        searchKey='full_name'
        meta={{
          onEdit: handleEdit,
          onActivate: handleActivate,
          onDeactivate: handleDeactivate
        }}
      />

      {/* Edit Dialog */}
      <EditUserDialog
        user={selectedUser}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSave={handleSave}
      />
    </div>
  );
}
