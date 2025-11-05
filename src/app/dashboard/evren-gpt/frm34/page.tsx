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

const FRM34_QUESTIONS: FRMQuestion[] = [
  {
    id: 'q1',
    question_number: 1,
    question_text:
      "Assess the overall safety culture observed on the contractor's site.",
    required: true,
    placeholder: 'Describe safety culture observations...'
  },
  {
    id: 'q2',
    question_number: 2,
    question_text: 'Evaluate housekeeping and site organization standards.',
    required: true,
    placeholder: 'Your assessment...'
  },
  {
    id: 'q3',
    question_number: 3,
    question_text: 'Review equipment maintenance and inspection records.',
    required: true,
    placeholder: 'Your review findings...'
  },
  {
    id: 'q4',
    question_number: 4,
    question_text: "Assess the contractor's toolbox talk effectiveness.",
    required: true,
    placeholder: 'Your evaluation...'
  },
  {
    id: 'q5',
    question_number: 5,
    question_text: 'Evaluate worker engagement in safety processes.',
    required: true,
    placeholder: 'Your assessment...'
  }
];

export default function FRM34Page() {
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
    console.log('Saving FRM34 answers:', answers);
  };

  const handleSubmit = async (answers: Record<string, string>) => {
    try {
      console.log('Submitting FRM34:', {
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
                FRM34 - Site Observation Form
              </p>
              <p className='text-sm text-blue-700 dark:text-blue-300'>
                This form is filled by the Supervisor for detailed site
                observations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {profile?.role_id !== 5 && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Only Supervisors can fill out FRM34. Your current role:{' '}
            {profile?.role_id}
          </AlertDescription>
        </Alert>
      )}

      <FRMQuestionnaire
        formId='frm34'
        formTitle='FRM34 - Site Observation Form'
        formDescription='Document detailed observations from site visits and inspections.'
        questions={FRM34_QUESTIONS}
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
