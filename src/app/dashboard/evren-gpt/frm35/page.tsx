'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, FileText, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import {
  FRMQuestionnaire,
  FRMQuestion
} from '@/features/evren-gpt/components/frm-questionnaire';

const FRM35_QUESTIONS: FRMQuestion[] = [
  {
    id: 'q1',
    question_number: 1,
    question_text:
      'Provide final recommendations for contractor safety improvement.',
    required: true,
    placeholder: 'List your recommendations...'
  },
  {
    id: 'q2',
    question_number: 2,
    question_text:
      "Assess contractor's compliance with project-specific safety requirements.",
    required: true,
    placeholder: 'Your compliance assessment...'
  },
  {
    id: 'q3',
    question_number: 3,
    question_text:
      "Evaluate the contractor's response to previous safety observations.",
    required: true,
    placeholder: 'Your evaluation...'
  },
  {
    id: 'q4',
    question_number: 4,
    question_text: 'Overall performance rating and justification.',
    required: true,
    placeholder: 'Provide detailed justification...'
  },
  {
    id: 'q5',
    question_number: 5,
    question_text: 'List any critical issues that require immediate attention.',
    required: true,
    placeholder: 'Critical issues...'
  }
];

export default function FRM35Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useProfile();

  const [isLoading, setIsLoading] = useState(true);
  const [initialAnswers, setInitialAnswers] = useState<Record<string, string>>(
    {}
  );

  const sessionId = searchParams.get('session');
  const contractorId = searchParams.get('contractor');
  const cycle = parseInt(searchParams.get('cycle') || '1');

  useEffect(() => {
    loadExistingAnswers();
  }, [sessionId, contractorId, cycle]);

  const loadExistingAnswers = async () => {
    try {
      setIsLoading(true);
      setInitialAnswers({});
    } catch (error) {
      toast.error('Failed to load existing answers');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (answers: Record<string, string>) => {
    console.log('Saving FRM35 answers:', answers);
  };

  const handleSubmit = async (answers: Record<string, string>) => {
    try {
      console.log('Submitting FRM35 (Final):', {
        session_id: sessionId,
        contractor_id: contractorId,
        cycle,
        answers
      });

      // FRM35 is the final form - calculate final score and complete evaluation
      setTimeout(() => {
        router.push('/dashboard/evren-gpt');
        toast.success(
          'Evaluation process completed! Final score will be calculated.'
        );
      }, 2000);
    } catch (error) {
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-muted-foreground'>Loading form...</div>
      </div>
    );
  }

  return (
    <div className='space-y-4 p-4 pt-6 md:p-8'>
      <Card className='bg-blue-50 dark:bg-blue-950'>
        <CardContent className='pt-6'>
          <div className='flex items-start gap-3'>
            <TrendingUp className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400' />
            <div className='space-y-1'>
              <p className='text-sm font-medium text-blue-900 dark:text-blue-100'>
                FRM35 - Final Assessment Form
              </p>
              <p className='text-sm text-blue-700 dark:text-blue-300'>
                This is the final evaluation form by the Supervisor. Upon
                submission, the final score will be calculated as:
                <strong> Final Score = (FRM32 × 0.5) + (FRM35 × 0.5)</strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {profile?.role_id !== 5 && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Only Supervisors can fill out FRM35. Your current role:{' '}
            {profile?.role_id}
          </AlertDescription>
        </Alert>
      )}

      <FRMQuestionnaire
        formId='frm35'
        formTitle='FRM35 - Final Assessment Form'
        formDescription='Complete the final assessment and provide overall recommendations.'
        questions={FRM35_QUESTIONS}
        sessionId={sessionId || undefined}
        contractorId={contractorId || undefined}
        cycle={cycle}
        onSubmit={handleSubmit}
        onSave={handleSave}
        initialAnswers={initialAnswers}
        readonly={profile?.role_id !== 5}
      />
    </div>
  );
}
