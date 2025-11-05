'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  CheckCircle2
} from 'lucide-react';

export interface FRMQuestion {
  id: string;
  question_number: number;
  question_text: string;
  required: boolean;
  placeholder?: string;
}

interface FRMQuestionnaireProps {
  formId: string;
  formTitle: string;
  formDescription?: string;
  questions: FRMQuestion[];
  sessionId?: string;
  contractorId?: string;
  cycle?: number;
  onSubmit: (answers: Record<string, string>) => Promise<void>;
  onSave?: (answers: Record<string, string>) => Promise<void>;
  initialAnswers?: Record<string, string>;
  readonly?: boolean;
}

export function FRMQuestionnaire({
  formId,
  formTitle,
  formDescription,
  questions,
  sessionId,
  contractorId,
  cycle = 1,
  onSubmit,
  onSave,
  initialAnswers = {},
  readonly = false
}: FRMQuestionnaireProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] =
    useState<Record<string, string>>(initialAnswers);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const answeredCount = Object.keys(answers).filter((key) =>
    answers[key]?.trim()
  ).length;

  useEffect(() => {
    setAnswers(initialAnswers);
  }, [initialAnswers]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSave = async () => {
    if (!onSave) return;

    try {
      setIsSaving(true);
      await onSave(answers);
      toast.success('Progress saved successfully');
    } catch (error) {
      toast.error('Failed to save progress');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    // Validate all required questions are answered
    const unansweredRequired = questions.filter(
      (q) => q.required && !answers[q.id]?.trim()
    );

    if (unansweredRequired.length > 0) {
      toast.error(
        `Please answer all required questions (${unansweredRequired.length} remaining)`
      );
      // Jump to first unanswered question
      const firstUnansweredIndex = questions.findIndex(
        (q) => q.id === unansweredRequired[0].id
      );
      setCurrentQuestionIndex(firstUnansweredIndex);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(answers);
      toast.success('Form submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit form');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCurrentQuestionAnswered = answers[currentQuestion?.id]?.trim();
  const canSubmit =
    answeredCount === questions.filter((q) => q.required).length;

  return (
    <div className='mx-auto max-w-4xl space-y-6'>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-2xl'>{formTitle}</CardTitle>
              {formDescription && (
                <CardDescription className='mt-2'>
                  {formDescription}
                </CardDescription>
              )}
            </div>
            <Badge variant='outline' className='text-sm'>
              {formId.toUpperCase()}
            </Badge>
          </div>
          {(sessionId || contractorId) && (
            <div className='text-muted-foreground mt-4 flex gap-4 text-sm'>
              {sessionId && <span>Session: {sessionId}</span>}
              {contractorId && <span>Contractor: {contractorId}</span>}
              {cycle && <span>Cycle: {cycle}</span>}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Progress */}
      <Card>
        <CardContent className='pt-6'>
          <div className='space-y-2'>
            <div className='flex items-center justify-between text-sm'>
              <span className='font-medium'>Overall Progress</span>
              <span className='text-muted-foreground'>
                {answeredCount} / {totalQuestions} answered
              </span>
            </div>
            <Progress
              value={(answeredCount / totalQuestions) * 100}
              className='h-2'
            />
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <Badge variant='secondary'>
              Question {currentQuestion?.question_number} of {totalQuestions}
            </Badge>
            {isCurrentQuestionAnswered && (
              <CheckCircle2 className='h-5 w-5 text-green-500' />
            )}
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <h3 className='text-lg leading-relaxed font-medium'>
              {currentQuestion?.question_text}
              {currentQuestion?.required && (
                <span className='ml-1 text-red-500'>*</span>
              )}
            </h3>
          </div>

          <Textarea
            value={answers[currentQuestion?.id] || ''}
            onChange={(e) =>
              handleAnswerChange(currentQuestion?.id, e.target.value)
            }
            placeholder={
              currentQuestion?.placeholder || 'Type your answer here...'
            }
            className='min-h-[150px]'
            disabled={readonly}
          />

          {/* Navigation */}
          <div className='flex items-center justify-between pt-4'>
            <Button
              variant='outline'
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 || readonly}
            >
              <ChevronLeft className='mr-2 h-4 w-4' />
              Previous
            </Button>

            <div className='text-muted-foreground text-sm'>
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </div>

            <Button
              onClick={handleNext}
              disabled={currentQuestionIndex === totalQuestions - 1 || readonly}
            >
              Next
              <ChevronRight className='ml-2 h-4 w-4' />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Question Navigator */}
      <Card>
        <CardHeader>
          <CardTitle className='text-sm'>Quick Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-10 gap-2'>
            {questions.map((q, index) => {
              const isAnswered = answers[q.id]?.trim();
              const isCurrent = index === currentQuestionIndex;

              return (
                <Button
                  key={q.id}
                  variant={isCurrent ? 'default' : 'outline'}
                  size='sm'
                  className={`h-10 w-full ${
                    isAnswered && !isCurrent
                      ? 'border-green-500 bg-green-50 dark:bg-green-950'
                      : ''
                  }`}
                  onClick={() => setCurrentQuestionIndex(index)}
                  disabled={readonly}
                >
                  {q.question_number}
                  {isAnswered && !isCurrent && (
                    <CheckCircle2 className='ml-1 h-3 w-3 text-green-500' />
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {!readonly && (
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div className='text-muted-foreground text-sm'>
                {canSubmit ? (
                  <span className='text-green-600 dark:text-green-400'>
                    All required questions answered!
                  </span>
                ) : (
                  <span>
                    {questions.filter((q) => q.required).length - answeredCount}{' '}
                    required questions remaining
                  </span>
                )}
              </div>

              <div className='flex gap-2'>
                {onSave && (
                  <Button
                    variant='outline'
                    onClick={handleSave}
                    disabled={isSaving || isSubmitting}
                  >
                    <Save className='mr-2 h-4 w-4' />
                    {isSaving ? 'Saving...' : 'Save Progress'}
                  </Button>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                >
                  <Send className='mr-2 h-4 w-4' />
                  {isSubmitting ? 'Submitting...' : 'Submit Form'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
