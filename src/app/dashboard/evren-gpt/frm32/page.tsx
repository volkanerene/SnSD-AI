'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  FileUp,
  Download,
  Eye,
  List
} from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DocumentItemProps {
  number: string;
  title: string;
  required: boolean;
  isUploaded: boolean;
  isUploading: boolean;
  onFileSelect: (file: File) => void;
  isSupervisor: boolean;
  fileName?: string;
  onDownload?: () => void;
}

function DocumentItem({
  number,
  title,
  required,
  isUploaded,
  isUploading,
  onFileSelect,
  isSupervisor,
  fileName,
  onDownload
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
      <div className='ml-8 space-y-2'>
        {isUploaded && fileName && (
          <div className='flex items-center justify-between rounded bg-white/50 p-2 text-sm'>
            <span className='truncate'>{fileName}</span>
            {onDownload && (
              <Button
                size='sm'
                variant='ghost'
                onClick={onDownload}
                className='ml-2'
              >
                <Download className='h-4 w-4' />
              </Button>
            )}
          </div>
        )}
        {!isSupervisor && (
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
        )}
        {isSupervisor && isUploaded && (
          <div className='text-center text-xs text-green-600'>
            ✓ File uploaded
          </div>
        )}
        {isSupervisor && !isUploaded && (
          <div className='text-center text-xs text-gray-500'>
            No file uploaded
          </div>
        )}
      </div>
    </div>
  );
}

function cycleToEvaluationPeriod(cycle: number, base = new Date()) {
  const year = base.getFullYear();
  return `${year}-${String(cycle).padStart(2, '0')}`;
}

function getQuestionNumber(questionCode: string, k2Category: string): string {
  const letter = questionCode.replace(/^question_\d+/, '');
  return `${k2Category}.${letter}`;
}

interface FRM32Question {
  id: string;
  question_code: string;
  question_text_en: string;
  k2_category: string;
  is_required: boolean;
  position: number;
}

type ScoreOption = '0' | '3' | '6' | '10';

interface K2Comment {
  en: string;
  tr: string;
}

interface K2Metric {
  k2_code: string;
  scope_en: string;
  scope_tr: string;
  weight_percentage: number;
  comments: Record<ScoreOption, K2Comment>;
  score?: number | null;
  selected_comment_en?: string | null;
  selected_comment_tr?: string | null;
  ai_suggested_score?: number | null;
  ai_reasoning?: string | null;
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
  const [attachmentDetails, setAttachmentDetails] = useState<
    Record<string, { filename: string; file_url?: string }>
  >({});
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [k2Metrics, setK2Metrics] = useState<K2Metric[]>([]);
  const [k2Scores, setK2Scores] = useState<Record<string, number>>({});
  const [k2Saving, setK2Saving] = useState<Record<string, boolean>>({});
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [isK2Loading, setIsK2Loading] = useState(false);
  const [isRegeneratingAI, setIsRegeneratingAI] = useState(false);

  // For supervisors, contractor_id can come from URL params, for contractors it's from their profile
  const submissionParam = searchParams.get('submission');
  const supervisorContractorId = searchParams.get('contractor');
  const [resolvedContractorId, setResolvedContractorId] = useState<
    string | null
  >(supervisorContractorId || profile?.contractor_id || null);
  const contractorId = resolvedContractorId;
  const tenantId = profile?.tenant_id;
  const cycle = parseInt(searchParams.get('cycle') || '1', 10);
  const evaluationPeriod = cycleToEvaluationPeriod(cycle);

  const roleId = profile?.role_id;
  const isSupervisor =
    roleId === 5 || (typeof roleId === 'number' && roleId <= 3);

  // If submission parameter is provided, fetch it to get contractor_id
  useEffect(() => {
    if (
      submissionParam &&
      tenantId &&
      !supervisorContractorId &&
      !profile?.contractor_id
    ) {
      const fetchSubmissionContractor = async () => {
        try {
          const submission = await apiClient.get<any>(
            `/frm32/submissions/${submissionParam}`,
            { tenantId }
          );
          if (submission && submission.contractor_id) {
            setResolvedContractorId(submission.contractor_id);
          }
        } catch (e) {
          console.error('[FRM32] Failed to fetch submission contractor:', e);
        }
      };
      fetchSubmissionContractor();
    }
  }, [
    submissionParam,
    tenantId,
    supervisorContractorId,
    profile?.contractor_id
  ]);

  // Whenever the authenticated contractor profile becomes available, sync it into local state
  useEffect(() => {
    if (
      !supervisorContractorId &&
      profile?.contractor_id &&
      resolvedContractorId !== profile.contractor_id
    ) {
      setResolvedContractorId(profile.contractor_id);
    }
  }, [profile?.contractor_id, supervisorContractorId, resolvedContractorId]);

  const autoSaveTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.values(answers).filter(
    (a) => a && a.trim()
  ).length;
  const progressPercentage =
    questions.length > 0
      ? Math.round((answeredCount / questions.length) * 100)
      : 0;

  // Calculate total score
  const ready = Boolean(contractorId && tenantId && !isProfileLoading);

  const requiredDocuments = [
    'doc-1', // HSE Policy
    'doc-4', // HSE Organization Chart
    'doc-6', // CVs of HSE Officers
    'doc-7', // Training Records - Basic HSE Training
    'doc-7.1', // Training Records - Emergency Procedures
    'doc-8', // Incident & Accident Records
    'doc-11', // HSE Procedures Document
    'doc-12', // Inspection & Maintenance Records
    'doc-13' // PPE & Licenses
  ];

  const missingRequiredFiles = requiredDocuments.filter(
    (docId) => !uploadedFiles[docId]
  );
  const questionsByK2 = useMemo(() => {
    const map: Record<string, FRM32Question[]> = {};
    questions.forEach((question) => {
      const key = question.k2_category || 'unknown';
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(question);
    });
    return map;
  }, [questions]);

  // Fetch questions
  useEffect(() => {
    async function fetchQuestions() {
      if (!contractorId || !tenantId) {
        console.warn('[FRM32] Missing contractor_id or tenant_id');
        setIsLoading(false);
        return;
      }
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
  }, [contractorId, tenantId]);

  // Bootstrap submission
  useEffect(() => {
    async function bootstrap() {
      if (!ready || questions.length === 0) return;
      setIsLoading(true);
      try {
        let sub: any;

        // If viewing a specific submission (supervisor mode), fetch by ID
        if (submissionParam) {
          const submissionData = await apiClient.get<any>(
            `/frm32/submissions/${submissionParam}`,
            { tenantId: tenantId! }
          );
          sub = submissionData;
        } else {
          // Otherwise, fetch by contractor_id and evaluation_period
          const existing = await apiClient.get<any[]>(
            `/frm32/submissions?contractor_id=${contractorId}&evaluation_period=${evaluationPeriod}`,
            { tenantId: tenantId! }
          );
          sub = existing?.[0];
        }

        // Supervisors should only see submitted FRM32s
        if (isSupervisor && sub && sub.status !== 'submitted') {
          throw new Error(
            'This submission has not been submitted yet. Only submitted forms can be reviewed.'
          );
        }

        if (!sub) {
          // Only contractors can create new drafts
          if (isSupervisor) {
            throw new Error('No submitted form found for this contractor');
          }

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
          if (Array.isArray(sub)) {
            sub = sub[0];
          }
        }

        const id = sub?.id || (Array.isArray(sub) ? sub[0]?.id : undefined);
        if (!id) throw new Error('Submission could not be initialized');
        setSubmissionId(id);

        const answers = sub?.answers || {};
        setAnswers(answers);

        setFinalScore(
          typeof sub?.final_score === 'number' ? sub.final_score : null
        );

        const attachments = sub?.attachments || [];
        if (Array.isArray(attachments) && attachments.length > 0) {
          const uploadedFilesMap: Record<string, boolean> = {};
          const attachmentMeta: Record<
            string,
            { filename: string; file_url?: string }
          > = {};
          attachments.forEach((att: any) => {
            if (att.docId) {
              uploadedFilesMap[att.docId] = true;
              attachmentMeta[att.docId] = {
                filename: att.filename || att.docId,
                file_url: att.file_url
              };
            }
          });
          setUploadedFiles(uploadedFilesMap);
          setAttachmentDetails(attachmentMeta);
        } else {
          setUploadedFiles({});
          setAttachmentDetails({});
        }

        // Resume from first unanswered question
        let initialIndex = questions.findIndex(
          (q) =>
            !answers[q.question_code] || answers[q.question_code].trim() === ''
        );
        if (initialIndex < 0) {
          initialIndex = 0;
        }
        setCurrentQuestionIndex(initialIndex);

        console.log('[FRM32] Bootstrap complete - submission:', id);
      } catch (e: any) {
        const errorMessage =
          e?.response?.data?.detail || e?.message || String(e);
        console.error('[FRM32] bootstrap error:', {
          message: errorMessage,
          status: e?.response?.status
        });
        toast.error(`Failed to load form: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    }
    bootstrap();
  }, [
    ready,
    contractorId,
    tenantId,
    evaluationPeriod,
    questions,
    submissionParam,
    isSupervisor
  ]);

  const handleAnswerChange = useCallback(
    (questionId: string, value: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
      if (!ready || !submissionId || isSupervisor) return;

      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      const snapshot = { ...answers, [questionId]: value };
      setSaveStatus('saving');
      autoSaveTimer.current = setTimeout(() => autoSaveDraft(snapshot), 2000);
    },
    [answers, ready, submissionId, isSupervisor]
  );

  async function autoSaveDraft(answersToSave: Record<string, string>) {
    if (!submissionId || !tenantId) {
      setSaveStatus('idle');
      return;
    }
    try {
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
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1200);
    } catch (e: any) {
      console.error('[FRM32] autosave error:', e?.message || e);
      setSaveStatus('idle');
    }
  }

  const handleDocumentUpload = useCallback(
    async (docId: string, file: File) => {
      if (!submissionId || !tenantId) {
        toast.error('Submission not initialized');
        return;
      }

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('File size exceeds 10MB limit');
        return;
      }

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
        const formData = new FormData();
        formData.append('file', file);

        const uploadResult = await apiClient.post(
          `/frm32/submissions/${submissionId}/upload?docId=${encodeURIComponent(docId)}`,
          formData,
          { tenantId }
        );

        setUploadedFiles((prev) => ({ ...prev, [docId]: true }));
        setAttachmentDetails((prev) => ({
          ...prev,
          [docId]: {
            filename:
              (uploadResult as any)?.filename ||
              file.name ||
              `Document ${docId}`,
            file_url: (uploadResult as any)?.file_url
          }
        }));
        toast.success(`${file.name} uploaded successfully`);
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

  const loadK2Scores = useCallback(async () => {
    if (!isSupervisor || !submissionId || !tenantId) return;
    setIsK2Loading(true);
    try {
      const response = await apiClient.get<{
        scores: K2Metric[];
        final_score?: number;
      }>(`/frm32/submissions/${submissionId}/k2-scores`, {
        tenantId
      });
      const metrics = response.scores || [];
      setK2Metrics(metrics);
      const map: Record<string, number> = {};
      metrics.forEach((metric) => {
        if (typeof metric.score === 'number') {
          map[metric.k2_code] = metric.score;
        }
      });
      setK2Scores(map);
      if (typeof response.final_score === 'number') {
        setFinalScore(response.final_score);
      }
    } catch (e: any) {
      console.error('[FRM32] Failed to load K2 scores:', e?.message || e);
      toast.error('Failed to load scoring data');
    } finally {
      setIsK2Loading(false);
    }
  }, [isSupervisor, submissionId, tenantId]);

  const handleRegenerateAISuggestions = async () => {
    if (!submissionId || !tenantId || !isSupervisor) return;
    setIsRegeneratingAI(true);
    try {
      const response = await apiClient.post(
        `/frm32/submissions/${submissionId}/regenerate-ai-suggestions`,
        {},
        { tenantId }
      );
      toast.success(
        'AI suggestions regeneration started. Please wait a moment and refresh.'
      );
      // Reload K2 scores after a short delay
      setTimeout(() => {
        loadK2Scores();
      }, 2000);
    } catch (e: any) {
      console.error(
        '[FRM32] Failed to regenerate AI suggestions:',
        e?.message || e
      );
      toast.error(e?.message || 'Failed to regenerate AI suggestions');
    } finally {
      setIsRegeneratingAI(false);
    }
  };

  const handleK2ScoreChange = async (k2Code: string, score: number) => {
    if (!submissionId || !tenantId || !isSupervisor) return;
    setK2Scores((prev) => ({ ...prev, [k2Code]: score }));
    setK2Saving((prev) => ({ ...prev, [k2Code]: true }));
    setK2Metrics((prev) =>
      prev.map((metric) =>
        metric.k2_code === k2Code
          ? {
              ...metric,
              score,
              selected_comment_en:
                metric.comments[String(score) as ScoreOption]?.en,
              selected_comment_tr:
                metric.comments[String(score) as ScoreOption]?.tr
            }
          : metric
      )
    );

    try {
      const response = await apiClient.put<{
        scores: K2Metric[];
        final_score?: number;
      }>(
        `/frm32/submissions/${submissionId}/k2-scores`,
        {
          k2_code: k2Code,
          score
        },
        { tenantId }
      );
      const metrics = response.scores || [];
      setK2Metrics(metrics);
      const map: Record<string, number> = {};
      metrics.forEach((metric) => {
        if (typeof metric.score === 'number') {
          map[metric.k2_code] = metric.score;
        }
      });
      setK2Scores(map);
      if (typeof response.final_score === 'number') {
        setFinalScore(response.final_score);
      }
      toast.success('Score saved');
    } catch (e: any) {
      console.error('[FRM32] Failed to save K2 score:', e?.message || e);
      toast.error(e?.message || 'Failed to save score');
      loadK2Scores();
    } finally {
      setK2Saving((prev) => ({ ...prev, [k2Code]: false }));
    }
  };

  const handleDownloadFile = (docId: string) => {
    const attachment = attachmentDetails[docId];
    if (!attachment || !attachment.file_url) {
      toast.error('File not available for download yet');
      return;
    }
    try {
      window.open(attachment.file_url, '_blank', 'noopener');
    } catch (e: any) {
      console.error('[FRM32] download error:', e?.message || e);
      toast.error('Failed to open file');
    }
  };

  useEffect(() => {
    loadK2Scores();
  }, [loadK2Scores]);

  useEffect(() => {
    if (isSupervisor && tabValue === 'questions') {
      setTabValue('scores');
    }
  }, [isSupervisor, tabValue]);

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

    if (missingRequiredFiles.length > 0) {
      toast.error(
        `Please upload ${missingRequiredFiles.length} required document(s) before submitting`
      );
      setTabValue('files');
      return;
    }

    if (!submissionId || !tenantId) {
      toast.error('Submission not initialized');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post(
        `/frm32/submissions/${submissionId}/submit`,
        {},
        { tenantId }
      );

      toast.success(
        'Form submitted successfully! Supervisor will be notified.'
      );
      setTimeout(() => {
        router.push('/dashboard/submissions');
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

  // Check if contractor_id is missing
  if (!contractorId && !isSupervisor) {
    return (
      <div className='mx-auto max-w-2xl space-y-6 p-4 pt-6 md:p-8'>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            <strong>Error:</strong> Contractor ID is not available. Please
            contact your administrator if you believe this is an error.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const canGoNext = currentQuestionIndex < questions.length - 1;
  const canGoPrev = currentQuestionIndex > 0;
  const completedK2Count = Object.values(k2Scores).filter(
    (value) => typeof value === 'number'
  ).length;
  const totalK2Count = k2Metrics.length;
  const supervisorScoreDisplay =
    finalScore !== null ? `${finalScore.toFixed(2)} / 100` : '--';

  return (
    <div className='mx-auto max-w-6xl space-y-6 p-4 pt-6 md:p-8'>
      {isSupervisor && (
        <Alert className='border-blue-300 bg-blue-50'>
          <AlertCircle className='h-4 w-4 text-blue-600' />
          <AlertDescription className='text-blue-800'>
            <strong>Supervisor Mode:</strong> Review contractor answers and
            score each K2 category (0/3/6/10). You cannot edit contractor
            answers or upload files.
          </AlertDescription>
        </Alert>
      )}

      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <div className='md:col-span-2'>
          <h1 className='mb-2 text-3xl font-bold'>
            FRM32 - HSE Capability Assessment
          </h1>
          <p className='text-muted-foreground'>
            {isSupervisor
              ? 'Review contractor answers and provide evaluation scores'
              : 'All questions are required. Your answers are automatically saved as you type.'}
          </p>
        </div>
        <Card className='bg-muted/50'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm'>
              {isSupervisor ? 'Score Summary' : 'Progress'}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3 text-sm'>
            {isSupervisor ? (
              <>
                <div>
                  <p className='text-muted-foreground text-xs font-medium'>
                    Final Score
                  </p>
                  <p className='text-2xl font-bold'>{supervisorScoreDisplay}</p>
                </div>
                <div>
                  <p className='text-muted-foreground text-xs font-medium'>
                    Scored K2
                  </p>
                  <p className='font-semibold'>
                    {completedK2Count}/{totalK2Count || 0}
                  </p>
                </div>
              </>
            ) : (
              <div>
                <p className='text-muted-foreground text-xs font-medium'>
                  Answered
                </p>
                <p className='text-2xl font-bold'>
                  {answeredCount}/{questions.length}
                </p>
              </div>
            )}
            <div>
              <p className='text-muted-foreground text-xs font-medium'>
                Progress
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

      {saveStatus === 'saving' && (
        <Alert>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>Saving...</AlertDescription>
        </Alert>
      )}
      {saveStatus === 'saved' && (
        <Alert className='border-green-200 bg-green-50'>
          <CheckCircle className='h-4 w-4 text-green-600' />
          <AlertDescription className='text-green-800'>
            Changes saved
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={tabValue} onValueChange={setTabValue}>
        <TabsList className='flex w-full flex-wrap gap-2 md:grid md:grid-cols-3'>
          {!isSupervisor && (
            <>
              <TabsTrigger
                value='questions'
                className='flex items-center gap-2'
              >
                {viewMode === 'single' ? (
                  <>
                    <Eye className='h-4 w-4' />
                    <span className='hidden sm:inline'>Current</span>
                  </>
                ) : (
                  <>
                    <List className='h-4 w-4' />
                    <span className='hidden sm:inline'>All</span>
                  </>
                )}
              </TabsTrigger>
              <TabsTrigger value='all-questions'>All Questions</TabsTrigger>
            </>
          )}

          <TabsTrigger value='files'>File Uploads</TabsTrigger>

          {isSupervisor && (
            <>
              <TabsTrigger value='scores'>Scoring</TabsTrigger>
              <TabsTrigger value='summary'>Summary</TabsTrigger>
            </>
          )}
        </TabsList>

        {!isSupervisor && (
          <>
            {/* Single Question View */}
            <TabsContent value='questions' className='space-y-6'>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setViewMode(viewMode === 'single' ? 'all' : 'single')
                  }
                  className='ml-auto'
                >
                  {viewMode === 'single' ? (
                    <>
                      <List className='mr-2 h-4 w-4' />
                      View All
                    </>
                  ) : (
                    <>
                      <Eye className='mr-2 h-4 w-4' />
                      Single View
                    </>
                  )}
                </Button>
              </div>

              {viewMode === 'single' ? (
                <>
                  <Card>
                    <CardHeader className='pb-3'>
                      <div className='flex items-start justify-between gap-4'>
                        <div className='flex-1'>
                          <div className='text-muted-foreground mb-2 text-sm font-medium'>
                            Question {currentQuestionIndex + 1} of{' '}
                            {questions.length}
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
                        disabled={isSupervisor}
                      />
                      {currentQuestion &&
                        answers[currentQuestion.question_code] && (
                          <p className='flex items-center gap-1 text-xs text-green-600'>
                            <CheckCircle className='h-3 w-3' /> Answer provided
                          </p>
                        )}
                    </CardContent>
                  </Card>

                  <div className='flex gap-4'>
                    <Button
                      onClick={() =>
                        setCurrentQuestionIndex(
                          Math.max(0, currentQuestionIndex - 1)
                        )
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
                          Math.min(
                            questions.length - 1,
                            currentQuestionIndex + 1
                          )
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
                </>
              ) : (
                /* All Questions View */
                <Card>
                  <CardHeader>
                    <CardTitle>All {questions.length} Questions</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                    {questions.map((q) => {
                      const isAnswered =
                        answers[q.question_code] &&
                        answers[q.question_code].trim();
                      return (
                        <div
                          key={q.question_code}
                          className='border-l-4 border-gray-200 py-2 pl-4'
                        >
                          <div className='mb-2 flex items-start justify-between'>
                            <h3 className='font-semibold'>
                              {getQuestionNumber(
                                q.question_code,
                                q.k2_category
                              )}
                              . {q.question_text_en}
                            </h3>
                            <div className='flex gap-2'>
                              {isAnswered && (
                                <Badge
                                  variant='secondary'
                                  className='flex-shrink-0'
                                >
                                  <CheckCircle className='mr-1 h-3 w-3' />
                                  Answered
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className='mb-3 rounded bg-gray-50 p-3 text-sm dark:bg-gray-900'>
                            {answers[q.question_code] || (
                              <span className='text-muted-foreground italic'>
                                No answer provided
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* All Questions View (Grid) */}
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
                        answers[q.question_code] &&
                        answers[q.question_code].trim();
                      return (
                        <button
                          key={q.question_code}
                          onClick={() => {
                            setCurrentQuestionIndex(idx);
                            setTabValue('questions');
                            setViewMode('single');
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
                                {getQuestionNumber(
                                  q.question_code,
                                  q.k2_category
                                )}
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
          </>
        )}

        {/* Files */}
        <TabsContent value='files' className='space-y-6'>
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-xl'>
                Required Documents (18 Total)
              </CardTitle>
              <p className='text-muted-foreground mt-2 text-sm'>
                {isSupervisor
                  ? 'View uploaded documents'
                  : 'Upload required documents. Optional documents can improve your assessment score.'}
              </p>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {[
                  { num: '1', title: 'HSE Policy', req: true },
                  { num: '2', title: 'ISO Certificates', req: false },
                  {
                    num: '3',
                    title: 'HSE Management System Document',
                    req: false
                  },
                  { num: '4', title: 'HSE Organization Chart', req: true },
                  { num: '5', title: 'Company Organization Chart', req: false },
                  { num: '6', title: 'CVs of HSE Officers', req: true },
                  {
                    num: '7',
                    title: 'Training Records - Basic HSE Training',
                    req: true
                  },
                  {
                    num: '7.1',
                    title: 'Training Records - Emergency Procedures',
                    req: true
                  },
                  { num: '8', title: 'Incident & Accident Records', req: true },
                  { num: '9', title: 'Risk Assessment Records', req: false },
                  { num: '10', title: 'HAZOP or FMEA Studies', req: false },
                  { num: '11', title: 'HSE Procedures Document', req: true },
                  {
                    num: '12',
                    title: 'Inspection & Maintenance Records',
                    req: true
                  },
                  { num: '13', title: 'PPE & Licenses', req: true },
                  {
                    num: '14',
                    title: 'Environmental Programs & Records',
                    req: false
                  },
                  { num: '15', title: 'HSE Audit Reports', req: false },
                  { num: '16', title: 'Contractor HSE Records', req: false },
                  {
                    num: '17',
                    title: 'Regulatory Compliance Records',
                    req: false
                  },
                  {
                    num: '18',
                    title: 'HSE Performance Metrics & Reports',
                    req: false
                  }
                ].map(({ num, title, req }) => (
                  <DocumentItem
                    key={`doc-${num}`}
                    number={num}
                    title={title}
                    required={req}
                    isUploaded={uploadedFiles[`doc-${num}`] || false}
                    isUploading={uploadingFiles[`doc-${num}`] || false}
                    fileName={attachmentDetails[`doc-${num}`]?.filename}
                    onFileSelect={(file) =>
                      handleDocumentUpload(`doc-${num}`, file)
                    }
                    isSupervisor={isSupervisor}
                    onDownload={() => handleDownloadFile(`doc-${num}`)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Supervisor Scoring */}
        {isSupervisor && (
          <TabsContent value='scores' className='space-y-4'>
            {/* Regenerate AI Suggestions Button */}
            <div className='flex gap-2'>
              <Button
                onClick={handleRegenerateAISuggestions}
                disabled={isRegeneratingAI || isK2Loading || !submissionId}
                variant='outline'
                className='ml-auto'
              >
                {isRegeneratingAI ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Regenerating...
                  </>
                ) : (
                  <>✨ Regenerate AI Suggestions</>
                )}
              </Button>
            </div>

            {isK2Loading ? (
              <div className='flex items-center justify-center rounded border p-6'>
                <div className='text-muted-foreground flex items-center gap-2'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Loading scoring data...
                </div>
              </div>
            ) : k2Metrics.length === 0 ? (
              <div className='text-muted-foreground rounded border border-dashed p-6 text-center text-sm'>
                No K2 scoring metadata found.
              </div>
            ) : (
              k2Metrics.map((metric) => {
                const selectedScore = k2Scores[metric.k2_code];
                const questionsForK2 = questionsByK2[metric.k2_code] || [];

                return (
                  <Card key={metric.k2_code}>
                    <CardHeader>
                      <div className='flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between'>
                        <div>
                          <CardTitle className='text-base'>
                            {metric.k2_code} • {metric.scope_en}
                          </CardTitle>
                          <p className='text-muted-foreground text-sm'>
                            {metric.scope_tr}
                          </p>
                        </div>
                        <Badge variant='outline'>
                          {metric.weight_percentage}% weight
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]'>
                        <div className='space-y-3'>
                          <p className='text-sm font-semibold'>Questions</p>
                          {questionsForK2.length === 0 ? (
                            <p className='text-muted-foreground text-sm'>
                              No questions linked to this category.
                            </p>
                          ) : (
                            questionsForK2.map((question) => {
                              const answerValue =
                                answers[question.question_code];
                              return (
                                <div
                                  key={question.question_code}
                                  className='border-border bg-card/70 dark:bg-card/30 rounded border p-3 text-sm shadow-sm'
                                >
                                  <p className='font-semibold'>
                                    {getQuestionNumber(
                                      question.question_code,
                                      question.k2_category
                                    )}
                                  </p>
                                  <p className='text-muted-foreground text-xs'>
                                    {question.question_text_en}
                                  </p>
                                  <div className='border-border bg-muted/30 dark:bg-muted/10 mt-2 rounded border border-dashed p-2 text-sm'>
                                    {answerValue && answerValue.trim() ? (
                                      answerValue
                                    ) : (
                                      <span className='text-muted-foreground italic'>
                                        No answer provided
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        <div className='border-border bg-muted/20 dark:bg-muted/10 space-y-3 rounded border p-3'>
                          {[0, 3, 6, 10].map((value) => {
                            const comment =
                              metric.comments[value.toString() as ScoreOption];
                            const isSelected = selectedScore === value;
                            const isAISuggested =
                              metric.ai_suggested_score === value;
                            return (
                              <div
                                key={value}
                                className={`rounded border p-3 text-sm ${
                                  isSelected
                                    ? 'border-primary bg-primary/5'
                                    : isAISuggested
                                      ? 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30'
                                      : 'border-border bg-card'
                                }`}
                              >
                                <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                                  <div className='flex-1'>
                                    <div className='flex items-center gap-2'>
                                      <p className='font-semibold'>
                                        Score {value}
                                      </p>
                                      {isAISuggested && (
                                        <Badge
                                          variant='secondary'
                                          className='text-xs'
                                        >
                                          AI Suggestion
                                        </Badge>
                                      )}
                                    </div>
                                    <p>{comment.en}</p>
                                    <p className='text-muted-foreground mt-1 text-xs'>
                                      {comment.tr}
                                    </p>
                                    {isAISuggested && metric.ai_reasoning && (
                                      <div className='mt-2 rounded bg-amber-100 p-2 text-xs dark:bg-amber-900/50'>
                                        <p className='font-medium text-amber-900 dark:text-amber-200'>
                                          Why: {metric.ai_reasoning}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  <Button
                                    variant={isSelected ? 'default' : 'outline'}
                                    size='sm'
                                    disabled={!!k2Saving[metric.k2_code]}
                                    onClick={() =>
                                      handleK2ScoreChange(metric.k2_code, value)
                                    }
                                    type='button'
                                  >
                                    {isSelected ? 'Selected' : 'Select'}
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        )}

        {/* Summary */}
        {isSupervisor && (
          <TabsContent value='summary' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Submission Summary</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                  <div className='rounded border p-4 text-center'>
                    <p className='text-muted-foreground text-sm'>Questions</p>
                    <p className='text-2xl font-bold'>{questions.length}</p>
                  </div>
                  <div className='rounded border p-4 text-center'>
                    <p className='text-muted-foreground text-sm'>Answered</p>
                    <p className='text-2xl font-bold'>{answeredCount}</p>
                  </div>
                  <div className='rounded border p-4 text-center'>
                    <p className='text-muted-foreground text-sm'>Progress</p>
                    <p className='text-2xl font-bold'>{progressPercentage}%</p>
                  </div>
                  <div className='rounded border p-4 text-center'>
                    <p className='text-muted-foreground text-sm'>Final Score</p>
                    <p className='text-2xl font-bold'>
                      {supervisorScoreDisplay}
                    </p>
                  </div>
                </div>

                <div className='mt-6 space-y-2 border-t pt-4'>
                  <h3 className='font-semibold'>File Status</h3>
                  <p className='text-sm'>
                    Uploaded:{' '}
                    {Object.values(uploadedFiles).filter(Boolean).length}/18
                    documents
                  </p>
                  {missingRequiredFiles.length > 0 && (
                    <Alert variant='destructive'>
                      <AlertCircle className='h-4 w-4' />
                      <AlertDescription>
                        {missingRequiredFiles.length} required document(s)
                        missing
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Submit Section */}
      {!isSupervisor && (
        <>
          {progressPercentage === 100 && missingRequiredFiles.length === 0 ? (
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
                Your supervisor will be notified and can begin reviewing your
                submission
              </p>
            </div>
          ) : (
            <Alert variant='default'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                <strong>Submission Requirements:</strong>
                {progressPercentage < 100 && (
                  <p>
                    • Answer all {questions.length - answeredCount} remaining
                    questions
                  </p>
                )}
                {missingRequiredFiles.length > 0 && (
                  <p>
                    • Upload {missingRequiredFiles.length} required document(s)
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}
        </>
      )}

      {isSupervisor && (
        <Alert className='border-green-300 bg-green-50'>
          <CheckCircle className='h-4 w-4 text-green-600' />
          <AlertDescription className='text-green-800'>
            Evaluation mode: Review answers and score each K2 category using the
            0/3/6/10 scale.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
