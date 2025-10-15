'use client';

import { use } from 'react';
import { useSubmission } from '@/hooks/useSubmissions';
import { useContractor } from '@/hooks/useContractors';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Building2,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/format';
import { QuestionsTab } from './questions-tab';
import { SummaryTab } from './summary-tab';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EvaluationDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { profile } = useProfile();
  const tenantId = profile?.tenant_id || '';

  const { submission, isLoading, error } = useSubmission(tenantId, id);
  const { contractor } = useContractor(
    tenantId,
    submission?.contractor_id || ''
  );

  if (isLoading) {
    return (
      <div className='flex h-[450px] items-center justify-center'>
        <div className='text-muted-foreground'>Loading evaluation...</div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className='flex h-[450px] flex-col items-center justify-center gap-4'>
        <AlertCircle className='text-destructive h-12 w-12' />
        <div className='text-destructive'>
          {error?.message || 'Evaluation not found'}
        </div>
        <Button asChild variant='outline'>
          <Link href='/dashboard/evaluations'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Evaluations
          </Link>
        </Button>
      </div>
    );
  }

  const statusColors = {
    draft: 'bg-gray-500',
    submitted: 'bg-blue-500',
    in_review: 'bg-yellow-500',
    completed: 'bg-green-500',
    rejected: 'bg-red-500'
  };

  const riskColors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button asChild variant='ghost' size='icon'>
            <Link href='/dashboard/evaluations'>
              <ArrowLeft className='h-4 w-4' />
            </Link>
          </Button>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Evaluation: {submission.evaluation_period}
            </h2>
            <p className='text-muted-foreground'>
              FRM-32 Safety Evaluation Details
            </p>
          </div>
        </div>
        <Badge
          variant='outline'
          className={`${statusColors[submission.status]} text-white`}
        >
          {submission.status.toUpperCase()}
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Contractor</CardTitle>
            <Building2 className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-xl font-bold'>
              {contractor?.name || 'Loading...'}
            </div>
            <p className='text-muted-foreground text-xs'>
              {contractor?.city}, {contractor?.country}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Progress</CardTitle>
            <FileText className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {submission.progress_percentage}%
            </div>
            <Progress value={submission.progress_percentage} className='mt-2' />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Final Score</CardTitle>
            <CheckCircle2 className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {submission.final_score?.toFixed(1) || '-'}
              {submission.final_score && (
                <span className='text-muted-foreground text-sm'>/100</span>
              )}
            </div>
            {submission.risk_classification && (
              <Badge
                variant='outline'
                className={`mt-2 ${riskColors[submission.risk_classification]} text-white`}
              >
                {submission.risk_classification.toUpperCase()} RISK
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Timeline</CardTitle>
            <Calendar className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='space-y-1'>
              {submission.submitted_at && (
                <div className='text-xs'>
                  <span className='text-muted-foreground'>Submitted: </span>
                  {formatDate(submission.submitted_at)}
                </div>
              )}
              {submission.completed_at && (
                <div className='text-xs'>
                  <span className='text-muted-foreground'>Completed: </span>
                  {formatDate(submission.completed_at)}
                </div>
              )}
              {!submission.submitted_at && !submission.completed_at && (
                <div className='text-muted-foreground text-xs'>
                  Not yet submitted
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue='questions' className='w-full'>
        <TabsList>
          <TabsTrigger value='questions'>Questions</TabsTrigger>
          <TabsTrigger value='summary'>Summary & Analysis</TabsTrigger>
          <TabsTrigger value='history'>History</TabsTrigger>
          <TabsTrigger value='documents'>Documents</TabsTrigger>
        </TabsList>

        <TabsContent value='questions' className='space-y-4'>
          <QuestionsTab submission={submission} tenantId={tenantId} />
        </TabsContent>

        <TabsContent value='summary' className='space-y-4'>
          <SummaryTab submission={submission} contractor={contractor} />
        </TabsContent>

        <TabsContent value='history' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Evaluation History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-muted-foreground text-sm'>
                History timeline will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='documents' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Attached Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-muted-foreground text-sm'>
                {submission.attachments.length > 0
                  ? 'Documents list will be displayed here'
                  : 'No documents attached yet'}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
