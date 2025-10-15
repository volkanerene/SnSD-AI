'use client';

import { useState } from 'react';
import { useQuestions } from '@/hooks/useQuestions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Circle, FileUp, Save } from 'lucide-react';
import { toast } from 'sonner';
import type { FRM32Submission, FRM32Question } from '@/types/api';

interface QuestionsTabProps {
  submission: FRM32Submission;
  tenantId: string;
}

export function QuestionsTab({ submission, tenantId }: QuestionsTabProps) {
  const { questions, isLoading } = useQuestions(true);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  if (isLoading) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <div className='text-muted-foreground text-center'>
            Loading questions...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <div className='text-muted-foreground text-center'>
            No questions available
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isAnswered = answers[currentQuestion.id] !== undefined;

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSaveAnswer = async () => {
    // TODO: Implement answer saving via API
    toast.success('Answer saved successfully');
  };

  const answeredCount = Object.keys(answers).length;
  const progressPercentage = (answeredCount / questions.length) * 100;

  return (
    <div className='space-y-4'>
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>Question Progress</span>
            <Badge variant='outline'>
              {answeredCount} / {questions.length} Answered
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center gap-2'>
            <div className='flex-1'>
              <div className='flex gap-1'>
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-2 flex-1 rounded ${
                      answers[q.id]
                        ? 'bg-green-500'
                        : idx === currentQuestionIndex
                          ? 'bg-blue-500'
                          : 'bg-gray-200'
                    }`}
                    title={`Question ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
            <span className='text-sm font-medium'>
              {progressPercentage.toFixed(0)}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      <Card>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <div className='mb-2 flex items-center gap-2'>
                <Badge variant='outline'>{currentQuestion.question_code}</Badge>
                <Badge variant='secondary'>{currentQuestion.k2_category}</Badge>
                {currentQuestion.is_required && (
                  <Badge variant='destructive'>Required</Badge>
                )}
              </div>
              <CardTitle className='text-lg'>
                {currentQuestion.question_text_en ||
                  currentQuestion.question_text_tr}
              </CardTitle>
            </div>
            {isAnswered ? (
              <CheckCircle2 className='h-6 w-6 text-green-500' />
            ) : (
              <Circle className='h-6 w-6 text-gray-300' />
            )}
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Answer Input Based on Question Type */}
          {currentQuestion.question_type === 'yes_no' && (
            <RadioGroup
              value={answers[currentQuestion.id] || ''}
              onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
            >
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='yes' id='yes' />
                <Label htmlFor='yes'>Yes</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='no' id='no' />
                <Label htmlFor='no'>No</Label>
              </div>
            </RadioGroup>
          )}

          {currentQuestion.question_type === 'multiple_choice' &&
            currentQuestion.options && (
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onValueChange={(value) =>
                  handleAnswer(currentQuestion.id, value)
                }
              >
                {currentQuestion.options.map((option) => (
                  <div key={option} className='flex items-center space-x-2'>
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

          {currentQuestion.question_type === 'number' && (
            <Input
              type='number'
              placeholder='Enter number'
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
            />
          )}

          {currentQuestion.question_type === 'text' && (
            <Textarea
              placeholder='Enter your answer'
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
              rows={4}
            />
          )}

          {currentQuestion.question_type === 'file_upload' && (
            <div className='rounded-lg border-2 border-dashed p-8 text-center'>
              <FileUp className='text-muted-foreground mx-auto mb-2 h-8 w-8' />
              <p className='text-muted-foreground mb-2 text-sm'>
                Upload supporting documents
              </p>
              <Button variant='outline' size='sm'>
                Choose Files
              </Button>
            </div>
          )}

          <Separator />

          {/* Notes Section */}
          <div className='space-y-2'>
            <Label htmlFor='notes'>Additional Notes (Optional)</Label>
            <Textarea
              id='notes'
              placeholder='Add any additional notes or context...'
              rows={3}
            />
          </div>

          {/* Scoring Info */}
          <div className='bg-muted flex items-center justify-between rounded-lg p-4'>
            <div className='text-sm'>
              <span className='text-muted-foreground'>Max Score: </span>
              <span className='font-medium'>{currentQuestion.max_score}</span>
            </div>
            <div className='text-sm'>
              <span className='text-muted-foreground'>Weight: </span>
              <span className='font-medium'>
                {(currentQuestion.k2_weight * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex items-center justify-between pt-4'>
            <Button
              variant='outline'
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>

            <span className='text-muted-foreground text-sm'>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>

            <div className='flex gap-2'>
              <Button variant='outline' onClick={handleSaveAnswer}>
                <Save className='mr-2 h-4 w-4' />
                Save
              </Button>
              <Button
                onClick={handleNext}
                disabled={currentQuestionIndex === questions.length - 1}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle>All Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            {questions.map((question, idx) => (
              <button
                key={question.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  idx === currentQuestionIndex
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted'
                }`}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    {answers[question.id] ? (
                      <CheckCircle2 className='h-4 w-4 text-green-500' />
                    ) : (
                      <Circle className='h-4 w-4 text-gray-300' />
                    )}
                    <Badge variant='outline' className='text-xs'>
                      {question.question_code}
                    </Badge>
                    <span className='text-sm font-medium'>
                      {question.question_text_en || question.question_text_tr}
                    </span>
                  </div>
                  {question.is_required && (
                    <Badge variant='destructive' className='text-xs'>
                      Required
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
