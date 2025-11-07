'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useContractor } from '@/hooks/useContractors';
import { toast } from 'sonner';
import type { Contractor } from '@/types/api';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DeleteContractorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractor: Contractor;
  onDeleteSuccess?: () => void;
}

export function DeleteContractorDialog({
  open,
  onOpenChange,
  contractor,
  onDeleteSuccess
}: DeleteContractorDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteContractorAsync } = useContractor(
    contractor.id,
    contractor.tenant_id
  );

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteContractorAsync();
      toast.success('Contractor deleted successfully');
      onOpenChange(false);
      onDeleteSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete contractor');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Delete Contractor</DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>

        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Deleting <strong>{contractor.name}</strong> will permanently remove:
            <ul className='mt-2 ml-4 list-disc space-y-1'>
              <li>The contractor record</li>
              <li>All FRM32 submissions and evaluations</li>
              <li>All contractor profiles and accounts</li>
              <li>All session data and related records</li>
            </ul>
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type='button'
            variant='destructive'
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Contractor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
