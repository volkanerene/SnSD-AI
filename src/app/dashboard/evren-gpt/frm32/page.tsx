'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUp } from 'lucide-react';

// Document Item Component
interface DocumentItemProps {
  number: string;
  title: string;
  required: boolean;
}

function DocumentItem({ number, title, required }: DocumentItemProps) {
  const fileInputId = `doc-${number}`;

  return (
    <div
      className={`rounded-lg border-2 p-4 ${
        required ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'
      }`}
    >
      <div className='mb-3 flex items-start justify-between gap-3'>
        <div>
          <div className='mb-1 flex items-center gap-2'>
            <span
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold ${
                required ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
              }`}
            >
              {number}
            </span>
            <h4 className='text-sm font-semibold'>{title}</h4>
          </div>
          <div className='ml-8'>
            <span
              className={`inline-block rounded px-2 py-1 text-xs font-bold ${
                required ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
              }`}
            >
              {required ? 'REQUIRED' : 'OPTIONAL'}
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
          />
          <div
            className={`hover:border-opacity-70 rounded-lg border-2 border-dashed p-3 text-center transition-colors ${
              required
                ? 'border-red-400 hover:bg-red-100'
                : 'border-blue-400 hover:bg-blue-100'
            }`}
          >
            <FileUp className='mx-auto mb-1 h-5 w-5' />
            <p className='text-xs font-medium'>📎 Upload</p>
          </div>
        </Label>
      </div>
    </div>
  );
}

// All 80 FRM32 Questions extracted from frm32.html
const FRM32_QUESTIONS = [
  {
    id: 'question_11A',
    question_number: '1.1.A',
    title:
      'How are senior managers personally involved in HSE management for example objective-setting and monitoring?',
    required: true
  },
  {
    id: 'question_11B',
    question_number: '1.1.B',
    title: 'Provide evidence of commitment at all levels of the organisation?',
    required: true
  },
  {
    id: 'question_11C',
    question_number: '1.1.C',
    title: 'How do you promote a positive culture towards HSE matters?',
    required: true
  },
  {
    id: 'question_21A',
    question_number: '2.1.A',
    title:
      'Does your company have an HSE policy document? If the answer is YES please attach a copy.',
    required: true
  },
  {
    id: 'question_21B',
    question_number: '2.1.B',
    title:
      'Who has overall and final responsibility for HSE in your organisation?',
    required: true
  },
  {
    id: 'question_21C',
    question_number: '2.1.C',
    title:
      'Who is the most senior person in the organisation responsible for this policy being carried out at the premises and on site where his employees are working? Provide name and title.',
    required: true
  },
  {
    id: 'question_21D',
    question_number: '2.1.D',
    title:
      'Itemise the methods by which you have drawn your policy statements to the attention of all your employees?',
    required: true
  },
  {
    id: 'question_21E',
    question_number: '2.1.E',
    title:
      'What are your arrangements for advising employees of changes in the policy?',
    required: true
  },
  {
    id: 'question_22A',
    question_number: '2.2.A',
    title:
      'Does your company have strategic HSE objectives? If the answer is YES please attach a copy.',
    required: true
  },
  {
    id: 'question_22B',
    question_number: '2.2.B',
    title:
      'Itemise the methods by which you have communicated your strategic HSE objectives to the attention of all your employees?',
    required: true
  },
  {
    id: 'question_31A',
    question_number: '3.1.A',
    title:
      'How is your organisation structured to manage and communicate HSE effectively?',
    required: true
  },
  {
    id: 'question_31B',
    question_number: '3.1.B',
    title: 'Do HSE meetings promote HSE awareness?',
    required: true
  },
  {
    id: 'question_31C',
    question_number: '3.1.C',
    title: 'How are HSE objectives and targets communicated to the workforce?',
    required: true
  },
  {
    id: 'question_31D',
    question_number: '3.1.D',
    title:
      'How do you ensure that HSE considerations are incorporated into daily work activities?',
    required: true
  },
  {
    id: 'question_32A',
    question_number: '3.2.A',
    title:
      'Have the managers and supervisors at all levels who will plan, monitor, oversee and carry out the work received HSE training?',
    required: true
  },
  {
    id: 'question_32B',
    question_number: '3.2.B',
    title:
      'If YES please give details. Where the training is given in-house please describe the content and duration of the training?',
    required: true
  },
  {
    id: 'question_32C',
    question_number: '3.2.C',
    title:
      'What HSE training do you provide to new management and supervisory staff?',
    required: true
  },
  {
    id: 'question_32D',
    question_number: '3.2.D',
    title: 'What refresher training is provided and how often?',
    required: true
  },
  {
    id: 'question_32E',
    question_number: '3.2.E',
    title: 'What training records are maintained?',
    required: true
  },
  {
    id: 'question_33A',
    question_number: '3.3.A',
    title:
      'What arrangements does your company have to ensure new employees have knowledge of hazards, risks, controls, procedures, etc?',
    required: true
  },
  {
    id: 'question_33B',
    question_number: '3.3.B',
    title: 'What refresher training do you provide and how often?',
    required: true
  },
  {
    id: 'question_33C',
    question_number: '3.3.C',
    title: 'What training records are maintained?',
    required: true
  },
  {
    id: 'question_34A',
    question_number: '3.4.A',
    title:
      'Does your organisation have a competence system in place? If YES, please describe how the system works and what it covers?',
    required: true
  },
  {
    id: 'question_34B',
    question_number: '3.4.B',
    title: 'How do you assess competence and manage any gaps identified?',
    required: true
  },
  {
    id: 'question_35A',
    question_number: '3.5.A',
    title:
      'Does your company have a contractor management process or system? If yes, provide details?',
    required: true
  },
  {
    id: 'question_35B',
    question_number: '3.5.B',
    title: 'How do you select contractors and subcontractors?',
    required: true
  },
  {
    id: 'question_35C',
    question_number: '3.5.C',
    title: 'How do you monitor contractor HSE performance?',
    required: true
  },
  {
    id: 'question_35D',
    question_number: '3.5.D',
    title: 'How do you communicate HSE requirements to contractors?',
    required: true
  },
  {
    id: 'question_36A',
    question_number: '3.6.A',
    title:
      'How do you identify new industry or regulatory standards that may be applicable to your organisation and operations?',
    required: true
  },
  {
    id: 'question_36B',
    question_number: '3.6.B',
    title:
      'How do you ensure compliance with applicable HSE standards and regulations?',
    required: true
  },
  {
    id: 'question_36C',
    question_number: '3.6.C',
    title:
      'What process do you have for updating your HSE management system when standards change?',
    required: true
  },
  {
    id: 'question_41A',
    question_number: '4.1.A',
    title:
      'How does your company identify hazards, assess risk, control and mitigation consideration in line with the scope of services your company provides?',
    required: true
  },
  {
    id: 'question_42A',
    question_number: '4.2.A',
    title:
      'Do you have specific policies and programmes on specific health hazards e.g. substance abuse, noise, hazardous substances, ergonomics etc.?',
    required: true
  },
  {
    id: 'question_42B',
    question_number: '4.2.B',
    title:
      'What type of health hazards are associated with the scope of your services?',
    required: true
  },
  {
    id: 'question_42C',
    question_number: '4.2.C',
    title: 'How do you monitor and control health hazards in the workplace?',
    required: true
  },
  {
    id: 'question_43A',
    question_number: '4.3.A',
    title:
      'What type of safety hazards (mechanical guarding, work at height, lifting and hoisting, electrical, confined spaces etc.) are associated with the scope of your services?',
    required: true
  },
  {
    id: 'question_43B',
    question_number: '4.3.B',
    title: 'How do you control these safety hazards?',
    required: true
  },
  {
    id: 'question_44A',
    question_number: '4.4.A',
    title:
      'What type of logistics hazards (land transport, air transport, marine transport, storage and warehousing etc.) are associated with the scope of your services?',
    required: true
  },
  {
    id: 'question_44B',
    question_number: '4.4.B',
    title:
      'What systems are in place to control these hazards and monitor the effectiveness of these controls?',
    required: true
  },
  {
    id: 'question_45A',
    question_number: '4.5.A',
    title:
      'What type of environmental hazards (chemical spill, atmospheric emissions, waste discharge etc.) are associated with the scope of your services?',
    required: true
  },
  {
    id: 'question_45B',
    question_number: '4.5.B',
    title: 'How do you control these environmental hazards?',
    required: true
  },
  {
    id: 'question_46A',
    question_number: '4.6.A',
    title:
      'What type of security hazards (terrorism, hostage taking, robbery, hostile local population, civil unrest etc.) are associated with the scope of your services?',
    required: true
  },
  {
    id: 'question_46B',
    question_number: '4.6.B',
    title: 'How do you control these security hazards?',
    required: true
  },
  {
    id: 'question_47A',
    question_number: '4.7.A',
    title:
      'What type of social hazards are associated with the scope of your services?',
    required: true
  },
  {
    id: 'question_47B',
    question_number: '4.7.B',
    title: 'How do you control these social hazards?',
    required: true
  },
  {
    id: 'question_51A',
    question_number: '5.1.A',
    title:
      'Do you have a company HSE-MS manual (or operations manual with integrated HSE requirements)? If the answer is YES please attach a copy.',
    required: true
  },
  {
    id: 'question_52A',
    question_number: '5.2.A',
    title:
      'How do you ensure that infrastructure, plant and equipment used within your operations meet the required HSE standards and are maintained in safe working condition?',
    required: true
  },
  {
    id: 'question_53A',
    question_number: '5.3.A',
    title:
      'How do you manage changes and assess associated risks e.g. personnel, equipment, procedures, organisation, etc.?',
    required: true
  },
  {
    id: 'question_54A',
    question_number: '5.4.A',
    title:
      'What arrangements does your company have for emergency planning and response?',
    required: true
  },
  {
    id: 'question_54B',
    question_number: '5.4.B',
    title: 'How often do you test your emergency response procedures?',
    required: true
  },
  {
    id: 'question_61A',
    question_number: '6.1.A',
    title:
      'What arrangements does your organisation have for monitoring the implementation and operation of the HSE-MS?',
    required: true
  },
  {
    id: 'question_61B',
    question_number: '6.1.B',
    title:
      'What arrangements does your organisation have for monitoring HSE performance?',
    required: true
  },
  {
    id: 'question_61C',
    question_number: '6.1.C',
    title:
      'What arrangements does your organisation have for workplace inspection?',
    required: true
  },
  {
    id: 'question_61D',
    question_number: '6.1.D',
    title:
      'What arrangements does your organisation have for safety observation programmes?',
    required: true
  },
  {
    id: 'question_61E',
    question_number: '6.1.E',
    title:
      'What arrangements does your organisation have for environmental monitoring?',
    required: true
  },
  {
    id: 'question_61F',
    question_number: '6.1.F',
    title:
      'What arrangements does your organisation have for health surveillance?',
    required: true
  },
  {
    id: 'question_62A',
    question_number: '6.2.A',
    title: 'See separate spreadsheet called Contractor Assessment KPI Data',
    required: true
  },
  {
    id: 'question_63A',
    question_number: '6.3.A',
    title: 'How is health performance monitored and recorded?',
    required: true
  },
  {
    id: 'question_63B',
    question_number: '6.3.B',
    title: 'How is safety performance monitored and recorded?',
    required: true
  },
  {
    id: 'question_63C',
    question_number: '6.3.C',
    title: 'How is environmental performance monitored and recorded?',
    required: true
  },
  {
    id: 'question_63D',
    question_number: '6.3.D',
    title: 'What performance indicators do you use to monitor HSE performance?',
    required: true
  },
  {
    id: 'question_63E',
    question_number: '6.3.E',
    title:
      'How often is performance data reviewed and what actions are taken based on the results?',
    required: true
  },
  {
    id: 'question_63F',
    question_number: '6.3.F',
    title:
      'How do you benchmark your HSE performance against industry standards?',
    required: true
  },
  {
    id: 'question_63G',
    question_number: '6.3.G',
    title: 'How do you communicate HSE performance results to stakeholders?',
    required: true
  },
  {
    id: 'question_64A',
    question_number: '6.4.A',
    title: 'What types of HSE incident are investigated?',
    required: true
  },
  {
    id: 'question_64B',
    question_number: '6.4.B',
    title: 'What is your procedure for incident investigation?',
    required: true
  },
  {
    id: 'question_64C',
    question_number: '6.4.C',
    title:
      'How do you ensure that corrective actions are implemented and followed up?',
    required: true
  },
  {
    id: 'question_64D',
    question_number: '6.4.D',
    title: 'How do you share lessons learned from incidents?',
    required: true
  },
  {
    id: 'question_64E',
    question_number: '6.4.E',
    title: 'What system do you have for tracking and trending incident data?',
    required: true
  },
  {
    id: 'question_65A',
    question_number: '6.5.A',
    title:
      'Has your company suffered any statutory notifiable incidents in the last five years? If YES, please give details.',
    required: true
  },
  {
    id: 'question_71A',
    question_number: '7.1.A',
    title:
      'Do you have a written procedure for HSE auditing? If yes, please attach a copy.',
    required: true
  },
  {
    id: 'question_71B',
    question_number: '7.1.B',
    title: 'How often do you conduct HSE audits?',
    required: true
  },
  {
    id: 'question_71C',
    question_number: '7.1.C',
    title: 'Who conducts the audits and what are their qualifications?',
    required: true
  },
  {
    id: 'question_71D',
    question_number: '7.1.D',
    title:
      'How do you follow up on audit findings and ensure corrective actions are completed?',
    required: true
  },
  {
    id: 'question_72A',
    question_number: '7.2.A',
    title:
      'Do you have a written procedure for management review of the HSE-MS? If yes, please attach a copy.',
    required: true
  },
  {
    id: 'question_72B',
    question_number: '7.2.B',
    title: 'How often do you conduct management reviews of the HSE-MS?',
    required: true
  },
  {
    id: 'question_72C',
    question_number: '7.2.C',
    title:
      'What information is considered during management review and how are decisions documented and communicated?',
    required: true
  },
  {
    id: 'question_81A',
    question_number: '8.1.A',
    title:
      'Please provide information on any certification which you have received from certification bodies for your HSE-MS (e.g. ISO 14001, OHSAS 18001, ISO 45001, etc.). If you have certificates, please attach copies.',
    required: true
  },
  {
    id: 'question_82A',
    question_number: '8.2.A',
    title:
      "Describe the nature and extent of your company's participation in relevant industry associations, professional bodies, or HSE forums.",
    required: true
  },
  {
    id: 'question_83A',
    question_number: '8.3.A',
    title:
      'Does your organisation (globally, regionally or locally) have any HSE features or achievements which may be of relevance (e.g. awards, recognition, innovative practices, sustainability initiatives, etc.)?',
    required: true
  }
];

export default function FRM32Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useProfile();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>(
    'idle'
  );
  const [missingAnswers, setMissingAnswers] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [tabValue, setTabValue] = useState('questions');
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Contractor ID comes from the logged-in user's profile (they ARE the contractor)
  // Session ID comes from URL param or will be fetched from API
  const urlSessionId = searchParams.get('session');
  const contractorId = profile?.contractor_id || profile?.user_id;
  const cycle = parseInt(searchParams.get('cycle') || '1');
  const autoSaveTimer = useRef<NodeJS.Timeout>();

  const currentQuestion = FRM32_QUESTIONS[currentQuestionIndex];
  const answeredCount = Object.values(answers).filter(
    (a) => a && a.trim()
  ).length;
  const progressPercentage = Math.round(
    (answeredCount / FRM32_QUESTIONS.length) * 100
  );

  // Load existing answers
  useEffect(() => {
    loadExistingAnswers();
  }, [contractorId, profile?.tenant_id]);

  // Initialize sessionId from URL param
  useEffect(() => {
    if (urlSessionId) {
      setSessionId(urlSessionId);
      console.log('[FRM32] Using sessionId from URL:', urlSessionId);
    }
  }, [urlSessionId]);

  const loadExistingAnswers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const tenantId = profile?.tenant_id;

      console.log('[FRM32] ========== LOADING ANSWERS ==========');
      console.log('[FRM32] contractorId:', contractorId);
      console.log('[FRM32] sessionId:', sessionId);
      console.log('[FRM32] token present:', !!token);
      console.log('[FRM32] tenantId:', tenantId);

      if (!contractorId) {
        console.log(
          '[FRM32] Contractor not logged in yet. Waiting for profile...'
        );
        setIsLoading(false);
        return;
      }

      if (!token || !tenantId) {
        console.log('[FRM32] Missing token or tenantId');
        setIsLoading(false);
        return;
      }

      // If sessionId not provided via URL, get active session from API
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        console.log(
          '[FRM32] No sessionId provided, fetching active session...'
        );
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/frm32/sessions?contractor_id=${contractorId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'x-tenant-id': tenantId
            }
          }
        );

        if (response.ok) {
          const sessions = await response.json();
          if (sessions && sessions.length > 0) {
            activeSessionId = sessions[0].session_id;
            setSessionId(activeSessionId);
            console.log('[FRM32] Found active session:', activeSessionId);
          } else {
            console.log('[FRM32] No active session found for this contractor');
            setIsLoading(false);
            return;
          }
        } else {
          console.log('[FRM32] Failed to fetch sessions:', response.status);
          setIsLoading(false);
          return;
        }
      }

      if (!activeSessionId) {
        console.log('[FRM32] No sessionId available');
        setIsLoading(false);
        return;
      }

      // Try primary API URL first, then fallback
      const apiUrls = [
        process.env.NEXT_PUBLIC_API_URL,
        'https://api.snsdconsultant.com', // Production fallback
        'http://localhost:8000' // Local fallback
      ].filter(Boolean) as string[];

      console.log('[FRM32] Trying API URLs:', apiUrls);

      let response: Response | null = null;
      let lastError: string = '';

      for (const apiUrl of apiUrls) {
        try {
          console.log(`[FRM32] Fetching from ${apiUrl}...`);
          response = await fetch(
            `${apiUrl}/frm32/submissions?session_id=${activeSessionId}&contractor_id=${contractorId}&cycle=${cycle}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'x-tenant-id': tenantId
              }
            }
          );

          console.log(
            `[FRM32] Response status from ${apiUrl}:`,
            response.status
          );

          if (response.ok) {
            console.log('[FRM32] Successfully loaded answers');
            break; // Success
          } else {
            const errorText = await response.text();
            lastError = `${response.status}: ${errorText}`;
            console.log(`[FRM32] Error from ${apiUrl}:`, lastError);
          }
        } catch (err) {
          lastError = String(err);
          console.log(`[FRM32] Failed to reach ${apiUrl}:`, err);
          continue;
        }
      }

      if (response && response.ok) {
        const data = await response.json();
        console.log('[FRM32] Data loaded:', data);
        if (data && data.length > 0) {
          console.log('[FRM32] Setting answers:', data[0].answers);
          setAnswers(data[0].answers || {});
        }
      } else {
        console.log('[FRM32] No valid response:', lastError);
      }
    } catch (error) {
      console.error('[FRM32] Failed to load existing answers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-save on answer change
  const handleAnswerChange = useCallback(
    (questionId: string, value: string) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: value
      }));

      // Clear existing timer
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }

      // Set new timer for auto-save (2 seconds after last change)
      setSaveStatus('saving');
      autoSaveTimer.current = setTimeout(() => {
        autoSaveDraft();
      }, 2000);
    },
    []
  );

  const autoSaveDraft = async () => {
    try {
      const token = localStorage.getItem('token');
      const tenantId = profile?.tenant_id;

      console.log('[FRM32] ========== AUTO-SAVE TRIGGERED ==========');
      console.log('[FRM32] sessionId:', sessionId);
      console.log('[FRM32] contractorId:', contractorId);
      console.log('[FRM32] token present:', !!token);
      console.log('[FRM32] tenantId:', tenantId);

      if (!sessionId || !contractorId) {
        console.log('[FRM32] Missing sessionId or contractorId for auto-save');
        setSaveStatus('idle');
        return;
      }

      if (!token || !tenantId) {
        console.log('[FRM32] Missing token or tenantId for auto-save');
        setSaveStatus('idle');
        return;
      }

      // Try primary API URL first, then fallback
      const apiUrls = [
        process.env.NEXT_PUBLIC_API_URL,
        'https://api.snsdconsultant.com', // Production fallback
        'http://localhost:8000' // Local fallback
      ].filter(Boolean) as string[];

      console.log('[FRM32] Auto-save URLs:', apiUrls);

      let response: Response | null = null;
      let lastError: string = '';

      for (const apiUrl of apiUrls) {
        try {
          console.log(`[FRM32] Auto-saving to ${apiUrl}...`);
          response = await fetch(`${apiUrl}/frm32/submissions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              'x-tenant-id': tenantId
            },
            body: JSON.stringify({
              form_id: 'frm32',
              session_id: sessionId,
              contractor_id: contractorId,
              cycle,
              answers,
              status: 'draft'
            })
          });

          console.log(
            `[FRM32] Auto-save response status from ${apiUrl}:`,
            response.status
          );

          if (response.ok) {
            console.log('[FRM32] Auto-save successful');
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
            return;
          } else {
            const errorData = await response.json().catch(() => ({}));
            lastError =
              errorData.message ||
              errorData.detail ||
              `API returned ${response.status}`;
            console.log(`[FRM32] Auto-save error from ${apiUrl}:`, lastError);
          }
        } catch (err) {
          lastError = `Failed to reach ${apiUrl}: ${String(err)}`;
          console.log('[FRM32] Auto-save fetch error:', err);
          continue;
        }
      }

      // If we get here, all retries failed
      console.error('[FRM32] Auto-save failed after all retries:', lastError);
      setSaveStatus('idle');
    } catch (error) {
      console.error('[FRM32] Auto-save error:', error);
      setSaveStatus('idle');
    }
  };

  const validateForm = (): boolean => {
    const missing: string[] = [];
    FRM32_QUESTIONS.forEach((q) => {
      if (q.required && (!answers[q.id] || answers[q.id].trim() === '')) {
        missing.push(`${q.question_number} - ${q.title}`);
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
      return;
    }

    setIsSubmitting(true);
    try {
      if (!sessionId || !contractorId) {
        throw new Error('Missing session or contractor information');
      }

      // Try primary API URL first, then fallback
      const apiUrls = [
        process.env.NEXT_PUBLIC_API_URL,
        'https://api.snsdconsultant.com', // Production fallback
        'http://localhost:8000' // Local fallback
      ].filter(Boolean) as string[];

      let response: Response | null = null;
      let lastError: string = '';

      for (const apiUrl of apiUrls) {
        try {
          response = await fetch(`${apiUrl}/frm32/submit`, {
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
              status: 'submitted'
            })
          });

          if (response.ok) {
            break;
          } else {
            const errorData = await response.json().catch(() => ({}));
            lastError =
              errorData.message ||
              errorData.detail ||
              `API returned ${response.status}`;
          }
        } catch (err) {
          lastError = `Failed to reach ${apiUrl}`;
          continue;
        }
      }

      if (!response || !response.ok) {
        throw new Error(lastError || 'Failed to submit form');
      }

      toast.success('Form submitted successfully!');

      // Redirect to next page after 2 seconds
      setTimeout(() => {
        router.push(
          `/dashboard/evren-gpt?session=${sessionId}&contractor=${contractorId}`
        );
      }, 2000);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to submit form'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center p-8'>
        <div className='flex flex-col items-center gap-2'>
          <Loader2 className='h-8 w-8 animate-spin' />
          <p className='text-muted-foreground'>Loading FRM32 Form...</p>
        </div>
      </div>
    );
  }

  const canGoNext = currentQuestionIndex < FRM32_QUESTIONS.length - 1;
  const canGoPrev = currentQuestionIndex > 0;

  return (
    <div className='mx-auto max-w-4xl space-y-6 p-4 pt-6 md:p-8'>
      {/* Header */}
      <div>
        <h1 className='mb-2 text-3xl font-bold'>
          FRM32 - HSE Capability Assessment
        </h1>
        <p className='text-muted-foreground'>
          All questions are required. Your answers are automatically saved as
          you type.
        </p>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className='pt-6'>
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>Progress</span>
              <Badge variant='outline'>{progressPercentage}%</Badge>
            </div>
            <div className='bg-secondary h-2 w-full rounded-full'>
              <div
                className='bg-primary h-2 rounded-full transition-all duration-300'
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className='text-muted-foreground text-xs'>
              {answeredCount} of {FRM32_QUESTIONS.length} questions answered
            </p>
          </div>
        </CardContent>
      </Card>

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

      {/* Tabs */}
      <Tabs value={tabValue} onValueChange={setTabValue}>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='questions'>Questions</TabsTrigger>
          <TabsTrigger value='files'>File Uploads</TabsTrigger>
        </TabsList>

        {/* Questions Tab */}
        <TabsContent value='questions' className='space-y-6'>
          {/* Section Header */}
          <div className='mb-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white'>
            <h3 className='text-lg font-semibold'>Company Information</h3>
            <p className='mt-1 text-sm opacity-90'>
              Provide detailed information about your organization&apos;s HSE
              practices
            </p>
          </div>

          {/* Current Question */}
          <Card>
            <CardHeader className='pb-3'>
              <div className='flex items-start justify-between gap-4'>
                <div className='flex-1'>
                  <div className='text-muted-foreground mb-2 text-sm font-medium'>
                    Question {currentQuestionIndex + 1} of{' '}
                    {FRM32_QUESTIONS.length}
                  </div>
                  <CardTitle className='text-lg'>
                    {currentQuestion.question_number}. {currentQuestion.title}
                  </CardTitle>
                </div>
                {currentQuestion.required && (
                  <Badge variant='destructive'>Required</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <Textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) =>
                  handleAnswerChange(currentQuestion.id, e.target.value)
                }
                placeholder='Please provide a detailed response...'
                className='min-h-40'
              />
              {answers[currentQuestion.id] && (
                <p className='flex items-center gap-1 text-xs text-green-600'>
                  <CheckCircle className='h-3 w-3' /> Answer saved
                </p>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
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
                  Math.min(FRM32_QUESTIONS.length - 1, currentQuestionIndex + 1)
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

        {/* File Uploads Tab */}
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
                <DocumentItem number='1' title='HSE Policy' required={true} />
                <DocumentItem
                  number='2'
                  title='ISO Certificates'
                  required={false}
                />
                <DocumentItem
                  number='3'
                  title='HSE Management System Document'
                  required={false}
                />
                <DocumentItem
                  number='4'
                  title='HSE Organization Chart'
                  required={true}
                />
                <DocumentItem
                  number='5'
                  title='Company Organization Chart'
                  required={false}
                />
                <DocumentItem
                  number='6'
                  title='CVs of HSE Officers'
                  required={true}
                />
                <DocumentItem
                  number='7'
                  title='Training Records - Basic HSE Training'
                  required={true}
                />
                <DocumentItem
                  number='7.1'
                  title='Training Records - Emergency Procedures'
                  required={true}
                />
                <DocumentItem
                  number='8'
                  title='Incident & Accident Records'
                  required={true}
                />
                <DocumentItem
                  number='9'
                  title='Risk Assessment Records'
                  required={false}
                />
                <DocumentItem
                  number='10'
                  title='HAZOP or FMEA Studies'
                  required={false}
                />
                <DocumentItem
                  number='11'
                  title='HSE Procedures Document'
                  required={true}
                />
                <DocumentItem
                  number='12'
                  title='Inspection & Maintenance Records'
                  required={true}
                />
                <DocumentItem
                  number='13'
                  title='PPE & Licenses'
                  required={true}
                />
                <DocumentItem
                  number='14'
                  title='Environmental Programs & Records'
                  required={false}
                />
                <DocumentItem
                  number='15'
                  title='HSE Audit Reports'
                  required={false}
                />
                <DocumentItem
                  number='16'
                  title='Contractor HSE Records'
                  required={false}
                />
                <DocumentItem
                  number='17'
                  title='Regulatory Compliance Records'
                  required={false}
                />
                <DocumentItem
                  number='18'
                  title='HSE Performance Metrics & Reports'
                  required={false}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Submit Button - Only show on last question or all answered */}
      {progressPercentage === 100 && (
        <div className='pt-4'>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className='w-full'
            size='lg'
          >
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Submitting...
              </>
            ) : (
              'Submit FRM32 Form'
            )}
          </Button>
        </div>
      )}

      {/* Completion Warning */}
      {progressPercentage < 100 && (
        <Alert variant='default'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Please answer all {FRM32_QUESTIONS.length - answeredCount} remaining
            questions before submitting the form.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
