'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useSubmissions } from '@/hooks/useSubmissions';
import { useContractors } from '@/hooks/useContractors';
import { toast } from 'sonner';
import type { FRM32SubmissionCreate } from '@/types/api';

const evaluationSchema = z.object({
  contractor_id: z.string().min(1, 'Please select a contractor'),
  evaluation_period: z
    .string()
    .min(1, 'Evaluation period is required')
    .regex(/^\d{4}-Q[1-4]$/, 'Format should be YYYY-Q# (e.g., 2025-Q1)'),
  evaluation_type: z.enum(['periodic', 'incident', 'audit']),
  status: z.enum(['draft', 'submitted']).default('draft')
});

type EvaluationFormData = z.infer<typeof evaluationSchema>;

interface CreateEvaluationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
}

export function CreateEvaluationDialog({
  open,
  onOpenChange,
  tenantId
}: CreateEvaluationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createSubmissionAsync } = useSubmissions(tenantId);
  const { contractors } = useContractors({
    tenantId,
    filters: { status: 'active' }
  });

  const form = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      evaluation_type: 'periodic',
      status: 'draft'
    }
  });

  const onSubmit = async (data: EvaluationFormData) => {
    setIsSubmitting(true);
    try {
      await createSubmissionAsync(data as FRM32SubmissionCreate);
      toast.success('Evaluation created successfully');
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create evaluation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Create New Evaluation</DialogTitle>
          <DialogDescription>
            Start a new FRM-32 contractor safety evaluation
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='contractor_id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contractor</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a contractor' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {contractors.map((contractor) => (
                        <SelectItem key={contractor.id} value={contractor.id}>
                          {contractor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='evaluation_period'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evaluation Period</FormLabel>
                  <FormControl>
                    <Input placeholder='2025-Q1' {...field} />
                  </FormControl>
                  <FormDescription>
                    Format: YYYY-Q# (e.g., 2025-Q1, 2025-Q2)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='evaluation_type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evaluation Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='periodic'>
                        Periodic - Regular scheduled evaluation
                      </SelectItem>
                      <SelectItem value='incident'>
                        Incident - Post-incident evaluation
                      </SelectItem>
                      <SelectItem value='audit'>
                        Audit - Compliance audit
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select status' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='draft'>
                        Draft - Save for later
                      </SelectItem>
                      <SelectItem value='submitted'>
                        Submitted - Start immediately
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Evaluation'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
