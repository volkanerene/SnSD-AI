'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileUp
} from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Document Item Component
interface DocumentItemProps {
  number: string;
  title: string;
  required: boolean;
  isUploaded: boolean;
  isUploading: boolean;
  onFileSelect: (file: File) => void;
}

function DocumentItem({
  number,
  title,
  required,
  isUploaded,
  isUploading,
  onFileSelect
}: DocumentItemProps) {
  const fileInputId = `doc-${number}`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div
      className={`rounded-lg border-2 p-4 ${
        isUploaded
          ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/30'
          : required
            ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30'
            : 'border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30'
      }`}
    >
      <div className='mb-3 flex items-start justify-between gap-3'>
        <div>
          <div className='mb-1 flex items-center gap-2'>
            <span
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold ${
                isUploaded
                  ? 'bg-green-600 text-white dark:bg-green-700'
                  : required
                    ? 'bg-red-600 text-white dark:bg-red-700'
                    : 'bg-blue-600 text-white dark:bg-blue-700'
              }`}
            >
              {number}
            </span>
            <h4 className='text-foreground text-sm font-semibold'>{title}</h4>
          </div>
          <div className='ml-8'>
            <span
              className={`inline-block rounded px-2 py-1 text-xs font-bold ${
                isUploaded
                  ? 'bg-green-600 text-white dark:bg-green-700'
                  : required
                    ? 'bg-red-600 text-white dark:bg-red-700'
                    : 'bg-blue-600 text-white dark:bg-blue-700'
              }`}
            >
              {isUploaded ? 'UPLOADED' : required ? 'REQUIRED' : 'OPTIONAL'}
            </span>
          </div>
        </div>
      </div>
      <div className='ml-8'>
        <Label htmlFor={fileInputId} className='block cursor-pointer'>
          <Input
            id={fileInputId}
            type='file'
            accept='.pdf,.doc,.docx,.jpg,.png'
            className='hidden'
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <div
            className={`hover:border-opacity-70 rounded-lg border-2 border-dashed p-3 text-center transition-colors ${
              isUploaded
                ? 'text-foreground border-green-400 hover:bg-green-100 dark:border-green-700 dark:hover:bg-green-900/30'
                : required
                  ? 'text-foreground border-red-400 hover:bg-red-100 dark:border-red-700 dark:hover:bg-red-900/30'
                  : 'text-foreground border-blue-400 hover:bg-blue-100 dark:border-blue-700 dark:hover:bg-blue-900/30'
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className='mx-auto mb-1 h-5 w-5 animate-spin' />
                <p className='text-xs font-medium'>Uploading...</p>
              </>
            ) : isUploaded ? (
              <>
                <CheckCircle className='mx-auto mb-1 h-5 w-5 text-green-600' />
                <p className='text-xs font-medium'>Uploaded</p>
              </>
            ) : (
              <>
                <FileUp className='mx-auto mb-1 h-5 w-5' />
                <p className='text-xs font-medium'>📎 Upload</p>
              </>
            )}
          </div>
        </Label>
      </div>
    </div>
  );
}

// --- Helpers ---
function cycleToEvaluationPeriod(cycle: number, base = new Date()) {
  const year = base.getFullYear();
  return `${year}-${String(cycle).padStart(2, '0')}`; // "2025-01"
}

function getQuestionNumber(questionCode: string, k2Category: string): string {
  // question_11A + 1.1 → 1.1.A
  const letter = questionCode.replace(/^question_\d+/, '');
  return `${k2Category}.${letter}`;
}

// FRM32 Questions will be loaded from API
interface FRM32Question {
  id: string;
  question_code: string;
  question_text_en: string;
  k2_category: string;
  is_required: boolean;
  position: number;
}

export default function FRM32Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile, isLoading: isProfileLoading } = useProfile();

  const [questions, setQuestions] = useState<FRM32Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>(
    'idle'
  );
  const [missingAnswers, setMissingAnswers] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [tabValue, setTabValue] = useState('questions');
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, boolean>>(
    {}
  );
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>(
    {}
  );

  const contractorId = profile?.contractor_id || profile?.id;
  const tenantId = profile?.tenant_id;
  const cycle = parseInt(searchParams.get('cycle') || '1', 10);
  const evaluationPeriod = cycleToEvaluationPeriod(cycle);

  const autoSaveTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.values(answers).filter(
    (a) => a && a.trim()
  ).length;
  const progressPercentage =
    questions.length > 0
      ? Math.round((answeredCount / questions.length) * 100)
      : 0;

  const ready = Boolean(contractorId && tenantId);

  // Fetch questions from API
  useEffect(() => {
    async function fetchQuestions() {
      if (!ready) return;
      try {
        const response = await apiClient.get<FRM32Question[]>(
          '/frm32/questions',
          { tenantId: tenantId! }
        );
        const fetchedQuestions = Array.isArray(response)
          ? response
          : [response];
        setQuestions(fetchedQuestions);
        console.log('[FRM32] Questions loaded:', fetchedQuestions.length);
      } catch (e: any) {
        console.error('[FRM32] Failed to load questions:', e?.message || e);
        toast.error('Failed to load form questions');
      }
    }
    fetchQuestions();
  }, [ready, tenantId]);

  // Debug: Log profile info on mount
  useEffect(() => {
    if (profile) {
      console.log('[FRM32] Profile data:', {
        id: profile?.id,
        contractor_id: profile?.contractor_id,
        tenant_id: profile?.tenant_id,
        role_id: profile?.role_id
      });
      console.log('[FRM32] Resolved IDs:', {
        contractorId,
        tenantId,
        ready
      });
    }
  }, [profile, contractorId, tenantId, ready]);

  // İlk yükleme: submission bul/oluştur + answers çek
  useEffect(() => {
    async function bootstrap() {
      if (!ready || questions.length === 0) return;
      setIsLoading(true);
      try {
        // 1) Var mı? (status filter is optional, just find by contractor_id and evaluation_period)
        const existing = await apiClient.get<any[]>(
          `/frm32/submissions?contractor_id=${contractorId}&evaluation_period=${evaluationPeriod}`,
          { tenantId: tenantId! }
        );
        let sub = existing?.[0];

        // 2) Yoksa oluştur
        if (!sub) {
          console.log('[FRM32] Creating new submission with:', {
            contractor_id: contractorId,
            evaluation_period: evaluationPeriod,
            tenant_id: tenantId
          });

          sub = await apiClient.post<any>(
            '/frm32/submissions',
            {
              contractor_id: contractorId,
              evaluation_period: evaluationPeriod,
              status: 'draft',
              evaluation_type: 'periodic',
              progress_percentage: 0,
              answers: {},
              attachments: [],
              metadata: {}
            },
            { tenantId: tenantId! }
          );
          // sub is a single object after POST, not an array
          if (Array.isArray(sub)) {
            sub = sub[0];
          }
        }

        const id = sub?.id || (Array.isArray(sub) ? sub[0]?.id : undefined);
        if (!id) throw new Error('Submission could not be initialized');
        setSubmissionId(id);

        // 3) Answers are stored in the submission's answers JSONB field
        // No separate /frm32/answers endpoint - answers are embedded in the submission
        const answers = sub?.answers || {};
        setAnswers(answers);

        // 4) Initialize uploadedFiles from attachments (for page refresh persistence)
        const attachments = sub?.attachments || [];
        if (Array.isArray(attachments) && attachments.length > 0) {
          const uploadedFilesMap: Record<string, boolean> = {};
          attachments.forEach((att: any) => {
            if (att.docId) {
              uploadedFilesMap[att.docId] = true;
            }
          });
          setUploadedFiles(uploadedFilesMap);
          console.log(
            '[FRM32] Initialized uploadedFiles from attachments:',
            uploadedFilesMap
          );
        }

        // Set currentQuestionIndex to first unanswered question
        const firstUnansweredIndex = questions.findIndex(
          (q) =>
            !answers[q.question_code] || answers[q.question_code].trim() === ''
        );
        if (firstUnansweredIndex >= 0) {
          setCurrentQuestionIndex(firstUnansweredIndex);
        }

        console.log(
          '[FRM32] Bootstrap complete - submission:',
          id,
          'answers:',
          answers,
          'first unanswered:',
          firstUnansweredIndex
        );
      } catch (e: any) {
        const errorMessage =
          e?.response?.data?.detail || e?.message || String(e);
        console.error('[FRM32] bootstrap error:', {
          message: errorMessage,
          status: e?.response?.status,
          data: e?.response?.data,
          error: e
        });
        toast.error(`Failed to load form: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    }
    bootstrap();
  }, [ready, contractorId, tenantId, evaluationPeriod, questions]);

  // Autosave tetikleyici
  const handleAnswerChange = useCallback(
    (questionId: string, value: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
      if (!ready || !submissionId) return;

      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      const snapshot = { ...answers, [questionId]: value };
      setSaveStatus('saving');
      autoSaveTimer.current = setTimeout(() => autoSaveDraft(snapshot), 2000);
    },
    [answers, ready, submissionId]
  );

  // Autosave → update submission with answers JSONB
  async function autoSaveDraft(answersToSave: Record<string, string>) {
    if (!submissionId || !tenantId) {
      setSaveStatus('idle');
      return;
    }
    try {
      // Answers are stored in the submission's answers JSONB field
      // Update the entire submission with the new answers
      await apiClient.put(
        `/frm32/submissions/${submissionId}`,
        {
          answers: answersToSave,
          progress_percentage:
            questions.length > 0
              ? Math.round(
                  (Object.values(answersToSave).filter((a) => a && a.trim())
                    .length /
                    questions.length) *
                    100
                )
              : 0
        },
        { tenantId }
      );
      console.log('[FRM32] Autosave successful');
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1200);
    } catch (e: any) {
      console.error('[FRM32] autosave error:', e?.message || e);
      setSaveStatus('idle');
    }
  }

  // Handle document file uploads
  const handleDocumentUpload = useCallback(
    async (docId: string, file: File) => {
      if (!submissionId || !tenantId) {
        toast.error('Submission not initialized');
        return;
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error('File size exceeds 10MB limit');
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG');
        return;
      }

      setUploadingFiles((prev) => ({ ...prev, [docId]: true }));

      try {
        // Create FormData for file upload (only file, docId goes as query param)
        const formData = new FormData();
        formData.append('file', file);

        // Upload file via API with docId as query parameter
        // Note: Do NOT set Content-Type header - let the browser set it automatically with boundary
        await apiClient.post(
          `/frm32/submissions/${submissionId}/upload?docId=${encodeURIComponent(docId)}`,
          formData,
          { tenantId }
        );

        // Update uploadedFiles state
        setUploadedFiles((prev) => ({ ...prev, [docId]: true }));
        toast.success(`${file.name} uploaded successfully`);

        console.log('[FRM32] File uploaded:', {
          docId,
          fileName: file.name,
          size: file.size
        });
      } catch (e: any) {
        const errorMessage =
          e?.response?.data?.detail || e?.message || 'Upload failed';
        console.error('[FRM32] File upload error:', errorMessage);
        toast.error(`Failed to upload file: ${errorMessage}`);
      } finally {
        setUploadingFiles((prev) => ({ ...prev, [docId]: false }));
      }
    },
    [submissionId, tenantId]
  );

  const validateForm = (): boolean => {
    const missing: string[] = [];
    questions.forEach((q) => {
      if (
        q.is_required &&
        (!answers[q.question_code] || answers[q.question_code].trim() === '')
      ) {
        const questionNumber = getQuestionNumber(
          q.question_code,
          q.k2_category
        );
        missing.push(`${questionNumber} - ${q.question_text_en}`);
      }
    });
    setMissingAnswers(missing);
    return missing.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error(
        `Please answer all ${missingAnswers.length} required questions`
      );
      setTabValue('all-questions');
      return;
    }
    if (!submissionId || !tenantId) {
      toast.error('Submission not initialized');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1) Update submission status to 'submitted'
      const submissionData = {
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        progress_percentage: 100
      };

      await apiClient.put(
        `/frm32/submissions/${submissionId}`,
        submissionData,
        { tenantId }
      );

      console.log('[FRM32] Submission successful:', {
        id: submissionId,
        contractor_id: contractorId,
        evaluation_period: evaluationPeriod,
        status: 'submitted'
      });

      // 2) Trigger N8N webhook for supervisor notification
      // This webhook will:
      // - Send email to supervisor
      // - Create follow-up forms (FRM33, FRM34, FRM35)
      // - Log submission to audit
      try {
        await fetch('https://9tml6o6w.rpcld.cc/webhook/submit-frm32', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            submission_id: submissionId,
            contractor_id: contractorId,
            evaluation_period: evaluationPeriod,
            tenant_id: tenantId,
            contractor_name: profile?.full_name,
            answers_count: Object.keys(answers).length,
            submitted_at: new Date().toISOString()
          })
        });
      } catch (webhookError) {
        console.warn('[FRM32] N8N webhook notification failed:', webhookError);
        // Don't fail submission if webhook fails
      }

      toast.success(
        'Form submitted successfully! Supervisor will be notified.'
      );
      setTimeout(() => {
        router.push('/dashboard/evren-gpt');
      }, 2000);
    } catch (e: any) {
      console.error('[FRM32] submit error:', e?.message || e);
      toast.error(e?.message || 'Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageLoading = isProfileLoading || isLoading;

  if (pageLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center p-8'>
        <div className='flex flex-col items-center gap-2'>
          <Loader2 className='h-8 w-8 animate-spin' />
          <p className='text-muted-foreground'>Loading FRM32 Form...</p>
        </div>
      </div>
    );
  }

  const canGoNext = currentQuestionIndex < questions.length - 1;
  const canGoPrev = currentQuestionIndex > 0;

  return (
    <div className='mx-auto max-w-6xl space-y-6 p-4 pt-6 md:p-8'>
      {/* Header with Company Info */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <div className='md:col-span-2'>
          <h1 className='mb-2 text-3xl font-bold'>
            FRM32 - HSE Capability Assessment
          </h1>
          <p className='text-muted-foreground'>
            All questions are required. Your answers are automatically saved as
            you type.
          </p>
        </div>
        <Card className='bg-muted/50'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm'>Submission Details</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2 text-sm'>
            <div>
              <p className='text-muted-foreground text-xs font-medium'>
                Contractor
              </p>
              <p className='font-semibold'>{profile?.full_name || 'N/A'}</p>
            </div>
            <div>
              <p className='text-muted-foreground text-xs font-medium'>
                Assessment Period
              </p>
              <p className='font-semibold'>{evaluationPeriod}</p>
            </div>
            <div>
              <p className='text-muted-foreground text-xs font-medium'>
                Tax ID
              </p>
              <p className='font-semibold'>TBD</p>
            </div>
            <div>
              <p className='text-muted-foreground text-xs font-medium'>
                Status
              </p>
              <Badge
                variant={progressPercentage === 100 ? 'default' : 'secondary'}
              >
                {progressPercentage}% Complete
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <div className='space-y-2'>
        <div className='bg-secondary h-2 w-full rounded-full'>
          <div
            className='bg-primary h-2 rounded-full transition-all duration-300'
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className='text-muted-foreground text-xs'>
          {answeredCount} of {questions.length} questions answered
        </p>
      </div>

      {/* Save Status */}
      {saveStatus === 'saving' && (
        <Alert>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>Saving your answers...</AlertDescription>
        </Alert>
      )}
      {saveStatus === 'saved' && (
        <Alert className='border-green-200 bg-green-50'>
          <CheckCircle className='h-4 w-4 text-green-600' />
          <AlertDescription className='text-green-800'>
            Changes saved automatically
          </AlertDescription>
        </Alert>
      )}

      {!ready && (
        <Alert>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Loading your profile… Autosave is disabled until your profile loads.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={tabValue} onValueChange={setTabValue}>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='questions'>Current Question</TabsTrigger>
          <TabsTrigger value='all-questions'>All Questions</TabsTrigger>
          <TabsTrigger value='files'>File Uploads</TabsTrigger>
        </TabsList>

        {/* Current Question */}
        <TabsContent value='questions' className='space-y-6'>
          <Card>
            <CardHeader className='pb-3'>
              <div className='flex items-start justify-between gap-4'>
                <div className='flex-1'>
                  <div className='text-muted-foreground mb-2 text-sm font-medium'>
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </div>
                  <CardTitle className='text-lg'>
                    {currentQuestion &&
                      getQuestionNumber(
                        currentQuestion.question_code,
                        currentQuestion.k2_category
                      )}
                    . {currentQuestion?.question_text_en}
                  </CardTitle>
                </div>
                {currentQuestion?.is_required && (
                  <Badge variant='destructive'>Required</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <Textarea
                value={
                  currentQuestion
                    ? answers[currentQuestion.question_code] || ''
                    : ''
                }
                onChange={(e) =>
                  currentQuestion &&
                  handleAnswerChange(
                    currentQuestion.question_code,
                    e.target.value
                  )
                }
                placeholder='Please provide a detailed response...'
                className='min-h-40'
                disabled={!ready || !submissionId || !currentQuestion}
              />
              {currentQuestion && answers[currentQuestion.question_code] && (
                <p className='flex items-center gap-1 text-xs text-green-600'>
                  <CheckCircle className='h-3 w-3' /> Answer saved
                </p>
              )}
            </CardContent>
          </Card>

          <div className='flex gap-4'>
            <Button
              onClick={() =>
                setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
              }
              disabled={!canGoPrev}
              variant='outline'
              size='lg'
              className='flex-1'
            >
              <ChevronLeft className='mr-2 h-4 w-4' />
              Previous
            </Button>
            <Button
              onClick={() =>
                setCurrentQuestionIndex(
                  Math.min(questions.length - 1, currentQuestionIndex + 1)
                )
              }
              disabled={!canGoNext}
              variant='outline'
              size='lg'
              className='flex-1'
            >
              Next
              <ChevronRight className='ml-2 h-4 w-4' />
            </Button>
          </div>
        </TabsContent>

        {/* All Questions Grid */}
        <TabsContent value='all-questions' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>All {questions.length} Questions</CardTitle>
              <p className='text-muted-foreground mt-2 text-sm'>
                {answeredCount} answered
              </p>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3'>
                {questions.map((q, idx) => {
                  const isAnswered =
                    answers[q.question_code] && answers[q.question_code].trim();
                  return (
                    <button
                      key={q.question_code}
                      onClick={() => {
                        setCurrentQuestionIndex(idx);
                        setTabValue('questions');
                      }}
                      className={`rounded-lg border-2 p-3 text-left transition-colors ${
                        isAnswered
                          ? 'text-foreground border-green-600 bg-green-100 hover:bg-green-200 dark:border-green-500 dark:bg-green-900/30 dark:hover:bg-green-900/50'
                          : 'text-foreground border-gray-300 bg-gray-100 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className='flex items-start justify-between gap-2'>
                        <div className='flex-1'>
                          <p className='text-xs font-bold text-gray-700 dark:text-gray-200'>
                            {getQuestionNumber(q.question_code, q.k2_category)}
                          </p>
                          <p className='line-clamp-2 text-xs text-gray-700 dark:text-gray-300'>
                            {q.question_text_en}
                          </p>
                        </div>
                        {isAnswered && (
                          <CheckCircle className='h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400' />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Files */}
        <TabsContent value='files' className='space-y-6'>
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-xl'>
                Required Documents (18 Total)
              </CardTitle>
              <p className='text-muted-foreground mt-2 text-sm'>
                Upload required documents. Optional documents can improve your
                assessment score.
              </p>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <DocumentItem
                  number='1'
                  title='HSE Policy'
                  required={true}
                  isUploaded={uploadedFiles['doc-1'] || false}
                  isUploading={uploadingFiles['doc-1'] || false}
                  onFileSelect={(file) => handleDocumentUpload('doc-1', file)}
                />
                <DocumentItem
                  number='2'
                  title='ISO Certificates'
                  required={false}
                  isUploaded={uploadedFiles['doc-2'] || false}
                  isUploading={uploadingFiles['doc-2'] || false}
                  onFileSelect={(file) => handleDocumentUpload('doc-2', file)}
                />
                <DocumentItem
                  number='3'
                  title='HSE Management System Document'
                  required={false}
                  isUploaded={uploadedFiles['doc-3'] || false}
                  isUploading={uploadingFiles['doc-3'] || false}
                  onFileSelect={(file) => handleDocumentUpload('doc-3', file)}
                />
                <DocumentItem
                  number='4'
                  title='HSE Organization Chart'
                  required={true}
                  isUploaded={uploadedFiles['doc-4'] || false}
                  isUploading={uploadingFiles['doc-4'] || false}
                  onFileSelect={(file) => handleDocumentUpload('doc-4', file)}
                />
                <DocumentItem
                  number='5'
                  title='Company Organization Chart'
                  required={false}
                  isUploaded={uploadedFiles['doc-5'] || false}
                  isUploading={uploadingFiles['doc-5'] || false}
                  onFileSelect={(file) => handleDocumentUpload('doc-5', file)}
                />
                <DocumentItem
                  number='6'
                  title='CVs of HSE Officers'
                  required={true}
                  isUploaded={uploadedFiles['doc-6'] || false}
                  isUploading={uploadingFiles['doc-6'] || false}
                  onFileSelect={(file) => handleDocumentUpload('doc-6', file)}
                />
                <DocumentItem
                  number='7'
                  title='Training Records - Basic HSE Training'
                  required={true}
                  isUploaded={uploadedFiles['doc-7'] || false}
                  isUploading={uploadingFiles['doc-7'] || false}
                  onFileSelect={(file) => handleDocumentUpload('doc-7', file)}
                />
                <DocumentItem
                  number='7.1'
                  title='Training Records - Emergency Procedures'
                  required={true}
                  isUploaded={uploadedFiles['doc-7.1'] || false}
                  isUploading={uploadingFiles['doc-7.1'] || false}
                  onFileSelect={(file) => handleDocumentUpload('doc-7.1', file)}
                />
                <DocumentItem
                  number='8'
                  title='Incident & Accident Records'
                  required={true}
                  isUploaded={uploadedFiles['doc-8'] || false}
                  isUploading={uploadingFiles['doc-8'] || false}
                  onFileSelect={(file) => handleDocumentUpload('doc-8', file)}
                />
                <DocumentItem
                  number='9'
                  title='Risk Assessment Records'
                  required={false}
                  isUploaded={uploadedFiles['doc-9'] || false}
                  isUploading={uploadingFiles['doc-9'] || false}
                  onFileSelect={(file) => handleDocumentUpload('doc-9', file)}
                />
                <DocumentItem
                  number='10'
                  title='HAZOP or FMEA Studies'
                  required={false}
                  isUploaded={uploadedFiles['doc-10'] || false}
                  isUploading={uploadingFiles['doc-10'] || false}
                  onFileSelect={(file) => handleDocumentUpload('doc-10', file)}
                />
                <DocumentItem
                  number='11'
                  title='HSE Procedures Document'
                  required={true}
                  isUploaded={uploadedFiles['doc-11'] || false}
                  isUploading={uploadingFiles['doc-11'] || false}
                  onFileSelect={(file) => handleDocumentUpload('doc-11', file)}
                />
                <DocumentItem
                  number='12'
                  title='Inspection & Maintenance Records'
                  required={true}
                  isUploaded={uploadedFiles['doc-12'] || false}
                  isUploading={uploadingFiles['doc-12'] || false}
                  onFileSelect={(file) => handleDocumentUpload('doc-12', file)}
                />
                <DocumentItem
                  number='13'
                  title='PPE & Licenses'
                  required={true}
                  isUploaded={uploadedFiles['doc-13'] || false}
                  isUploading={uploadingFiles['doc-13'] || false}
                  onFileSelect={(file) => handleDocumentUpload('doc-13', file)}
                />
                <DocumentItem
                  number='14'
                  title='Environmental Programs & Records'
                  required={false}
                  isUploaded={uploadedFiles['doc-14'] || false}
                  isUploading={uploadingFiles['doc-14'] || false}
                  onFileSelect={(file) => handleDocumentUpload('doc-14', file)}
                />
                <DocumentItem
                  number='15'
                  title='HSE Audit Reports'
                  required={false}
                  isUploaded={uploadedFiles['doc-15'] || false}
                  isUploading={uploadingFiles['doc-15'] || false}
                  onFileSelect={(file) => handleDocumentUpload('doc-15', file)}
                />
                <DocumentItem
                  number='16'
                  title='Contractor HSE Records'
                  required={false}
                  isUploaded={uploadedFiles['doc-16'] || false}
                  isUploading={uploadingFiles['doc-16'] || false}
                  onFileSelect={(file) => handleDocumentUpload('doc-16', file)}
                />
                <DocumentItem
                  number='17'
                  title='Regulatory Compliance Records'
                  required={false}
                  isUploaded={uploadedFiles['doc-17'] || false}
                  isUploading={uploadingFiles['doc-17'] || false}
                  onFileSelect={(file) => handleDocumentUpload('doc-17', file)}
                />
                <DocumentItem
                  number='18'
                  title='HSE Performance Metrics & Reports'
                  required={false}
                  isUploaded={uploadedFiles['doc-18'] || false}
                  isUploading={uploadingFiles['doc-18'] || false}
                  onFileSelect={(file) => handleDocumentUpload('doc-18', file)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Submit */}
      {progressPercentage === 100 ? (
        <div className='space-y-3 pt-4'>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className='w-full'
            size='lg'
            variant='default'
          >
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className='mr-2 h-4 w-4' />
                Submit FRM32 Form
              </>
            )}
          </Button>
          <p className='text-muted-foreground text-center text-xs'>
            Your supervisor will be notified and can begin reviewing other forms
          </p>
        </div>
      ) : (
        <Alert variant='default'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Please answer all{' '}
            <strong>
              {questions.length - answeredCount} remaining questions
            </strong>{' '}
            before submitting the form.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
