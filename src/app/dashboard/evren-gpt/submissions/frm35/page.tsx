'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

export default function FRM35SubmissionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useProfile();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contractorId = searchParams.get('contractor') || profile?.contractor_id;
  const tenantId = profile?.tenant_id;

  // FRM35 form fields
  const formFields = [
    {
      id: 'field_1',
      label: 'Quality Management System',
      description:
        'Describe the quality management system and standards compliance',
      required: true
    },
    {
      id: 'field_2',
      label: 'Quality Assurance Processes',
      description: 'Explain quality control and assurance procedures',
      required: true
    },
    {
      id: 'field_3',
      label: 'Customer Satisfaction',
      description:
        'Detail mechanisms for measuring and improving customer satisfaction',
      required: true
    },
    {
      id: 'field_4',
      label: 'Continuous Improvement',
      description: 'Describe continuous improvement and innovation initiatives',
      required: true
    },
    {
      id: 'field_5',
      label: 'Quality Performance Metrics',
      description: 'Provide key quality and performance indicators',
      required: true
    }
  ];

  const answeredCount = Object.values(answers).filter((a) => a?.trim()).length;
  const progressPercentage = Math.round(
    (answeredCount / formFields.length) * 100
  );

  const handleAnswerChange = (fieldId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = async () => {
    if (!contractorId || !tenantId) {
      toast.error('Missing contractor or tenant information');
      return;
    }

    const missingFields = formFields
      .filter((f) => f.required && !answers[f.id]?.trim())
      .map((f) => f.label);

    if (missingFields.length > 0) {
      toast.error(`Please fill required fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        contractor_id: contractorId,
        evaluation_period: new Date().toISOString().slice(0, 7),
        answers,
        status: 'submitted'
      };

      await apiClient.post('/frm35/submissions', payload, { tenantId });

      toast.success('FRM35 submitted successfully!');
      router.push('/dashboard/submissions');
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error?.message || 'Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile) {
    return (
      <div className='flex items-center justify-center p-8'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-4xl space-y-6 p-4 pt-6 md:p-8'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>
          FRM35 - Quality Management
        </h1>
        <p className='text-muted-foreground mt-2'>
          Quality assurance and continuous improvement assessment
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span>Form Completion</span>
              <span className='font-semibold'>{progressPercentage}%</span>
            </div>
            <div className='bg-secondary h-2 w-full rounded-full'>
              <div
                className='bg-primary h-2 rounded-full transition-all'
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className='text-muted-foreground text-xs'>
              {answeredCount} of {formFields.length} fields completed
            </p>
          </div>
        </CardContent>
      </Card>

      <div className='space-y-4'>
        {formFields.map((field) => (
          <Card key={field.id}>
            <CardHeader>
              <div className='flex items-start justify-between'>
                <div>
                  <CardTitle className='text-base'>{field.label}</CardTitle>
                  <p className='text-muted-foreground mt-1 text-sm'>
                    {field.description}
                  </p>
                </div>
                {answers[field.id]?.trim() && (
                  <CheckCircle className='h-5 w-5 flex-shrink-0 text-green-600' />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={answers[field.id] || ''}
                onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                placeholder='Enter your response...'
                className='min-h-32'
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className='border-primary/20 bg-primary/5'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            {progressPercentage === 100 ? (
              <CheckCircle className='h-5 w-5 text-green-600' />
            ) : (
              <AlertCircle className='h-5 w-5 text-yellow-600' />
            )}
            {progressPercentage === 100
              ? 'Ready to Submit'
              : 'Complete the form to submit'}
          </CardTitle>
        </CardHeader>
        <CardContent className='flex gap-3'>
          <Button
            variant='outline'
            onClick={() => router.push('/dashboard/submissions')}
          >
            Back to Submissions
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || progressPercentage < 100}
          >
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className='mr-2 h-4 w-4' />
                Submit FRM35
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
