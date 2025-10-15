'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Download, Eye } from 'lucide-react';
import type { Payment } from '@/types/api';
import { formatDate } from '@/lib/format';

const statusColors = {
  pending: 'bg-yellow-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
  refunded: 'bg-gray-500'
};

const statusLabels = {
  pending: 'Pending',
  completed: 'Completed',
  failed: 'Failed',
  refunded: 'Refunded'
};

const methodLabels = {
  credit_card: 'Credit Card',
  bank_transfer: 'Bank Transfer',
  paypal: 'PayPal',
  wire_transfer: 'Wire Transfer'
};

export const paymentsColumns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'invoice_number',
    header: 'Invoice',
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='font-medium'>
          {row.original.invoice_number || 'N/A'}
        </span>
        <span className='text-muted-foreground text-xs'>
          {row.original.provider_transaction_id
            ? `TX: ${row.original.provider_transaction_id}`
            : 'No transaction ID'}
        </span>
      </div>
    )
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => {
      const amount = row.original.amount;
      const currency = row.original.currency;
      return (
        <div className='font-medium'>
          {amount.toLocaleString('en-US', {
            style: 'currency',
            currency: currency
          })}
        </div>
      );
    }
  },
  {
    accessorKey: 'payment_method',
    header: 'Method',
    cell: ({ row }) => {
      const method = row.original.payment_method;
      return (
        <div className='flex flex-col'>
          <span>{methodLabels[method]}</span>
          {row.original.provider && (
            <span className='text-muted-foreground text-xs capitalize'>
              via {row.original.provider}
            </span>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          variant='outline'
          className={`${statusColors[status]} text-white`}
        >
          {statusLabels[status]}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'subscription_period',
    header: 'Subscription',
    cell: ({ row }) => {
      const period = row.original.subscription_period;
      if (!period) return <span className='text-muted-foreground'>-</span>;

      const startDate = row.original.subscription_starts_at
        ? new Date(row.original.subscription_starts_at).toLocaleDateString()
        : null;
      const endDate = row.original.subscription_ends_at
        ? new Date(row.original.subscription_ends_at).toLocaleDateString()
        : null;

      return (
        <div className='flex flex-col'>
          <Badge variant='outline' className='w-fit capitalize'>
            {period}
          </Badge>
          {startDate && endDate && (
            <span className='text-muted-foreground mt-1 text-xs'>
              {startDate} - {endDate}
            </span>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: 'created_at',
    header: 'Date',
    cell: ({ row }) => {
      const date = row.original.created_at;
      return <span className='text-sm'>{formatDate(date)}</span>;
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const payment = row.original;

      return (
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
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy Payment ID
            </DropdownMenuItem>
            {payment.provider_transaction_id && (
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(
                    payment.provider_transaction_id!
                  )
                }
              >
                Copy Transaction ID
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Eye className='mr-2 h-4 w-4' />
              View Details
            </DropdownMenuItem>
            {payment.invoice_url && (
              <DropdownMenuItem
                onClick={() => window.open(payment.invoice_url!, '_blank')}
              >
                <Download className='mr-2 h-4 w-4' />
                Download Invoice
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
