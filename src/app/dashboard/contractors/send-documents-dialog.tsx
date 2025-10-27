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
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import type { Contractor } from '@/types/api';
import { toast } from 'sonner';

interface SendDocumentsDialogProps {
  contractor: Contractor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DocumentForm {
  id: string;
  name: string;
  description: string;
}

const availableForms: DocumentForm[] = [
  {
    id: 'frm32',
    name: 'FRM32 - Safety Assessment',
    description: 'Safety compliance and risk assessment form'
  },
  {
    id: 'frm33',
    name: 'FRM33 - Equipment Check',
    description: 'Equipment and machinery inspection form'
  },
  {
    id: 'frm34',
    name: 'FRM34 - Documentation Review',
    description: 'Document verification and compliance check'
  },
  {
    id: 'frm35',
    name: 'FRM35 - Training Records',
    description: 'Employee training and certification verification'
  }
];

export function SendDocumentsDialog({
  contractor,
  open,
  onOpenChange
}: SendDocumentsDialogProps) {
  const [selectedForms, setSelectedForms] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleToggleForm = (formId: string) => {
    setSelectedForms((prev) =>
      prev.includes(formId)
        ? prev.filter((id) => id !== formId)
        : [...prev, formId]
    );
  };

  const handleSend = async () => {
    if (selectedForms.length === 0) {
      toast.error('Please select at least one document');
      return;
    }

    setIsSending(true);

    try {
      // TODO: Implement API call to send documents
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(
        `Documents sent to ${contractor?.contact_person} at ${contractor?.contact_email}`
      );

      // Reset state
      setSelectedForms([]);
      setMessage('');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to send documents');
    } finally {
      setIsSending(false);
    }
  };

  if (!contractor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Send Documents to {contractor.name}</DialogTitle>
          <DialogDescription>
            Select forms to send to {contractor.contact_person} (
            {contractor.contact_email})
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Form Selection */}
          <div className='space-y-3'>
            <Label>Select Documents</Label>
            {availableForms.map((form) => (
              <div
                key={form.id}
                className='flex items-start space-x-3 rounded-md border p-4'
              >
                <Checkbox
                  id={form.id}
                  checked={selectedForms.includes(form.id)}
                  onCheckedChange={() => handleToggleForm(form.id)}
                />
                <div className='flex-1'>
                  <label
                    htmlFor={form.id}
                    className='cursor-pointer leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                  >
                    {form.name}
                  </label>
                  <p className='text-muted-foreground text-sm'>
                    {form.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Custom Message */}
          <div className='space-y-2'>
            <Label htmlFor='message'>Custom Message (Optional)</Label>
            <Textarea
              id='message'
              placeholder='Add a custom message to include in the email...'
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
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? 'Sending...' : 'Send Documents'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
