'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { FileText, ExternalLink } from 'lucide-react';

export default function FRM32EvaluationsPage() {
  // Mock data - gerçekte API'den gelecek
  const evaluations = [
    {
      id: '1',
      session_id: 'sess_001',
      contractor_name: 'Güveli İnşaat',
      status: 'completed',
      score: 80,
      submitted_at: '2025-10-15T10:30:00Z',
      submitted_by: 'Ahmet Güveli',
      cycle: 1
    },
    {
      id: '2',
      session_id: 'sess_001',
      contractor_name: 'Yapı Teknik',
      status: 'pending',
      score: null,
      submitted_at: null,
      submitted_by: null,
      cycle: 1
    }
  ];

  return (
    <div className='space-y-4 p-4 pt-6 md:p-8'>
      <div className='flex items-center justify-between'>
        <div>
          <div className='flex items-center gap-3'>
            <h2 className='text-3xl font-bold tracking-tight'>
              FRM32 Evaluations
            </h2>
            <Badge variant='outline' className='bg-blue-500 text-white'>
              Contractor Admin
            </Badge>
          </div>
          <p className='text-muted-foreground'>
            Initial contractor self-assessment form - Scored by AI
          </p>
        </div>
        <Button
          variant='outline'
          onClick={() =>
            window.open('https://snsd-evrengpt.netlify.app/', '_blank')
          }
        >
          <ExternalLink className='mr-2 h-4 w-4' />
          Open Form Template
        </Button>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Evaluations
            </CardTitle>
            <FileText className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{evaluations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Completed</CardTitle>
            <Badge variant='outline' className='bg-green-500 text-white'>
              {evaluations.filter((e) => e.status === 'completed').length}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {evaluations.filter((e) => e.status === 'completed').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Pending</CardTitle>
            <Badge variant='outline' className='bg-yellow-500 text-white'>
              {evaluations.filter((e) => e.status === 'pending').length}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {evaluations.filter((e) => e.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Info */}
      <Card>
        <CardHeader>
          <CardTitle>Form Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2 text-sm'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Filled By:</span>
              <span className='font-medium'>Contractor Admin</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Scoring Method:</span>
              <span className='font-medium'>
                AI-Powered (0, 3, 6, 10 points)
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Next Step:</span>
              <span className='font-medium'>Triggers FRM33 (Supervisor)</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Integration:</span>
              <span className='font-medium'>n8n Workflow</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evaluations List - TODO: Implement actual data table with columns */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Evaluations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {evaluations.map((evaluation) => (
              <div
                key={evaluation.id}
                className='flex items-center justify-between rounded-lg border p-4'
              >
                <div className='flex-1'>
                  <div className='flex items-center gap-3'>
                    <h4 className='font-medium'>
                      {evaluation.contractor_name}
                    </h4>
                    <Badge
                      variant='outline'
                      className={
                        evaluation.status === 'completed'
                          ? 'bg-green-500 text-white'
                          : 'bg-yellow-500 text-white'
                      }
                    >
                      {evaluation.status}
                    </Badge>
                    <Badge variant='outline' className='text-xs'>
                      Session: {evaluation.session_id}
                    </Badge>
                    <Badge variant='outline' className='text-xs'>
                      Cycle {evaluation.cycle}
                    </Badge>
                  </div>
                  {evaluation.submitted_by && (
                    <p className='text-muted-foreground text-sm'>
                      Submitted by {evaluation.submitted_by} on{' '}
                      {new Date(evaluation.submitted_at!).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {evaluation.score !== null && (
                  <div className='text-right'>
                    <div className='text-2xl font-bold'>{evaluation.score}</div>
                    <p className='text-muted-foreground text-xs'>Score</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
