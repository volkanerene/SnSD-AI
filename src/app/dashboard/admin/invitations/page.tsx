'use client';

import { useState } from 'react';
import { Plus, Copy, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  useInvitations,
  useCreateInvitation,
  useResendInvitation,
  useCancelInvitation,
  Invitation
} from '@/hooks/useInvitations';
import { useRoles } from '@/hooks/useRoles';
import { useTenants } from '@/hooks/useTenants';
import { Can } from '@/contexts/PermissionContext';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const invitationSchema = z.object({
  email: z.string().email('Invalid email'),
  tenant_id: z.string().min(1, 'Please select a tenant'),
  role_id: z.string().min(1, 'Please select a role')
});

type InvitationFormData = z.infer<typeof invitationSchema>;

export default function InvitationsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const filters = {
    status: statusFilter !== 'all' ? (statusFilter as any) : undefined
  };

  const { data: invitations } = useInvitations(filters);
  const { data: roles } = useRoles();
  const { tenants } = useTenants();
  const { mutateAsync: createInvitation, isPending: isCreating } =
    useCreateInvitation();
  const { mutate: resendInvitation } = useResendInvitation();
  const { mutate: cancelInvitation } = useCancelInvitation();

  const form = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: '',
      tenant_id: '',
      role_id: ''
    }
  });

  const onSubmit = async (data: InvitationFormData) => {
    try {
      await createInvitation({
        email: data.email,
        tenant_id: data.tenant_id,
        role_id: parseInt(data.role_id)
      });
      toast.success('Invitation sent successfully');
      form.reset();
      setCreateDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invitation');
    }
  };

  const handleCopyLink = (token: string) => {
    const link = `${window.location.origin}/accept-invite/${token}`;
    navigator.clipboard.writeText(link);
    toast.success('Invitation link copied to clipboard');
  };

  const handleResend = (invitationId: string) => {
    resendInvitation(invitationId, {
      onSuccess: () => toast.success('Invitation resent successfully'),
      onError: (error: any) =>
        toast.error(error.message || 'Failed to resend invitation')
    });
  };

  const handleCancel = (invitationId: string) => {
    if (!confirm('Cancel this invitation?')) return;
    cancelInvitation(invitationId, {
      onSuccess: () => toast.success('Invitation cancelled'),
      onError: (error: any) =>
        toast.error(error.message || 'Failed to cancel invitation')
    });
  };

  const columns: ColumnDef<Invitation>[] = [
    {
      accessorKey: 'email',
      header: 'Email'
    },
    {
      accessorKey: 'tenant',
      header: 'Tenant',
      cell: ({ row }) => row.original.tenant?.name || '-'
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <Badge variant='outline'>{row.original.role?.name || '-'}</Badge>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            variant={
              status === 'pending'
                ? 'default'
                : status === 'accepted'
                  ? 'secondary'
                  : 'destructive'
            }
          >
            {status}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'expires_at',
      header: 'Expires',
      cell: ({ row }) => {
        const date = new Date(row.original.expires_at);
        const isExpired = date < new Date();
        return (
          <span className={isExpired ? 'text-destructive' : ''}>
            {date.toLocaleDateString()}
          </span>
        );
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const invitation = row.original;
        const isPending = invitation.status === 'pending';

        return (
          <div className='flex items-center gap-2'>
            {isPending && (
              <>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => handleCopyLink(invitation.token)}
                  title='Copy invitation link'
                >
                  <Copy className='h-4 w-4' />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => handleResend(invitation.id)}
                  title='Resend invitation'
                >
                  <RefreshCw className='h-4 w-4' />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => handleCancel(invitation.id)}
                  title='Cancel invitation'
                >
                  <XCircle className='text-destructive h-4 w-4' />
                </Button>
              </>
            )}
          </div>
        );
      }
    }
  ];

  const pendingCount =
    invitations?.filter((i) => i.status === 'pending').length || 0;
  const acceptedCount =
    invitations?.filter((i) => i.status === 'accepted').length || 0;
  const expiredCount =
    invitations?.filter((i) => i.status === 'expired').length || 0;

  return (
    <div className='container mx-auto space-y-6 py-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Invitations</h1>
          <p className='text-muted-foreground'>
            Manage user invitations and onboarding
          </p>
        </div>
        <Can permission='users.invite'>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className='mr-2 h-4 w-4' />
            Send Invitation
          </Button>
        </Can>
      </div>

      {/* Stats */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{invitations?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>
              {pendingCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {acceptedCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {expiredCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-[200px]'>
              <SelectValue placeholder='All Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value='pending'>Pending</SelectItem>
              <SelectItem value='accepted'>Accepted</SelectItem>
              <SelectItem value='expired'>Expired</SelectItem>
              <SelectItem value='cancelled'>Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className='pt-6'>
          <DataTable
            columns={columns}
            data={invitations || []}
            searchKey='email'
            searchPlaceholder='Search by email...'
          />
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Invitation</DialogTitle>
            <DialogDescription>
              Invite a new user to join a tenant
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder='user@example.com' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='tenant_id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tenant</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select tenant' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tenants?.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='role_id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select role' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles?.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isCreating}>
                {isCreating ? 'Sending...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
