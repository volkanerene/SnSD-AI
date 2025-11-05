'use client';

import { useState } from 'react';
import { Plus, Upload, Send } from 'lucide-react';
import { useContractors } from '@/hooks/useContractors';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { contractorsColumns } from './columns';
import { CreateContractorDialog } from './create-contractor-dialog';
import { ImportContractorsDialog } from './import-contractors-dialog';
import { StartProcessDialog } from './start-process-dialog';
import type { ContractorStatus } from '@/types/api';
import { isSNSDAdmin, isAdmin as checkIsAdmin } from '@/lib/auth-utils';

export default function EvrenGPTContractorsPage() {
  const { profile } = useProfile();
  const isAdmin = profile?.role_id
    ? isSNSDAdmin(profile.role_id) || checkIsAdmin(profile.role_id)
    : false;
  const profileTenantId = profile?.tenant_id ?? '';
  const tenantQueryId = isAdmin ? '' : profileTenantId;

  const [status, setStatus] = useState<ContractorStatus | undefined>();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isStartProcessOpen, setIsStartProcessOpen] = useState(false);
  const [selectedContractors, setSelectedContractors] = useState<string[]>([]);

  const { contractors, isLoading, error } = useContractors({
    tenantId: tenantQueryId,
    filters: {
      status,
      limit: 100
    }
  });

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-muted-foreground'>Loading contractors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-destructive'>
          Error loading contractors: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4 p-4 pt-6 md:p-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>
            EvrenGPT Contractors
          </h2>
          <p className='text-muted-foreground'>
            Manage contractors and start evaluation processes
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={() => setIsStartProcessOpen(true)}
            disabled={selectedContractors.length === 0 || !profileTenantId}
            title={
              selectedContractors.length === 0
                ? 'Select at least one contractor'
                : !profileTenantId
                  ? 'Your profile is not linked to a tenant, cannot start process'
                  : undefined
            }
          >
            <Send className='mr-2 h-4 w-4' />
            Start Process ({selectedContractors.length})
          </Button>
          <Button variant='outline' onClick={() => setIsImportOpen(true)}>
            <Upload className='mr-2 h-4 w-4' />
            Import Excel
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className='mr-2 h-4 w-4' />
            Add Contractor
          </Button>
        </div>
      </div>

      <DataTable
        columns={contractorsColumns(
          selectedContractors,
          setSelectedContractors
        )}
        data={contractors}
        searchKey='name'
      />

      <CreateContractorDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        tenantId={profileTenantId}
      />

      <ImportContractorsDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        tenantId={profileTenantId}
      />

      <StartProcessDialog
        open={isStartProcessOpen}
        onOpenChange={setIsStartProcessOpen}
        selectedContractorIds={selectedContractors}
        tenantId={profileTenantId}
        onSuccess={() => setSelectedContractors([])}
      />
    </div>
  );
}
