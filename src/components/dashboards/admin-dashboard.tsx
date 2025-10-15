'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useProfile } from '@/hooks/useProfile';
import { useTenants } from '@/hooks/useTenants';
import { useUsers } from '@/hooks/useUsers';
import { useContractors } from '@/hooks/useContractors';
import { useSubmissions } from '@/hooks/useSubmissions';
import {
  Building2,
  Users,
  Shield,
  FileText,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

/**
 * Dashboard for SNSD Admin (Role 1) and Company Admin (Role 2)
 * Shows platform-wide or company-wide statistics
 */
export function AdminDashboard() {
  const { profile } = useProfile();
  const tenantId = profile?.tenant_id || '';
  const isSNSDAdmin = profile?.role_id === 1;

  // Fetch data
  const { tenants } = useTenants();
  const { users } = useUsers({ tenantId });
  const { contractors } = useContractors({ tenantId });
  const { submissions } = useSubmissions(tenantId, { limit: 100 });

  // Calculate stats
  const activeTenants =
    tenants?.filter((t) => t.status === 'active').length || 0;
  const totalUsers = users?.length || 0;
  const activeContractors =
    contractors?.filter((c) => c.status === 'active').length || 0;
  const pendingEvaluations =
    submissions?.filter((s) => s.status === 'in_review').length || 0;
  const completedEvaluations =
    submissions?.filter((s) => s.status === 'completed').length || 0;

  return (
    <div className='space-y-6'>
      {/* Welcome Card */}
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>
          {isSNSDAdmin ? 'Platform Overview' : 'Company Dashboard'}
        </h2>
        <p className='text-muted-foreground'>
          Welcome back, {profile?.full_name}
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {isSNSDAdmin && (
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Tenants
              </CardTitle>
              <Building2 className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{tenants?.length || 0}</div>
              <p className='text-muted-foreground text-xs'>
                {activeTenants} active
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            <Users className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalUsers}</div>
            <p className='text-muted-foreground text-xs'>
              {users?.filter((u) => u.is_active).length || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Contractors</CardTitle>
            <Shield className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{contractors?.length || 0}</div>
            <p className='text-muted-foreground text-xs'>
              {activeContractors} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Evaluations</CardTitle>
            <FileText className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{submissions?.length || 0}</div>
            <p className='text-muted-foreground text-xs'>
              {pendingEvaluations} pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <Card className='col-span-4'>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              {isSNSDAdmin
                ? 'Platform management actions'
                : 'Company management actions'}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {isSNSDAdmin && (
              <Link
                href='/dashboard/admin/tenants'
                className='hover:bg-accent flex items-center justify-between rounded-lg border p-3 transition-colors'
              >
                <div>
                  <p className='font-medium'>Manage Tenants</p>
                  <p className='text-muted-foreground text-sm'>
                    View and manage all tenant organizations
                  </p>
                </div>
                <Building2 className='text-muted-foreground h-5 w-5' />
              </Link>
            )}

            <Link
              href='/dashboard/admin/users'
              className='hover:bg-accent flex items-center justify-between rounded-lg border p-3 transition-colors'
            >
              <div>
                <p className='font-medium'>Manage Users</p>
                <p className='text-muted-foreground text-sm'>
                  {isSNSDAdmin ? 'All platform users' : 'Manage company users'}
                </p>
              </div>
              <Users className='text-muted-foreground h-5 w-5' />
            </Link>

            <Link
              href='/dashboard/contractors'
              className='hover:bg-accent flex items-center justify-between rounded-lg border p-3 transition-colors'
            >
              <div>
                <p className='font-medium'>Contractor Management</p>
                <p className='text-muted-foreground text-sm'>
                  View and manage contractors
                </p>
              </div>
              <Shield className='text-muted-foreground h-5 w-5' />
            </Link>

            <Link
              href='/dashboard/evaluations'
              className='hover:bg-accent flex items-center justify-between rounded-lg border p-3 transition-colors'
            >
              <div>
                <p className='font-medium'>FRM-32 Evaluations</p>
                <p className='text-muted-foreground text-sm'>
                  Review contractor safety evaluations
                </p>
              </div>
              <FileText className='text-muted-foreground h-5 w-5' />
            </Link>
          </CardContent>
        </Card>

        <Card className='col-span-3'>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Platform health and alerts</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-start gap-3'>
              <TrendingUp className='mt-0.5 h-5 w-5 text-green-600' />
              <div>
                <p className='text-sm font-medium'>System Operational</p>
                <p className='text-muted-foreground text-xs'>
                  All services running normally
                </p>
              </div>
            </div>

            {pendingEvaluations > 0 && (
              <div className='flex items-start gap-3'>
                <AlertTriangle className='mt-0.5 h-5 w-5 text-orange-600' />
                <div>
                  <p className='text-sm font-medium'>
                    {pendingEvaluations} Pending Reviews
                  </p>
                  <p className='text-muted-foreground text-xs'>
                    Evaluations awaiting review
                  </p>
                </div>
              </div>
            )}

            <div className='border-t pt-4'>
              <p className='mb-2 text-sm font-medium'>Recent Activity</p>
              <div className='space-y-2'>
                <p className='text-muted-foreground text-xs'>
                  {completedEvaluations} evaluations completed this month
                </p>
                <p className='text-muted-foreground text-xs'>
                  {activeContractors} contractors currently active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
