'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useSubmissions } from '@/hooks/useSubmissions';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { evaluationsColumns } from './columns';
import { CreateEvaluationDialog } from './create-evaluation-dialog';
import type { SubmissionStatus } from '@/types/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function EvaluationsPage() {
  const { profile } = useProfile();
  const tenantId = profile?.tenant_id || '';

  const [status, setStatus] = useState<SubmissionStatus | undefined>();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { submissions, isLoading, error } = useSubmissions(tenantId, {
    status,
    limit: 50
  });

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-4'>
        <div className='text-muted-foreground'>Loading evaluations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center p-4'>
        <div className='text-destructive'>
          Error loading evaluations: {error.message}
        </div>
      </div>
    );
  }

  const draftSubmissions = submissions.filter((s) => s.status === 'draft');
  const activeSubmissions = submissions.filter(
    (s) => s.status === 'submitted' || s.status === 'in_review'
  );
  const completedSubmissions = submissions.filter(
    (s) => s.status === 'completed'
  );

  return (
    <div className='space-y-4 p-4 pt-6 md:p-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>
            FRM-32 Evaluations
          </h2>
          <p className='text-muted-foreground'>
            Manage contractor safety evaluations and assessments
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          New Evaluation
        </Button>
      </div>

      <Tabs defaultValue='all' className='w-full'>
        <TabsList>
          <TabsTrigger value='all'>All ({submissions.length})</TabsTrigger>
          <TabsTrigger value='draft'>
            Draft ({draftSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value='active'>
            Active ({activeSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value='completed'>
            Completed ({completedSubmissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value='all' className='space-y-4'>
          <DataTable
            columns={evaluationsColumns}
            data={submissions}
            searchKey='evaluation_period'
          />
        </TabsContent>

        <TabsContent value='draft' className='space-y-4'>
          <DataTable
            columns={evaluationsColumns}
            data={draftSubmissions}
            searchKey='evaluation_period'
          />
        </TabsContent>

        <TabsContent value='active' className='space-y-4'>
          <DataTable
            columns={evaluationsColumns}
            data={activeSubmissions}
            searchKey='evaluation_period'
          />
        </TabsContent>

        <TabsContent value='completed' className='space-y-4'>
          <DataTable
            columns={evaluationsColumns}
            data={completedSubmissions}
            searchKey='evaluation_period'
          />
        </TabsContent>
      </Tabs>

      <CreateEvaluationDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        tenantId={tenantId}
      />
    </div>
  );
}
