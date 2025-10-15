'use client';

import { useSubmissions } from '@/hooks/useSubmissions';
import { useProfile } from '@/hooks/useProfile';
import { DataTable } from '@/components/ui/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import type { FRM32Submission } from '@/types/api';

const myEvaluationsColumns: ColumnDef<FRM32Submission>[] = [
  {
    accessorKey: 'evaluation_period',
    header: 'Period',
    cell: ({ row }) => {
      return (
        <div className='font-medium'>{row.original.evaluation_period}</div>
      );
    }
  },
  {
    accessorKey: 'evaluation_type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.original.evaluation_type;
      const typeColors: Record<string, string> = {
        periodic:
          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        incident:
          'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
        audit:
          'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      };
      return (
        <Badge className={typeColors[type]} variant='outline'>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      const statusColors: Record<string, string> = {
        draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
        submitted:
          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        in_review:
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        completed:
          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      };
      return (
        <Badge className={statusColors[status]} variant='outline'>
          {status.toUpperCase()}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'progress_percentage',
    header: 'Progress',
    cell: ({ row }) => {
      const progress = row.original.progress_percentage;
      return (
        <div className='flex items-center gap-2'>
          <div className='bg-muted h-2 w-24 overflow-hidden rounded-full'>
            <div
              className='bg-primary h-full'
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className='text-muted-foreground text-xs'>{progress}%</span>
        </div>
      );
    }
  },
  {
    accessorKey: 'final_score',
    header: 'Score',
    cell: ({ row }) => {
      const score = row.original.final_score;
      if (score === null)
        return <span className='text-muted-foreground'>-</span>;

      const scoreColor =
        score >= 80
          ? 'text-green-600'
          : score >= 60
            ? 'text-yellow-600'
            : 'text-red-600';

      return <span className={`font-bold ${scoreColor}`}>{score}</span>;
    }
  },
  {
    accessorKey: 'risk_classification',
    header: 'Risk',
    cell: ({ row }) => {
      const risk = row.original.risk_classification;
      if (!risk) return <span className='text-muted-foreground'>-</span>;

      const riskColors: Record<string, string> = {
        green:
          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        yellow:
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      };

      return (
        <Badge className={riskColors[risk]} variant='outline'>
          {risk.toUpperCase()}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'submitted_at',
    header: 'Submitted',
    cell: ({ row }) => {
      const submitted = row.original.submitted_at;
      if (!submitted)
        return <span className='text-muted-foreground'>Not submitted</span>;

      const date = new Date(submitted);
      return <span className='text-sm'>{date.toLocaleDateString()}</span>;
    }
  }
];

export default function MyEvaluationsPage() {
  const { profile } = useProfile();
  const tenantId = profile?.tenant_id || '';
  const contractorId = profile?.contractor_id || '';

  const { submissions, isLoading, error } = useSubmissions(tenantId, {
    contractor_id: contractorId,
    limit: 100
  });

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-muted-foreground'>Loading evaluations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-destructive'>
          Error loading evaluations: {error.message}
        </div>
      </div>
    );
  }

  const draftCount = submissions.filter((s) => s.status === 'draft').length;
  const inReviewCount = submissions.filter(
    (s) => s.status === 'in_review' || s.status === 'submitted'
  ).length;
  const completedCount = submissions.filter(
    (s) => s.status === 'completed'
  ).length;
  const avgScore =
    submissions
      .filter((s) => s.final_score !== null)
      .reduce((sum, s) => sum + (s.final_score || 0), 0) /
      submissions.filter((s) => s.final_score !== null).length || 0;

  return (
    <div className='space-y-6 p-4 pt-6 md:p-8'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>My Evaluations</h2>
        <p className='text-muted-foreground'>
          View and track your FRM-32 safety evaluations
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Evaluations
            </CardTitle>
            <FileText className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{submissions.length}</div>
            <p className='text-muted-foreground text-xs'>All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>In Progress</CardTitle>
            <Clock className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>
              {draftCount + inReviewCount}
            </div>
            <p className='text-muted-foreground text-xs'>
              {draftCount} draft, {inReviewCount} in review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Completed</CardTitle>
            <CheckCircle className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {completedCount}
            </div>
            <p className='text-muted-foreground text-xs'>
              Finished evaluations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Average Score</CardTitle>
            <TrendingUp className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                avgScore >= 80
                  ? 'text-green-600'
                  : avgScore >= 60
                    ? 'text-yellow-600'
                    : 'text-red-600'
              }`}
            >
              {avgScore > 0 ? avgScore.toFixed(1) : '-'}
            </div>
            <p className='text-muted-foreground text-xs'>
              {submissions.filter((s) => s.final_score !== null).length} scored
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info Card for Contractors */}
      {!contractorId && (
        <Card className='border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950'>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <AlertCircle className='h-5 w-5 text-yellow-600' />
              <CardTitle className='text-yellow-900 dark:text-yellow-100'>
                No Contractor Assignment
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-yellow-800 dark:text-yellow-200'>
              You are not currently assigned to a contractor. Please contact
              your administrator to get assigned to view your evaluations.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Evaluations Table */}
      <DataTable
        columns={myEvaluationsColumns}
        data={submissions}
        searchKey='evaluation_period'
      />
    </div>
  );
}
