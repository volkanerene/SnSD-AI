'use client';

import { useTenants } from '@/hooks/useTenants';
import { DataTable } from '@/components/ui/data-table';
import { tenantsColumns } from './columns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function TenantsManagementPage() {
  const { tenants, isLoading, error, activateTenant, suspendTenant } =
    useTenants();

  const handleActivate = (tenantId: string) => {
    activateTenant(tenantId, {
      onSuccess: () => toast.success('Tenant activated'),
      onError: (error: any) =>
        toast.error(error.message || 'Failed to activate tenant')
    });
  };

  const handleSuspend = (tenantId: string) => {
    suspendTenant(tenantId, {
      onSuccess: () => toast.success('Tenant suspended'),
      onError: (error: any) =>
        toast.error(error.message || 'Failed to suspend tenant')
    });
  };

  if (isLoading) {
    return (
      <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center p-4'>
        <div className='text-muted-foreground'>Loading tenants...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center p-4'>
        <div className='text-destructive'>
          Error loading tenants: {error.message}
        </div>
      </div>
    );
  }

  const activeTenants = tenants.filter((t) => t.status === 'active');
  const suspendedTenants = tenants.filter((t) => t.status === 'suspended');
  const inactiveTenants = tenants.filter((t) => t.status === 'inactive');

  return (
    <div className='flex-1 space-y-6 p-4 pt-6 md:p-8'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>
          Tenants Management
        </h2>
        <p className='text-muted-foreground'>
          Manage tenant organizations, subscriptions, and access controls
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Tenants</CardTitle>
            <Building2 className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{tenants.length}</div>
            <p className='text-muted-foreground text-xs'>
              Registered organizations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active</CardTitle>
            <CheckCircle className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {activeTenants.length}
            </div>
            <p className='text-muted-foreground text-xs'>
              Currently operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Suspended</CardTitle>
            <AlertTriangle className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-orange-600'>
              {suspendedTenants.length}
            </div>
            <p className='text-muted-foreground text-xs'>
              Temporarily disabled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Inactive</CardTitle>
            <XCircle className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {inactiveTenants.length}
            </div>
            <p className='text-muted-foreground text-xs'>Not operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Tenants Table */}
      <DataTable
        columns={tenantsColumns}
        data={tenants}
        searchKey='name'
        meta={{
          onActivate: handleActivate,
          onSuspend: handleSuspend,
          onEdit: (tenant: any) => console.log('Edit:', tenant),
          onViewDetails: (tenant: any) => console.log('View:', tenant)
        }}
      />
    </div>
  );
}
