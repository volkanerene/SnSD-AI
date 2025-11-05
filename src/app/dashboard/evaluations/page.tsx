'use client';

import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Progress } from '@/components/ui/progress';
import {
  FileCheck,
  Send,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { evaluationsColumns } from './columns';

interface ContractorEvaluation {
  id: string;
  contractor_id: string;
  contractor_name: string;
  session_id: string;
  cycle: number;
  frm32_status: 'completed' | 'pending' | 'in_progress';
  frm33_status: 'completed' | 'pending' | 'in_progress';
  frm34_status: 'completed' | 'pending' | 'in_progress';
  frm35_status: 'completed' | 'pending' | 'in_progress';
  frm32_score: number | null;
  frm33_score: number | null;
  frm34_score: number | null;
  frm35_score: number | null;
  final_score: number | null; // FRM32*0.5 + FRM35*0.5
  progress_percentage: number;
  last_updated: string;
  answers_available: boolean;
}

export default function EvaluationsPage() {
  const { profile, isLoading: profileLoading } = useProfile();
  const [evaluations, setEvaluations] = useState<ContractorEvaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvaluations, setSelectedEvaluations] = useState<string[]>([]);

  useEffect(() => {
    if (profileLoading) return;
    if (!profile?.tenant_id) {
      setEvaluations([]);
      setIsLoading(false);
      return;
    }

    fetchEvaluations();
  }, [profile, profileLoading]);

  const fetchEvaluations = async () => {
    try {
      setIsLoading(true);

      const tenantId = profile?.tenant_id;
      if (!tenantId) {
        setEvaluations([]);
        return;
      }

      const data = await apiClient.get<ContractorEvaluation[]>(
        '/api/evaluations',
        {
          tenantId
        }
      );
      setEvaluations(data);
    } catch (error) {
      toast.error('Failed to load evaluations');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendAssessment = async () => {
    if (selectedEvaluations.length === 0) {
      toast.error('Please select at least one contractor');
      return;
    }

    try {
      const tenantId = profile?.tenant_id;
      if (!tenantId) {
        toast.error('Missing tenant context');
        return;
      }

      await apiClient.post(
        '/api/evaluations/send-assessment',
        { evaluation_ids: selectedEvaluations },
        {
          tenantId
        }
      );

      toast.success(
        `Assessment sent to ${selectedEvaluations.length} contractor(s)`
      );
      setSelectedEvaluations([]);
    } catch (error) {
      toast.error('Failed to send assessments');
    }
  };

  const handleSendReminders = async () => {
    try {
      const pendingContractors = evaluations.filter(
        (e) => e.frm32_status === 'pending'
      );

      if (pendingContractors.length === 0) {
        toast.info('No pending FRM32 forms to remind');
        return;
      }

      const tenantId = profile?.tenant_id;
      if (!tenantId) {
        toast.error('Missing tenant context');
        return;
      }

      await apiClient.post(
        '/api/evaluations/send-reminders',
        {
          contractor_ids: pendingContractors.map((c) => c.contractor_id)
        },
        {
          tenantId
        }
      );

      toast.success(
        `Reminder sent to ${pendingContractors.length} contractor(s) who haven't completed FRM32`
      );
    } catch (error) {
      toast.error('Failed to send reminders');
    }
  };

  const calculateStats = () => {
    const total = evaluations.length;
    const completed = evaluations.filter(
      (e) => e.progress_percentage === 100
    ).length;
    const inProgress = evaluations.filter(
      (e) => e.progress_percentage > 0 && e.progress_percentage < 100
    ).length;
    const pending = evaluations.filter(
      (e) => e.progress_percentage === 0
    ).length;
    const pendingFrm32 = evaluations.filter(
      (e) => e.frm32_status === 'pending'
    ).length;

    const completedEvals = evaluations.filter((e) => e.final_score !== null);
    const avgScore =
      completedEvals.length > 0
        ? completedEvals.reduce((acc, e) => acc + (e.final_score || 0), 0) /
          completedEvals.length
        : 0;

    return { total, completed, inProgress, pending, avgScore, pendingFrm32 };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-muted-foreground'>Loading evaluations...</div>
      </div>
    );
  }

  return (
    <div className='space-y-4 p-4 pt-6 md:p-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>
            Contractor Evaluations
          </h2>
          <p className='text-muted-foreground'>
            Monitor contractor evaluation progress and scores
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={handleSendReminders}
            disabled={stats.pendingFrm32 === 0}
          >
            <Mail className='mr-2 h-4 w-4' />
            Send FRM32 Reminders ({stats.pendingFrm32})
          </Button>
          <Button
            onClick={handleSendAssessment}
            disabled={selectedEvaluations.length === 0}
          >
            <Send className='mr-2 h-4 w-4' />
            Send Assessment ({selectedEvaluations.length})
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-5'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total</CardTitle>
            <FileCheck className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.total}</div>
            <p className='text-muted-foreground text-xs'>Contractors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Completed</CardTitle>
            <CheckCircle2 className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-500'>
              {stats.completed}
            </div>
            <p className='text-muted-foreground text-xs'>All forms done</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>In Progress</CardTitle>
            <Clock className='h-4 w-4 text-yellow-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-yellow-500'>
              {stats.inProgress}
            </div>
            <p className='text-muted-foreground text-xs'>Partial completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Pending</CardTitle>
            <AlertCircle className='h-4 w-4 text-red-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-500'>
              {stats.pending}
            </div>
            <p className='text-muted-foreground text-xs'>Not started</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Avg Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats.avgScore > 0 ? stats.avgScore.toFixed(1) : '--'}
            </div>
            <p className='text-muted-foreground text-xs'>
              FRM32 × 0.5 + FRM35 × 0.5
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Information Card */}
      <Card className='bg-blue-50 dark:bg-blue-950'>
        <CardContent className='pt-6'>
          <div className='flex items-start gap-3'>
            <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400' />
            <div className='space-y-1'>
              <p className='text-sm font-medium text-blue-900 dark:text-blue-100'>
                Final Score Calculation
              </p>
              <p className='text-sm text-blue-700 dark:text-blue-300'>
                Final Score = (FRM32 Score × 0.5) + (FRM35 Score × 0.5).
                Reminders will be automatically sent to contractors who
                haven&apos;t completed FRM32.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evaluations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluation Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={evaluationsColumns(
              selectedEvaluations,
              setSelectedEvaluations
            )}
            data={evaluations}
            searchKey='contractor_name'
          />
        </CardContent>
      </Card>
    </div>
  );
}
