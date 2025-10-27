'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export default function FRM34EvaluationsPage() {
  return (
    <div className='space-y-4 p-4 pt-6 md:p-8'>
      <div className='flex items-center justify-between'>
        <div>
          <div className='flex items-center gap-3'>
            <h2 className='text-3xl font-bold tracking-tight'>
              FRM34 Evaluations
            </h2>
            <Badge variant='outline' className='bg-purple-500 text-white'>
              Supervisor
            </Badge>
          </div>
          <p className='text-muted-foreground'>
            Supervisor assessment - Triggered after FRM33 completion
          </p>
        </div>
        <Button
          variant='outline'
          onClick={() =>
            window.open('https://snsd-evrengpt.netlify.app/', '_blank')
          }
        >
          <ExternalLink className='mr-2 h-4 w-4' />
          Open Form Template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2 text-sm'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Filled By:</span>
              <span className='font-medium'>Supervisor</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Scoring Method:</span>
              <span className='font-medium'>
                AI-Powered (0, 3, 6, 10 points)
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Previous Step:</span>
              <span className='font-medium'>FRM33 (Supervisor)</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Next Step:</span>
              <span className='font-medium'>Triggers FRM35 (Supervisor)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
