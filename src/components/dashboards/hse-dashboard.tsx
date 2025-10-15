'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useProfile } from '@/hooks/useProfile';
import { useContractors } from '@/hooks/useContractors';
import { useSubmissions } from '@/hooks/useSubmissions';
import {
  Shield,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

/**
 * Dashboard for HSE Specialist (Role 3) and Supervisor (Role 5)
 * Focuses on safety evaluations and contractor management
 */
export function HSEDashboard() {
  const { profile } = useProfile();
  const tenantId = profile?.tenant_id || '';
  const isSpecialist = profile?.role_id === 3;

  // Fetch data
  const { contractors } = useContractors({ tenantId });
  const { submissions } = useSubmissions(tenantId, { limit: 100 });

  // Calculate stats
  const totalContractors = contractors?.length || 0;
  const activeContractors =
    contractors?.filter((c) => c.status === 'active').length || 0;
  const highRiskContractors =
    contractors?.filter((c) => c.risk_level === 'red').length || 0;

  const totalEvaluations = submissions?.length || 0;
  const inProgressEvals =
    submissions?.filter((s) => s.status === 'in_review').length || 0;
  const completedEvals =
    submissions?.filter((s) => s.status === 'completed').length || 0;
  const draftEvals =
    submissions?.filter((s) => s.status === 'draft').length || 0;

  return (
    <div className='space-y-6'>
      {/* Welcome Card */}
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>
          {isSpecialist ? 'HSE Specialist Dashboard' : 'Supervisor Dashboard'}
        </h2>
        <p className='text-muted-foreground'>
          Welcome back, {profile?.full_name}
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Contractors</CardTitle>
            <Shield className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalContractors}</div>
            <p className='text-muted-foreground text-xs'>
              {activeContractors} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Evaluations
            </CardTitle>
            <FileText className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalEvaluations}</div>
            <p className='text-muted-foreground text-xs'>
              All FRM-32 evaluations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>In Progress</CardTitle>
            <Clock className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{inProgressEvals}</div>
            <p className='text-muted-foreground text-xs'>{draftEvals} drafts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Completed</CardTitle>
            <CheckCircle className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{completedEvals}</div>
            <p className='text-muted-foreground text-xs'>This period</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Alert */}
      {highRiskContractors > 0 && (
        <Card className='border-orange-200 bg-orange-50 dark:bg-orange-950/10'>
          <CardHeader className='pb-3'>
            <div className='flex items-center gap-2'>
              <AlertTriangle className='h-5 w-5 text-orange-600' />
              <CardTitle className='text-base'>High Risk Alert</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground text-sm'>
              {highRiskContractors} contractor
              {highRiskContractors > 1 ? 's' : ''} flagged as high risk.
              Immediate review recommended.
            </p>
            <Link
              href='/dashboard/contractors'
              className='mt-2 inline-block text-sm font-medium text-orange-600 hover:text-orange-700'
            >
              View Contractors →
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions & Recent Activity */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <Card className='col-span-4'>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks for{' '}
              {isSpecialist ? 'HSE specialists' : 'supervisors'}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Link
              href='/dashboard/evaluations'
              className='hover:bg-accent flex items-center justify-between rounded-lg border p-3 transition-colors'
            >
              <div>
                <p className='font-medium'>FRM-32 Evaluations</p>
                <p className='text-muted-foreground text-sm'>
                  Create and manage safety evaluations
                </p>
              </div>
              <FileText className='text-muted-foreground h-5 w-5' />
            </Link>

            <Link
              href='/dashboard/contractors'
              className='hover:bg-accent flex items-center justify-between rounded-lg border p-3 transition-colors'
            >
              <div>
                <p className='font-medium'>View Contractors</p>
                <p className='text-muted-foreground text-sm'>
                  Browse contractor information and status
                </p>
              </div>
              <Shield className='text-muted-foreground h-5 w-5' />
            </Link>

            {inProgressEvals > 0 && (
              <Link
                href='/dashboard/evaluations?status=in_progress'
                className='flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-3 transition-colors hover:bg-orange-100 dark:bg-orange-950/10 dark:hover:bg-orange-950/20'
              >
                <div>
                  <p className='font-medium'>Pending Reviews</p>
                  <p className='text-muted-foreground text-sm'>
                    {inProgressEvals} evaluation{inProgressEvals > 1 ? 's' : ''}{' '}
                    awaiting completion
                  </p>
                </div>
                <Clock className='h-5 w-5 text-orange-600' />
              </Link>
            )}
          </CardContent>
        </Card>

        <Card className='col-span-3'>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
            <CardDescription>Your evaluation metrics</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-start gap-3'>
              <TrendingUp className='mt-0.5 h-5 w-5 text-green-600' />
              <div>
                <p className='text-sm font-medium'>Completion Rate</p>
                <p className='text-muted-foreground text-xs'>
                  {totalEvaluations > 0
                    ? `${Math.round((completedEvals / totalEvaluations) * 100)}%`
                    : '0%'}{' '}
                  evaluations completed
                </p>
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <CheckCircle className='mt-0.5 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium'>Active Monitoring</p>
                <p className='text-muted-foreground text-xs'>
                  {activeContractors} contractors under supervision
                </p>
              </div>
            </div>

            {highRiskContractors > 0 && (
              <div className='flex items-start gap-3'>
                <AlertTriangle className='mt-0.5 h-5 w-5 text-orange-600' />
                <div>
                  <p className='text-sm font-medium'>Risk Assessment</p>
                  <p className='text-muted-foreground text-xs'>
                    {highRiskContractors} high-risk case
                    {highRiskContractors > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
