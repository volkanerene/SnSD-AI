'use client';

import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { ScriptGenerationFlow } from '@/features/marcel-gpt/components/script-generation-flow';
import { ProtectedRoute } from '@/components/protected-route';
import { IconVideo } from '@tabler/icons-react';

export default function MarcelGPTPage() {
  const featureEnabled = process.env.NEXT_PUBLIC_ENABLE_MARCEL_GPT === 'true';

  if (!featureEnabled) {
    return (
      <PageContainer scrollable>
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>MarcelGPT Disabled</CardTitle>
              <CardDescription>
                This module is turned off for your current environment. Enable
                `NEXT_PUBLIC_ENABLE_MARCEL_GPT` to access HeyGen video features.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <ProtectedRoute requiredPermission='modules.access_marcel_gpt'>
      <PageContainer scrollable>
        <div className='space-y-6'>
          {/* Header */}
          <div className='flex items-center gap-3'>
            <IconVideo className='text-primary h-8 w-8' />
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>MarcelGPT</h1>
              <p className='text-muted-foreground'>
                AI-powered video generation with HeyGen avatars
              </p>
            </div>
          </div>

          {/* Main Content - Script Generation Flow */}
          <Card>
            <CardHeader>
              <CardTitle>Create Training Video</CardTitle>
              <CardDescription>
                Generate video scripts for education or incident reports, then
                create videos with AI avatars
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScriptGenerationFlow />
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </ProtectedRoute>
  );
}
