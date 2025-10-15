'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useContractors } from '@/hooks/useContractors';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { contractorsColumns } from './columns';
import { CreateContractorDialog } from './create-contractor-dialog';
import type { ContractorStatus } from '@/types/api';

export default function ContractorsPage() {
  const { profile } = useProfile();
  const tenantId = profile?.tenant_id || '';

  console.log('👤 [CONTRACTORS PAGE] Profile:', profile);
  console.log('🏢 [CONTRACTORS PAGE] Tenant ID:', tenantId);

  const [status, setStatus] = useState<ContractorStatus | undefined>();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { contractors, isLoading, error } = useContractors({
    tenantId,
    filters: {
      status,
      limit: 50
    }
  });

  console.log('📊 [CONTRACTORS PAGE] Loading:', isLoading);
  console.log('⚠️ [CONTRACTORS PAGE] Error:', error);

  if (isLoading) {
    return (
      <div className='flex h-[450px] items-center justify-center'>
        <div className='text-muted-foreground'>Loading contractors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex h-[450px] items-center justify-center'>
        <div className='text-destructive'>
          Error loading contractors: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Contractors</h2>
          <p className='text-muted-foreground'>
            Manage your contractor relationships and evaluations
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Add Contractor
        </Button>
      </div>

      <DataTable
        columns={contractorsColumns}
        data={contractors}
        searchKey='name'
      />

      <CreateContractorDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        tenantId={tenantId}
      />
    </div>
  );
}
