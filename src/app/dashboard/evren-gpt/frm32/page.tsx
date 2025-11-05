'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import {
  FRMQuestionnaire,
  FRMQuestion
} from '@/features/evren-gpt/components/frm-questionnaire';

// Mock questions - these would come from backend/database
const FRM32_QUESTIONS: FRMQuestion[] = [
  {
    id: 'q1',
    question_number: 1,
    question_text:
      "Describe your company's safety policy and how it is communicated to all employees.",
    required: true,
    placeholder: 'Explain in detail...'
  },
  {
    id: 'q2',
    question_number: 2,
    question_text:
      'What safety training programs do you have in place for your employees?',
    required: true,
    placeholder: 'List training programs and frequency...'
  },
  {
    id: 'q3',
    question_number: 3,
    question_text:
      'How do you conduct risk assessments before starting a new project?',
    required: true,
    placeholder: 'Describe your risk assessment process...'
  },
  {
    id: 'q4',
    question_number: 4,
    question_text:
      'What personal protective equipment (PPE) do you provide to your workers?',
    required: true,
    placeholder: 'List PPE and distribution methods...'
  },
  {
    id: 'q5',
    question_number: 5,
    question_text:
      'Describe your incident reporting and investigation procedures.',
    required: true,
    placeholder: 'Explain reporting process and investigation steps...'
  },
  {
    id: 'q6',
    question_number: 6,
    question_text:
      'How do you ensure compliance with local safety regulations and standards?',
    required: true,
    placeholder: 'Detail compliance measures...'
  },
  {
    id: 'q7',
    question_number: 7,
    question_text: 'What emergency response procedures do you have in place?',
    required: true,
    placeholder: 'Describe emergency procedures...'
  },
  {
    id: 'q8',
    question_number: 8,
    question_text: 'How do you monitor and track safety performance metrics?',
    required: true,
    placeholder: 'List KPIs and tracking methods...'
  },
  {
    id: 'q9',
    question_number: 9,
    question_text: 'Describe your contractor safety orientation process.',
    required: false,
    placeholder: 'Explain orientation steps (optional)...'
  },
  {
    id: 'q10',
    question_number: 10,
    question_text:
      'What continuous improvement initiatives do you have for safety management?',
    required: false,
    placeholder: 'Describe improvement programs (optional)...'
  }
];

export default function FRM32Page() {
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

      if (!sessionId || !contractorId) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `https://api.snsdconsultant.com/api/evren-gpt/forms/submissions?session_id=${sessionId}&contractor_id=${contractorId}&form_id=frm32&cycle=${cycle}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'x-tenant-id': profile?.tenant_id || ''
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setInitialAnswers(data[0].answers || {});
        }
      }
    } catch (error) {
      toast.error('Failed to load existing answers');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (answers: Record<string, string>) => {
    try {
      await fetch('https://api.snsdconsultant.com/api/evren-gpt/forms/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'x-tenant-id': profile?.tenant_id || ''
        },
        body: JSON.stringify({
          form_id: 'frm32',
          session_id: sessionId,
          contractor_id: contractorId,
          cycle,
          answers,
          status: 'draft' // Save as draft
        })
      });
    } catch (error) {
      console.error('Failed to save:', error);
      throw error;
    }
  };

  const handleSubmit = async (answers: Record<string, string>) => {
    try {
      const response = await fetch(
        'https://api.snsdconsultant.com/api/evren-gpt/forms/submit',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'x-tenant-id': profile?.tenant_id || ''
          },
          body: JSON.stringify({
            form_id: 'frm32',
            session_id: sessionId,
            contractor_id: contractorId,
            cycle,
            answers
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      // After successful submission, redirect
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
      {/* Info Banner */}
      <Card className='bg-blue-50 dark:bg-blue-950'>
        <CardContent className='pt-6'>
          <div className='flex items-start gap-3'>
            <FileText className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400' />
            <div className='space-y-1'>
              <p className='text-sm font-medium text-blue-900 dark:text-blue-100'>
                FRM32 - Contractor Self-Assessment
              </p>
              <p className='text-sm text-blue-700 dark:text-blue-300'>
                This form is filled by the Contractor Admin. Your answers will
                be scored by AI (0, 3, 6, 10 points per question). After
                submission, the Supervisor will be notified to complete FRM33.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permission Check Alert */}
      {profile?.role_id !== 4 && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Only Contractor Admins can fill out FRM32. Your current role:{' '}
            {profile?.role_id}
          </AlertDescription>
        </Alert>
      )}

      {/* Questionnaire */}
      <FRMQuestionnaire
        formId='frm32'
        formTitle='FRM32 - Contractor Self-Assessment Form'
        formDescription="Please answer all questions about your company's safety practices and procedures."
        questions={FRM32_QUESTIONS}
        sessionId={sessionId || undefined}
        contractorId={contractorId || undefined}
        cycle={cycle}
        onSubmit={handleSubmit}
        onSave={handleSave}
        initialAnswers={initialAnswers}
        readonly={profile?.role_id !== 4}
      />
    </div>
  );
}
