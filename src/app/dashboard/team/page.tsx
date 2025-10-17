'use client';

import { useState } from 'react';
import {
  UserPlus,
  Users,
  UserCheck,
  UserX,
  MoreHorizontal,
  Pencil,
  Trash2,
  Power
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Can } from '@/contexts/PermissionContext';
import {
  useTeamMembers,
  useTeamStats,
  useRemoveTeamMember,
  useToggleTeamMemberStatus,
  TeamMember
} from '@/hooks/useTeam';
import { useRoles } from '@/hooks/useRoles';
import { AddTeamMemberDialog } from './add-team-member-dialog';
import { EditTeamMemberDialog } from './edit-team-member-dialog';
import { toast } from 'sonner';

export default function TeamPage() {
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const filters = {
    role_id: roleFilter !== 'all' ? parseInt(roleFilter) : undefined,
    status:
      statusFilter !== 'all'
        ? (statusFilter as 'active' | 'inactive')
        : undefined
  };

  const { data: members, isLoading } = useTeamMembers(filters);
  const { data: stats } = useTeamStats();
  const { data: roles } = useRoles();
  const { mutate: removeMember } = useRemoveTeamMember();
  const { mutate: toggleStatus } = useToggleTeamMemberStatus();

  const handleEdit = (member: TeamMember) => {
    setSelectedMember(member);
    setEditDialogOpen(true);
  };

  const handleRemove = (userId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from your team?`)) return;

    removeMember(userId, {
      onSuccess: () => toast.success('Team member removed successfully'),
      onError: (error: any) =>
        toast.error(error.message || 'Failed to remove team member')
    });
  };

  const handleToggleStatus = (
    userId: string,
    currentStatus: boolean,
    memberName: string
  ) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} ${memberName}?`)) return;

    toggleStatus(
      { userId, isActive: !currentStatus },
      {
        onSuccess: () => toast.success(`Team member ${action}d successfully`),
        onError: (error: any) =>
          toast.error(error.message || `Failed to ${action} team member`)
      }
    );
  };

  const columns: ColumnDef<TeamMember>[] = [
    {
      accessorKey: 'full_name',
      header: 'Member',
      cell: ({ row }) => {
        const member = row.original;
        const initials = member.full_name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase();

        return (
          <div className='flex items-center gap-3'>
            <Avatar>
              <AvatarImage src={member.avatar_url} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className='font-medium'>{member.full_name}</div>
              <div className='text-muted-foreground text-sm'>
                {member.email}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role = row.original.role;
        return role ? (
          <Badge variant='outline'>{role.name}</Badge>
        ) : (
          <span className='text-muted-foreground'>-</span>
        );
      }
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => (
        <span className='text-sm'>{row.original.department || '-'}</span>
      )
    },
    {
      accessorKey: 'job_title',
      header: 'Job Title',
      cell: ({ row }) => (
        <span className='text-sm'>{row.original.job_title || '-'}</span>
      )
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.original.is_active;
        return (
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'joined_at',
      header: 'Joined',
      cell: ({ row }) => {
        const date = new Date(row.original.joined_at);
        return <span className='text-sm'>{date.toLocaleDateString()}</span>;
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const member = row.original;

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
              <Can permission='tenants.users.manage'>
                <DropdownMenuItem onClick={() => handleEdit(member)}>
                  <Pencil className='mr-2 h-4 w-4' />
                  Edit Member
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    handleToggleStatus(
                      member.user_id,
                      member.is_active,
                      member.full_name
                    )
                  }
                >
                  <Power className='mr-2 h-4 w-4' />
                  {member.is_active ? 'Deactivate' : 'Activate'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleRemove(member.user_id, member.full_name)}
                  className='text-destructive'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Remove
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
          <div className='text-muted-foreground'>Loading team members...</div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-8 p-8 pt-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Team</h1>
          <p className='text-muted-foreground mt-2'>
            Manage your organization&apos;s team members
          </p>
        </div>
        <Can permission='tenants.users.manage'>
          <Button onClick={() => setAddDialogOpen(true)} size='lg'>
            <UserPlus className='mr-2 h-5 w-5' />
            Add Member
          </Button>
        </Can>
      </div>

      {/* Stats */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card className='border-l-4 border-l-blue-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Members</CardTitle>
            <Users className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats?.total_members || 0}
            </div>
            <p className='text-muted-foreground mt-1 text-xs'>Team size</p>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-green-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active</CardTitle>
            <UserCheck className='h-4 w-4 text-green-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {stats?.active_members || 0}
            </div>
            <p className='text-muted-foreground mt-1 text-xs'>
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-orange-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Inactive</CardTitle>
            <UserX className='h-4 w-4 text-orange-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-orange-600'>
              {stats?.inactive_members || 0}
            </div>
            <p className='text-muted-foreground mt-1 text-xs'>Not active</p>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-purple-500'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Roles</CardTitle>
            <Users className='h-4 w-4 text-purple-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-purple-600'>
              {Object.keys(stats?.by_role || {}).length}
            </div>
            <p className='text-muted-foreground mt-1 text-xs'>
              Different roles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className='pb-4'>
          <CardTitle className='text-lg'>Filters</CardTitle>
        </CardHeader>
        <CardContent className='pt-0'>
          <div className='flex gap-3'>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className='w-[200px]'>
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-[200px]'>
                <SelectValue placeholder='All Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='inactive'>Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className='pt-6'>
          <DataTable
            columns={columns}
            data={members || []}
            searchKey='full_name'
            searchPlaceholder='Search members...'
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddTeamMemberDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />

      {selectedMember && (
        <EditTeamMemberDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          member={selectedMember}
        />
      )}
    </div>
  );
}
