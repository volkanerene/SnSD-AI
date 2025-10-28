'use client';

import { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoGenerationForm } from '@/features/marcel-gpt/components/video-generation-form';
import { JobListTable } from '@/features/marcel-gpt/components/job-list-table';
import { PresetManager } from '@/features/marcel-gpt/components/preset-manager';
import { ProtectedRoute } from '@/components/protected-route';
import { IconVideo, IconHistory, IconSettings } from '@tabler/icons-react';

export default function MarcelGPTPage() {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <ProtectedRoute requiredPermission='modules.access_marcel_gpt'>
      <PageContainer scrollable>
        <div className='space-y-6'>
          {/* Header */}
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>MarcelGPT</h1>
              <p className='text-muted-foreground'>
                AI-powered video generation with HeyGen avatars
              </p>
            </div>
          </div>

          {/* Main Content */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='space-y-4'
          >
            <TabsList>
              <TabsTrigger value='create' className='flex items-center gap-2'>
                <IconVideo className='h-4 w-4' />
                Create Video
              </TabsTrigger>
              <TabsTrigger value='history' className='flex items-center gap-2'>
                <IconHistory className='h-4 w-4' />
                Job History
              </TabsTrigger>
              <TabsTrigger value='presets' className='flex items-center gap-2'>
                <IconSettings className='h-4 w-4' />
                Presets
              </TabsTrigger>
            </TabsList>

            <TabsContent value='create' className='space-y-4'>
              <VideoGenerationForm />
            </TabsContent>

            <TabsContent value='history' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Video Generation Jobs</CardTitle>
                  <CardDescription>
                    Track the status of your video generation requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <JobListTable />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='presets' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Brand Presets</CardTitle>
                  <CardDescription>
                    Save and reuse your favorite avatar, voice, and style
                    combinations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PresetManager />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageContainer>
    </ProtectedRoute>
  );
}
