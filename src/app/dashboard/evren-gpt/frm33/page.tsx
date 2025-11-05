'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import {
  FRMQuestionnaire,
  FRMQuestion
} from '@/features/evren-gpt/components/frm-questionnaire';

const FRM33_QUESTIONS: FRMQuestion[] = [
  {
    id: 'q1',
    question_number: 1,
    question_text:
      "Evaluate the contractor's implementation of their stated safety policy.",
    required: true,
    placeholder: 'Provide your assessment...'
  },
  {
    id: 'q2',
    question_number: 2,
    question_text:
      "Assess the effectiveness of the contractor's safety training programs based on field observations.",
    required: true,
    placeholder: 'Your evaluation...'
  },
  {
    id: 'q3',
    question_number: 3,
    question_text:
      "Review the contractor's risk assessment documentation and field implementation.",
    required: true,
    placeholder: 'Your review...'
  },
  {
    id: 'q4',
    question_number: 4,
    question_text: 'Verify proper PPE usage and availability on site.',
    required: true,
    placeholder: 'Your verification findings...'
  },
  {
    id: 'q5',
    question_number: 5,
    question_text:
      "Evaluate the contractor's incident reporting system effectiveness.",
    required: true,
    placeholder: 'Your assessment...'
  }
];

export default function FRM33Page() {
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
      // TODO: Load from backend
      setInitialAnswers({});
    } catch (error) {
      toast.error('Failed to load existing answers');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (answers: Record<string, string>) => {
    console.log('Saving FRM33 answers:', answers);
  };

  const handleSubmit = async (answers: Record<string, string>) => {
    try {
      console.log('Submitting FRM33:', {
        session_id: sessionId,
        contractor_id: contractorId,
        cycle,
        answers
      });

      setTimeout(() => {
        router.push('/dashboard/evren-gpt');
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
            <FileText className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400' />
            <div className='space-y-1'>
              <p className='text-sm font-medium text-blue-900 dark:text-blue-100'>
                FRM33 - Supervisor Evaluation
              </p>
              <p className='text-sm text-blue-700 dark:text-blue-300'>
                This form is filled by the Supervisor after FRM32 is completed.
                Your evaluation will help verify the contractor's
                self-assessment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {profile?.role_id !== 5 && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Only Supervisors can fill out FRM33. Your current role:{' '}
            {profile?.role_id}
          </AlertDescription>
        </Alert>
      )}

      <FRMQuestionnaire
        formId='frm33'
        formTitle='FRM33 - Supervisor Evaluation Form'
        formDescription='Please evaluate the contractor based on field observations and documentation review.'
        questions={FRM33_QUESTIONS}
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
