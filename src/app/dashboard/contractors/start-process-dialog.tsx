'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface StartProcessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedContractorIds: string[];
  tenantId: string;
  onSuccess: () => void;
}

export function StartProcessDialog({
  open,
  onOpenChange,
  selectedContractorIds,
  tenantId,
  onSuccess
}: StartProcessDialogProps) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  // Reset message when dialog closes
  useEffect(() => {
    if (!open) {
      setMessage('');
    }
  }, [open]);

  const handleStartProcess = async () => {
    if (selectedContractorIds.length === 0) {
      toast.error('Please select at least one contractor');
      return;
    }

    if (!tenantId) {
      toast.error(
        'Missing tenant context. Please make sure a tenant is selected.'
      );
      return;
    }

    setIsStarting(true);

    try {
      const payload = {
        contractor_ids: selectedContractorIds,
        tenant_id: tenantId,
        custom_message: message || undefined
      };

      const data = await apiClient.post<{
        session_id: string;
        contractors_notified: number;
        message: string;
      }>('/api/evren-gpt/start-process', payload, {
        tenantId
      });

      console.log('[StartProcessDialog] Session created:', data.session_id);

      // Store session ID and contractor ID in localStorage for FRM32 form
      if (typeof window !== 'undefined') {
        localStorage.setItem('frm32_session_id', data.session_id);
        // If single contractor, also store the contractor ID and navigate directly to FRM32
        if (selectedContractorIds.length === 1) {
          localStorage.setItem('frm32_contractor_id', selectedContractorIds[0]);
          console.log(
            '[StartProcessDialog] Navigating to FRM32 with session:',
            data.session_id,
            'contractor:',
            selectedContractorIds[0]
          );
          // Navigate to FRM32 form with parameters
          router.push(
            `/dashboard/evren-gpt/frm32?session=${data.session_id}&contractor=${selectedContractorIds[0]}`
          );
        } else {
          // Multiple contractors - navigate to evaluations page
          console.log(
            '[StartProcessDialog] Multiple contractors selected, navigating to evaluations'
          );
          toast.success(
            `Successfully started EvrenGPT process for ${selectedContractorIds.length} contractor(s).`
          );
          router.push('/dashboard/evaluations');
        }
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to start process');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Start EvrenGPT Evaluation Process</DialogTitle>
          <DialogDescription>
            This will create a new evaluation session and send FRM32 forms to
            the selected contractors
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Selected Contractors Count */}
          <div className='bg-muted rounded-md p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h4 className='font-semibold'>Selected Contractors</h4>
                <p className='text-muted-foreground text-sm'>
                  {selectedContractorIds.length} contractor(s) will receive
                  FRM32 evaluation forms
                </p>
              </div>
              <Badge variant='outline' className='text-lg'>
                {selectedContractorIds.length}
              </Badge>
            </div>
          </div>

          {/* Process Flow Info */}
          <div className='space-y-2'>
            <Label>Process Flow</Label>
            <div className='bg-muted rounded-md p-4 text-sm'>
              <ol className='list-decimal space-y-2 pl-4'>
                <li>
                  <strong>FRM32</strong> - Contractor Admin fills the form
                  <span className='text-muted-foreground block text-xs'>
                    Scored by AI (0, 3, 6, 10 points per question)
                  </span>
                </li>
                <li>
                  <strong>FRM33</strong> - Supervisor evaluation
                  <span className='text-muted-foreground block text-xs'>
                    Auto-triggered after FRM32 completion
                  </span>
                </li>
                <li>
                  <strong>FRM34</strong> - Supervisor evaluation
                  <span className='text-muted-foreground block text-xs'>
                    Auto-triggered after FRM33 completion
                  </span>
                </li>
                <li>
                  <strong>FRM35</strong> - Supervisor evaluation
                  <span className='text-muted-foreground block text-xs'>
                    Auto-triggered after FRM34 completion
                  </span>
                </li>
                <li>
                  <strong>Final Score</strong> - Average of all forms
                  <span className='text-muted-foreground block text-xs'>
                    Calculated automatically
                  </span>
                </li>
              </ol>
            </div>
          </div>

          {/* Custom Message */}
          <div className='space-y-2'>
            <Label htmlFor='message'>Custom Message (Optional)</Label>
            <Textarea
              id='message'
              placeholder='Add a custom message to include in the email to contractors...'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isStarting}
          >
            Cancel
          </Button>
          <Button onClick={handleStartProcess} disabled={isStarting}>
            {isStarting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Starting Process...
              </>
            ) : (
              'Start EvrenGPT Process'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
