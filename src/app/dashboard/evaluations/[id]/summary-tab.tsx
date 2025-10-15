'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import type { FRM32Submission, Contractor } from '@/types/api';

interface SummaryTabProps {
  submission: FRM32Submission;
  contractor?: Contractor | null;
}

export function SummaryTab({ submission, contractor }: SummaryTabProps) {
  const getRiskColor = (risk: string) => {
    const colors = {
      green: 'text-green-600 bg-green-50 border-green-200',
      yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      red: 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[risk as keyof typeof colors] || '';
  };

  const getRiskIcon = (risk: string) => {
    if (risk === 'green') return <CheckCircle className='h-5 w-5' />;
    if (risk === 'yellow') return <Info className='h-5 w-5' />;
    return <AlertTriangle className='h-5 w-5' />;
  };

  return (
    <div className='space-y-4'>
      {/* Overall Score Card */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Evaluation Score</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='text-4xl font-bold'>
                {submission.final_score?.toFixed(1) || '-'}
                <span className='text-muted-foreground text-lg'>/100</span>
              </div>
              <p className='text-muted-foreground mt-1 text-sm'>
                Final evaluation score
              </p>
            </div>
            {submission.risk_classification && (
              <div
                className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2 ${getRiskColor(submission.risk_classification)}`}
              >
                {getRiskIcon(submission.risk_classification)}
                <span className='font-semibold uppercase'>
                  {submission.risk_classification} Risk
                </span>
              </div>
            )}
          </div>

          {submission.final_score && (
            <Progress value={submission.final_score} className='h-3' />
          )}

          <div className='grid grid-cols-3 gap-4 pt-4'>
            <div className='space-y-1'>
              <p className='text-muted-foreground text-sm'>Progress</p>
              <p className='text-2xl font-bold'>
                {submission.progress_percentage}%
              </p>
            </div>
            <div className='space-y-1'>
              <p className='text-muted-foreground text-sm'>Evaluation Type</p>
              <Badge variant='outline' className='text-sm'>
                {submission.evaluation_type}
              </Badge>
            </div>
            <div className='space-y-1'>
              <p className='text-muted-foreground text-sm'>Period</p>
              <p className='text-lg font-medium'>
                {submission.evaluation_period}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Summary */}
      {submission.ai_summary && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <span className='text-blue-600'>🤖</span>
              AI-Generated Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='prose prose-sm max-w-none'>
              <p className='text-muted-foreground whitespace-pre-wrap'>
                {submission.ai_summary}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contractor Information */}
      {contractor && (
        <Card>
          <CardHeader>
            <CardTitle>Contractor Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-muted-foreground text-sm'>Company Name</p>
                <p className='font-medium'>{contractor.name}</p>
              </div>
              <div>
                <p className='text-muted-foreground text-sm'>Legal Name</p>
                <p className='font-medium'>{contractor.legal_name}</p>
              </div>
              <div>
                <p className='text-muted-foreground text-sm'>Tax Number</p>
                <p className='font-medium'>{contractor.tax_number}</p>
              </div>
              <div>
                <p className='text-muted-foreground text-sm'>Location</p>
                <p className='font-medium'>
                  {contractor.city}, {contractor.country}
                </p>
              </div>
              <div>
                <p className='text-muted-foreground text-sm'>Contact Person</p>
                <p className='font-medium'>{contractor.contact_person}</p>
              </div>
              <div>
                <p className='text-muted-foreground text-sm'>Contact Email</p>
                <p className='font-medium'>{contractor.contact_email}</p>
              </div>
            </div>

            {contractor.last_evaluation_score && (
              <>
                <Separator />
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-muted-foreground text-sm'>
                      Previous Evaluation Score
                    </p>
                    <p className='text-2xl font-bold'>
                      {contractor.last_evaluation_score.toFixed(1)}
                    </p>
                  </div>
                  {submission.final_score &&
                    contractor.last_evaluation_score && (
                      <div className='flex items-center gap-2'>
                        {submission.final_score >
                        contractor.last_evaluation_score ? (
                          <>
                            <TrendingUp className='h-5 w-5 text-green-600' />
                            <span className='font-medium text-green-600'>
                              +
                              {(
                                submission.final_score -
                                contractor.last_evaluation_score
                              ).toFixed(1)}
                            </span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className='h-5 w-5 text-red-600' />
                            <span className='font-medium text-red-600'>
                              {(
                                submission.final_score -
                                contractor.last_evaluation_score
                              ).toFixed(1)}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Evaluation Notes */}
      {submission.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Evaluation Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground whitespace-pre-wrap'>
              {submission.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Status Information */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluation Status</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground text-sm'>Status</span>
            <Badge variant='outline'>{submission.status}</Badge>
          </div>
          {submission.submitted_at && (
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground text-sm'>
                Submitted At
              </span>
              <span className='text-sm font-medium'>
                {new Date(submission.submitted_at).toLocaleDateString()}
              </span>
            </div>
          )}
          {submission.completed_at && (
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground text-sm'>
                Completed At
              </span>
              <span className='text-sm font-medium'>
                {new Date(submission.completed_at).toLocaleDateString()}
              </span>
            </div>
          )}
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground text-sm'>Created At</span>
            <span className='text-sm font-medium'>
              {new Date(submission.created_at).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
