'use client';

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useContractor } from '@/hooks/useContractors';
import { toast } from 'sonner';
import type { Contractor, ContractorUpdate } from '@/types/api';
import { COUNTRY_CODES, getDefaultCountry } from '@/lib/country-codes';

const contractorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  legal_name: z.string().min(2, 'Legal name is required'),
  company_type: z.enum(['bireysel', 'limited']),
  tax_number: z
    .string()
    .regex(/^\d{10}$/, 'Tax number must be exactly 10 digits'),
  contact_person: z.string().min(2, 'Contact person is required'),
  contact_email: z.string().email('Valid email is required'),
  country_code: z
    .string()
    .startsWith('+', 'Country code is required')
    .min(2, 'Country code is required'),
  contact_phone: z
    .string()
    .regex(/^\d{1,10}$/, 'Phone number must be 1-10 digits'),
  city: z.string().min(2, 'City is required'),
  country: z.string().default('TR'),
  address: z.string().optional(),
  trade_registry_number: z.string().optional(),
  status: z.enum(['active', 'inactive', 'blacklisted']).default('active')
});

type ContractorFormData = z.infer<typeof contractorSchema>;

interface EditContractorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractor: Contractor;
  tenantId: string;
}

export function EditContractorDialog({
  open,
  onOpenChange,
  contractor,
  tenantId
}: EditContractorDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateContractorAsync } = useContractor(contractor.id, tenantId);

  const defaultCountry = getDefaultCountry();
  const form = useForm<ContractorFormData>({
    resolver: zodResolver(contractorSchema),
    defaultValues: {
      name: contractor.name || '',
      legal_name: contractor.legal_name || '',
      company_type:
        (contractor.company_type as 'bireysel' | 'limited') || 'limited',
      tax_number: contractor.tax_number || '',
      contact_person: contractor.contact_person || '',
      contact_email: contractor.contact_email || '',
      country_code:
        contractor.contact_phone?.substring(
          0,
          contractor.contact_phone?.indexOf(' ')
        ) || defaultCountry.code,
      contact_phone:
        contractor.contact_phone?.replace(/\D/g, '').slice(-10) || '',
      city: contractor.city || '',
      country: contractor.country || 'TR',
      address: contractor.address || '',
      trade_registry_number: contractor.trade_registry_number || '',
      status: contractor.status as 'active' | 'inactive' | 'blacklisted'
    }
  });

  const onSubmit = async (data: ContractorFormData) => {
    setIsSubmitting(true);
    try {
      await updateContractorAsync(data as ContractorUpdate);
      toast.success('Contractor updated successfully');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update contractor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Edit Contractor</DialogTitle>
          <DialogDescription>
            Update the contractor&apos;s information.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Acme Corp' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='legal_name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Legal Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Acme Corporation Ltd.' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='company_type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select company type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='bireysel'>
                          Bireysel (Individual)
                        </SelectItem>
                        <SelectItem value='limited'>Limited Company</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='tax_number'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Number (10 digits)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='1234567890'
                        maxLength={10}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='trade_registry_number'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trade Registry (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder='TR12345' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='contact_person'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input placeholder='John Doe' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='contact_email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='john@example.com'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='country_code'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country Code</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select country' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='max-h-60'>
                        {COUNTRY_CODES.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            <span className='mr-2'>{country.flag}</span>
                            {country.country} ({country.code})
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
                name='contact_phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (max 10 digits)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='5321234567'
                        maxLength={10}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
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
                        <SelectItem value='active'>Active</SelectItem>
                        <SelectItem value='inactive'>Inactive</SelectItem>
                        <SelectItem value='blacklisted'>Blacklisted</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='city'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder='Istanbul' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='country'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder='TR' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='address'
                render={({ field }) => (
                  <FormItem className='col-span-2'>
                    <FormLabel>Address (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder='123 Main St, Suite 100' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                {isSubmitting ? 'Updating...' : 'Update Contractor'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
