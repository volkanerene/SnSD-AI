'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useProfile } from '@/hooks/useProfile';
import { useSubmissions } from '@/hooks/useSubmissions';
import {
  FileCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  FileText
} from 'lucide-react';
import Link from 'next/link';

/**
 * Dashboard for Contractor Admin (Role 4) and Worker (Role 6)
 * Shows their own evaluations and company status
 */
export function ContractorDashboard() {
  const { profile } = useProfile();
  const tenantId = profile?.tenant_id || '';
  const contractorId = profile?.contractor_id || '';
  const isAdmin = profile?.role_id === 4;

  // Fetch contractor's submissions
  const { submissions, isLoading } = useSubmissions(tenantId, {
    contractor_id: contractorId,
    limit: 100
  });

  // Calculate stats
  const totalEvaluations = submissions?.length || 0;
  const completedEvals =
    submissions?.filter((s) => s.status === 'completed').length || 0;
  const inProgressEvals =
    submissions?.filter((s) => s.status === 'in_progress').length || 0;
  const pendingEvals =
    submissions?.filter((s) => s.status === 'draft').length || 0;

  // Calculate average score
  const completedWithScores =
    submissions?.filter((s) => s.status === 'completed' && s.total_score) || [];
  const avgScore =
    completedWithScores.length > 0
      ? completedWithScores.reduce((sum, s) => sum + (s.total_score || 0), 0) /
        completedWithScores.length
      : 0;

  // Risk assessment
  const hasHighRisk =
    submissions?.some((s) => s.risk_classification === 'high') || false;
  const hasMediumRisk =
    submissions?.some((s) => s.risk_classification === 'medium') || false;

  return (
    <div className='space-y-6'>
      {/* Welcome Card */}
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>
          {isAdmin ? 'Contractor Dashboard' : 'Worker Dashboard'}
        </h2>
        <p className='text-muted-foreground'>
          Welcome back, {profile?.full_name}
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Evaluations
            </CardTitle>
            <FileText className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalEvaluations}</div>
            <p className='text-muted-foreground text-xs'>FRM-32 assessments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Completed</CardTitle>
            <CheckCircle className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{completedEvals}</div>
            <p className='text-muted-foreground text-xs'>
              {totalEvaluations > 0
                ? `${Math.round((completedEvals / totalEvaluations) * 100)}%`
                : '0%'}{' '}
              completion rate
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
            <p className='text-muted-foreground text-xs'>
              {pendingEvals} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Average Score</CardTitle>
            <TrendingUp className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {avgScore > 0 ? avgScore.toFixed(1) : 'N/A'}
            </div>
            <p className='text-muted-foreground text-xs'>
              {completedEvals > 0
                ? `From ${completedEvals} eval${completedEvals > 1 ? 's' : ''}`
                : 'No scores yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Alert */}
      {hasHighRisk && (
        <Card className='border-red-200 bg-red-50 dark:bg-red-950/10'>
          <CardHeader className='pb-3'>
            <div className='flex items-center gap-2'>
              <AlertCircle className='h-5 w-5 text-red-600' />
              <CardTitle className='text-base'>
                High Risk Assessment Detected
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground text-sm'>
              One or more of your evaluations has been flagged as high risk.
              Please review the recommendations and take corrective action.
            </p>
            <Link
              href='/dashboard/my-evaluations?risk=high'
              className='mt-2 inline-block text-sm font-medium text-red-600 hover:text-red-700'
            >
              View High Risk Evaluations →
            </Link>
          </CardContent>
        </Card>
      )}

      {hasMediumRisk && !hasHighRisk && (
        <Card className='border-orange-200 bg-orange-50 dark:bg-orange-950/10'>
          <CardHeader className='pb-3'>
            <div className='flex items-center gap-2'>
              <AlertCircle className='h-5 w-5 text-orange-600' />
              <CardTitle className='text-base'>
                Medium Risk Assessment
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground text-sm'>
              Some evaluations require attention. Review the feedback and
              implement improvements.
            </p>
            <Link
              href='/dashboard/my-evaluations?risk=medium'
              className='mt-2 inline-block text-sm font-medium text-orange-600 hover:text-orange-700'
            >
              View Assessments →
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions & Performance */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <Card className='col-span-4'>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              {isAdmin
                ? 'Manage your company evaluations'
                : 'View your safety records'}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Link
              href='/dashboard/my-evaluations'
              className='hover:bg-accent flex items-center justify-between rounded-lg border p-3 transition-colors'
            >
              <div>
                <p className='font-medium'>My Evaluations</p>
                <p className='text-muted-foreground text-sm'>
                  View all FRM-32 safety evaluations
                </p>
              </div>
              <FileCheck className='text-muted-foreground h-5 w-5' />
            </Link>

            {completedEvals > 0 && (
              <Link
                href='/dashboard/my-evaluations?status=completed'
                className='hover:bg-accent flex items-center justify-between rounded-lg border p-3 transition-colors'
              >
                <div>
                  <p className='font-medium'>Completed Evaluations</p>
                  <p className='text-muted-foreground text-sm'>
                    Review {completedEvals} completed assessment
                    {completedEvals > 1 ? 's' : ''}
                  </p>
                </div>
                <CheckCircle className='h-5 w-5 text-green-600' />
              </Link>
            )}

            {inProgressEvals > 0 && (
              <Link
                href='/dashboard/my-evaluations?status=in_progress'
                className='flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-3 transition-colors hover:bg-blue-100 dark:bg-blue-950/10 dark:hover:bg-blue-950/20'
              >
                <div>
                  <p className='font-medium'>In Progress</p>
                  <p className='text-muted-foreground text-sm'>
                    {inProgressEvals} evaluation{inProgressEvals > 1 ? 's' : ''}{' '}
                    being reviewed
                  </p>
                </div>
                <Clock className='h-5 w-5 text-blue-600' />
              </Link>
            )}

            <Link
              href='/dashboard/settings'
              className='hover:bg-accent flex items-center justify-between rounded-lg border p-3 transition-colors'
            >
              <div>
                <p className='font-medium'>Profile Settings</p>
                <p className='text-muted-foreground text-sm'>
                  Update your information and preferences
                </p>
              </div>
              <FileText className='text-muted-foreground h-5 w-5' />
            </Link>
          </CardContent>
        </Card>

        <Card className='col-span-3'>
          <CardHeader>
            <CardTitle>Safety Performance</CardTitle>
            <CardDescription>Your compliance metrics</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {isLoading ? (
              <div className='text-muted-foreground text-sm'>Loading...</div>
            ) : (
              <>
                <div className='flex items-start gap-3'>
                  <CheckCircle className='mt-0.5 h-5 w-5 text-green-600' />
                  <div>
                    <p className='text-sm font-medium'>Completion Status</p>
                    <p className='text-muted-foreground text-xs'>
                      {completedEvals} of {totalEvaluations} evaluations
                      completed
                    </p>
                  </div>
                </div>

                {avgScore > 0 && (
                  <div className='flex items-start gap-3'>
                    <TrendingUp className='mt-0.5 h-5 w-5 text-blue-600' />
                    <div>
                      <p className='text-sm font-medium'>Average Score</p>
                      <p className='text-muted-foreground text-xs'>
                        {avgScore.toFixed(1)} out of 100
                      </p>
                    </div>
                  </div>
                )}

                {hasHighRisk ? (
                  <div className='flex items-start gap-3'>
                    <AlertCircle className='mt-0.5 h-5 w-5 text-red-600' />
                    <div>
                      <p className='text-sm font-medium'>Risk Level: High</p>
                      <p className='text-muted-foreground text-xs'>
                        Immediate action required
                      </p>
                    </div>
                  </div>
                ) : hasMediumRisk ? (
                  <div className='flex items-start gap-3'>
                    <AlertCircle className='mt-0.5 h-5 w-5 text-orange-600' />
                    <div>
                      <p className='text-sm font-medium'>Risk Level: Medium</p>
                      <p className='text-muted-foreground text-xs'>
                        Review recommended
                      </p>
                    </div>
                  </div>
                ) : completedEvals > 0 ? (
                  <div className='flex items-start gap-3'>
                    <CheckCircle className='mt-0.5 h-5 w-5 text-green-600' />
                    <div>
                      <p className='text-sm font-medium'>Risk Level: Low</p>
                      <p className='text-muted-foreground text-xs'>
                        Good safety compliance
                      </p>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
