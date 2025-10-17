'use client';

import { useState } from 'react';
import {
  Plus,
  Search,
  Users as UsersIcon,
  UserCheck,
  UserX,
  Ban
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  useAdminUsers,
  useDeleteAdminUser,
  useResetUserPassword,
  useUpdateAdminUser,
  AdminUser
} from '@/hooks/useUsersAdmin';
import { useRoles } from '@/hooks/useRoles';
import { useTenants } from '@/hooks/useTenants';
import { UsersTable } from './users-table';
import { CreateUserDialog } from './create-user-dialog';
import { EditUserDialog } from './edit-user-dialog';
import { ManageTenantsDialog } from './manage-tenants-dialog';
import { Can } from '@/contexts/PermissionContext';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tenantFilter, setTenantFilter] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [manageTenantsDialogOpen, setManageTenantsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Build filters
  const filters = {
    search: search || undefined,
    role_id: roleFilter !== 'all' ? parseInt(roleFilter) : undefined,
    status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
    tenant_id: tenantFilter !== 'all' ? tenantFilter : undefined
  };

  const { data: users, isLoading } = useAdminUsers(filters);
  const { data: roles } = useRoles();
  const { tenants } = useTenants();
  const { mutate: deleteUser } = useDeleteAdminUser();
  const { mutate: resetPassword } = useResetUserPassword();
  const { mutate: updateUser } = useUpdateAdminUser();

  const handleEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleManageTenants = (user: AdminUser) => {
    setSelectedUser(user);
    setManageTenantsDialogOpen(true);
  };

  const handleUpdateUser = (userId: string, data: any) => {
    updateUser(
      { id: userId, data },
      {
        onSuccess: () => {
          toast.success('User updated successfully');
          setEditDialogOpen(false);
        },
        onError: (error: any) =>
          toast.error(error.message || 'Failed to update user')
      }
    );
  };

  const handleDelete = (userId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this user? This will deactivate their account.'
      )
    ) {
      return;
    }
    deleteUser(userId, {
      onSuccess: () => toast.success('User deleted successfully'),
      onError: (error: any) =>
        toast.error(error.message || 'Failed to delete user')
    });
  };

  const handleResetPassword = (userId: string) => {
    if (!confirm('Send password reset email to this user?')) {
      return;
    }
    resetPassword(userId, {
      onSuccess: () => toast.success('Password reset email sent'),
      onError: (error: any) =>
        toast.error(error.message || 'Failed to send reset email')
    });
  };

  const handleImpersonate = (user: AdminUser) => {
    if (
      !confirm(
        `Login as ${user.full_name}? This will open a new tab where you'll be logged in as this user.`
      )
    ) {
      return;
    }

    // Create impersonation token and open in new tab
    const impersonateUrl = `/api/admin/impersonate?userId=${user.id}`;
    window.open(impersonateUrl, '_blank');
    toast.success(`Opening session as ${user.full_name}...`);
  };

  // Stats
  const activeUsers = users?.filter((u) => u.status === 'active').length || 0;
  const inactiveUsers =
    users?.filter((u) => u.status === 'inactive').length || 0;
  const suspendedUsers =
    users?.filter((u) => u.status === 'suspended').length || 0;

  return (
    <div className='space-y-8 p-8 pt-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>User Management</h1>
          <p className='text-muted-foreground mt-2'>
            Manage all users across all tenants
          </p>
        </div>
        <Can permission='users.create'>
          <Button onClick={() => setCreateDialogOpen(true)} size='lg'>
            <Plus className='mr-2 h-5 w-5' />
            Create User
          </Button>
        </Can>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card className='border-l-4 border-l-blue-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            <UsersIcon className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{users?.length || 0}</div>
            <p className='text-muted-foreground mt-1 text-xs'>
              All registered users
            </p>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-green-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active</CardTitle>
            <UserCheck className='h-4 w-4 text-green-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {activeUsers}
            </div>
            <p className='text-muted-foreground mt-1 text-xs'>
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-gray-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Inactive</CardTitle>
            <UserX className='h-4 w-4 text-gray-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-gray-600'>
              {inactiveUsers}
            </div>
            <p className='text-muted-foreground mt-1 text-xs'>Not active</p>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-red-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Suspended</CardTitle>
            <Ban className='h-4 w-4 text-red-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {suspendedUsers}
            </div>
            <p className='text-muted-foreground mt-1 text-xs'>
              Access suspended
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className='pb-4'>
          <CardTitle className='text-lg'>Filters</CardTitle>
          <CardDescription>
            Filter users by role, status, tenant, or search by name/email
          </CardDescription>
        </CardHeader>
        <CardContent className='pt-0'>
          <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-4'>
            {/* Search */}
            <div className='relative'>
              <Search className='text-muted-foreground absolute top-2.5 left-2 h-4 w-4' />
              <Input
                placeholder='Search by name or email...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='pl-8'
              />
            </div>

            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder='All Roles' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Roles</SelectItem>
                {roles?.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder='All Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='inactive'>Inactive</SelectItem>
                <SelectItem value='suspended'>Suspended</SelectItem>
              </SelectContent>
            </Select>

            {/* Tenant Filter */}
            <Select value={tenantFilter} onValueChange={setTenantFilter}>
              <SelectTrigger>
                <SelectValue placeholder='All Tenants' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Tenants</SelectItem>
                {tenants?.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className='pt-6'>
          <UsersTable
            users={users || []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onResetPassword={handleResetPassword}
            onManageTenants={handleManageTenants}
            onImpersonate={handleImpersonate}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {selectedUser && (
        <>
          <EditUserDialog
            user={selectedUser}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSave={handleUpdateUser}
          />
          <ManageTenantsDialog
            user={selectedUser}
            open={manageTenantsDialogOpen}
            onOpenChange={setManageTenantsDialogOpen}
          />
        </>
      )}
    </div>
  );
}
