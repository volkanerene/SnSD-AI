'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/format';
import type { Contractor } from '@/types/api';

interface FormScore {
  form_id: string;
  form_name: string;
  score: number;
  evaluated_at: string;
  session_id: string;
  cycle: number;
}

interface ContractorScoresDialogProps {
  contractor: Contractor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContractorScoresDialog({
  contractor,
  open,
  onOpenChange
}: ContractorScoresDialogProps) {
  // Mock data - bu veriler API'den gelecek
  const mockFormScores: FormScore[] = [
    {
      form_id: 'frm32',
      form_name: 'FRM32 - Safety Assessment',
      score: 80,
      evaluated_at: '2025-10-15T10:30:00Z',
      session_id: 'sess_001',
      cycle: 1
    },
    {
      form_id: 'frm33',
      form_name: 'FRM33 - Equipment Check',
      score: 90,
      evaluated_at: '2025-10-16T14:20:00Z',
      session_id: 'sess_001',
      cycle: 1
    },
    {
      form_id: 'frm34',
      form_name: 'FRM34 - Documentation Review',
      score: 92,
      evaluated_at: '2025-10-17T09:15:00Z',
      session_id: 'sess_001',
      cycle: 1
    }
  ];

  if (!contractor) return null;

  const averageScore = contractor.last_evaluation_score || 0;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Evaluation Scores - {contractor.name}</DialogTitle>
          <DialogDescription>
            Detailed breakdown of evaluation scores by form
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Overall Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center gap-4'>
                <div className='bg-primary/10 flex h-20 w-20 items-center justify-center rounded-full'>
                  <span className='text-3xl font-bold'>
                    {averageScore.toFixed(1)}
                  </span>
                </div>
                <div className='flex-1'>
                  <p className='text-muted-foreground text-sm'>
                    Average score across all forms
                  </p>
                  <p className='text-muted-foreground text-xs'>
                    Last evaluated:{' '}
                    {contractor.last_evaluation_date
                      ? formatDate(contractor.last_evaluation_date)
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Scores */}
          <div className='space-y-3'>
            <h3 className='font-semibold'>Form Scores</h3>
            {mockFormScores.map((formScore) => (
              <Card key={formScore.form_id}>
                <CardContent className='pt-6'>
                  <div className='flex items-center justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3'>
                        <h4 className='font-medium'>{formScore.form_name}</h4>
                        <Badge variant='outline' className='text-xs'>
                          Cycle {formScore.cycle}
                        </Badge>
                      </div>
                      <p className='text-muted-foreground text-sm'>
                        Evaluated on {formatDate(formScore.evaluated_at)}
                      </p>
                      <p className='text-muted-foreground text-xs'>
                        Session ID: {formScore.session_id}
                      </p>
                    </div>
                    <div className='flex items-center gap-3'>
                      <Badge
                        variant='outline'
                        className={`${getScoreColor(formScore.score)} px-4 py-2 text-2xl font-bold text-white`}
                      >
                        {formScore.score}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {mockFormScores.length === 0 && (
            <div className='text-muted-foreground py-8 text-center'>
              No evaluation scores available yet
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
