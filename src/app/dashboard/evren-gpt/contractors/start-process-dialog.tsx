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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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
  const [message, setMessage] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  const handleStartProcess = async () => {
    if (selectedContractorIds.length === 0) {
      toast.error('Please select at least one contractor');
      return;
    }

    setIsStarting(true);

    try {
      // TODO: Implement API call to start EvrenGPT process
      // This will:
      // 1. Create a new session with unique session_id
      // 2. Send FRM32 form link to all selected contractors who haven't filled it
      // 3. Mark contractors as "in_process" for this session

      const response = await fetch('/api/evren-gpt/start-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractor_ids: selectedContractorIds,
          tenant_id: tenantId,
          custom_message: message
        })
      });

      if (!response.ok) throw new Error('Failed to start process');

      const data = await response.json();

      toast.success(
        `Successfully started EvrenGPT process for ${selectedContractorIds.length} contractor(s). Session ID: ${data.session_id}`
      );

      setMessage('');
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
