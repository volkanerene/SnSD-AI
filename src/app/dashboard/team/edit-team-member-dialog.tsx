'use client';

import { useEffect } from 'react';
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
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useUpdateTeamMember, TeamMember } from '@/hooks/useTeam';
import { useRoles } from '@/hooks/useRoles';
import { toast } from 'sonner';

const editMemberSchema = z.object({
  role_id: z.string().min(1, 'Please select a role'),
  department: z.string().optional(),
  job_title: z.string().optional()
});

type EditMemberFormData = z.infer<typeof editMemberSchema>;

interface EditTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember;
  tenantId: string;
}

export function EditTeamMemberDialog({
  open,
  onOpenChange,
  member,
  tenantId
}: EditTeamMemberDialogProps) {
  const { mutateAsync: updateMember, isPending } =
    useUpdateTeamMember(tenantId);
  const { data: roles } = useRoles();

  const form = useForm<EditMemberFormData>({
    resolver: zodResolver(editMemberSchema),
    defaultValues: {
      role_id: member.role_id?.toString() || '',
      department: member.department || '',
      job_title: member.job_title || ''
    }
  });

  // Update form when member changes
  useEffect(() => {
    form.reset({
      role_id: member.role_id?.toString() || '',
      department: member.department || '',
      job_title: member.job_title || ''
    });
  }, [member, form]);

  const onSubmit = async (data: EditMemberFormData) => {
    try {
      await updateMember({
        userId: member.user_id,
        data: {
          role_id: parseInt(data.role_id),
          department: data.department,
          job_title: data.job_title
        }
      });
      toast.success('Team member updated successfully');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update team member');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Edit Team Member</DialogTitle>
          <DialogDescription>
            Update {member.full_name}&apos;s role and details
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='bg-muted rounded-lg p-3'>
              <div className='text-sm font-medium'>{member.full_name}</div>
              <div className='text-muted-foreground text-sm'>
                {member.email}
              </div>
            </div>

            <FormField
              control={form.control}
              name='role_id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a role' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles?.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
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
              name='department'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder='Engineering' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='job_title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder='Senior HSE Specialist' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending ? 'Updating...' : 'Update Member'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
