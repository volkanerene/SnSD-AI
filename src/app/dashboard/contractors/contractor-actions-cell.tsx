'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash, ChartBar, Mail } from 'lucide-react';
import type { Contractor } from '@/types/api';
import { ContractorScoresDialog } from './contractor-scores-dialog';
import { SendDocumentsDialog } from './send-documents-dialog';
import { EditContractorDialog } from './edit-contractor-dialog';

interface ContractorActionsCellProps {
  contractor: Contractor;
}

export function ContractorActionsCell({
  contractor
}: ContractorActionsCellProps) {
  const [showScores, setShowScores] = useState(false);
  const [showSendDocs, setShowSendDocs] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(contractor.id)}
          >
            Copy ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowScores(true)}>
            <ChartBar className='mr-2 h-4 w-4' />
            View Scores
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowSendDocs(true)}>
            <Mail className='mr-2 h-4 w-4' />
            Send Documents
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowEdit(true)}>
            <Pencil className='mr-2 h-4 w-4' />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem className='text-red-600'>
            <Trash className='mr-2 h-4 w-4' />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ContractorScoresDialog
        contractor={contractor}
        open={showScores}
        onOpenChange={setShowScores}
      />

      <SendDocumentsDialog
        contractor={contractor}
        open={showSendDocs}
        onOpenChange={setShowSendDocs}
      />

      <EditContractorDialog
        contractor={contractor}
        open={showEdit}
        onOpenChange={setShowEdit}
        tenantId={contractor.tenant_id || ''}
      />
    </>
  );
}
