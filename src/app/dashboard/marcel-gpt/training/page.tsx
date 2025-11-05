'use client';

import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { apiClient } from '@/lib/api-client';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  FileText,
  RefreshCw,
  Sparkles,
  Video,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  AlertCircle
} from 'lucide-react';

interface IncidentReport {
  id: string;
  file_name: string;
  incident_type: string;
  severity: string;
  summary: string;
  processing_status: string;
  uploaded_date: string;
}

interface TrainingSession {
  id: string;
  title: string;
  prompt: string;
  generated_text: string;
  video_url: string;
  heygen_status: string;
  created_at: string;
  creator: {
    full_name: string;
  };
}

interface SyncLog {
  id: string;
  status: string;
  files_found: number;
  files_processed: number;
  started_at: string;
  completed_at: string;
}

export default function MarcelGPTTrainingPage() {
  const featureEnabled = process.env.NEXT_PUBLIC_ENABLE_MARCEL_GPT === 'true';

  // All hooks must be called at the top level, before any early returns
  const { profile } = useProfile();
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [avatars, setAvatars] = useState<any[]>([]);
  const [voices, setVoices] = useState<any[]>([]);

  // Form state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState('');
  const [selectedVoiceId, setSelectedVoiceId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [activeTab, setActiveTab] = useState('generator');

  useEffect(() => {
    if (!featureEnabled) return;
    loadReports();
    loadSessions();
    loadSyncLogs();
    loadAvatars();
    loadVoices();
  }, [featureEnabled]);

  if (!featureEnabled) {
    return (
      <PageContainer scrollable>
        <Card>
          <CardHeader>
            <CardTitle>MarcelGPT Training Disabled</CardTitle>
            <CardDescription>
              Training workflows are disabled in this environment.
            </CardDescription>
          </CardHeader>
        </Card>
      </PageContainer>
    );
  }

  const loadReports = async () => {
    try {
      const response = await fetch(
        (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') +
          '/marcel-gpt/training/incident-reports',
        {
          headers: {
            Authorization: 'Bearer ' + (localStorage.getItem('token') || ''),
            'x-tenant-id': profile?.tenant_id || ''
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await fetch(
        (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') +
          '/marcel-gpt/training/training-sessions',
        {
          headers: {
            Authorization: 'Bearer ' + (localStorage.getItem('token') || ''),
            'x-tenant-id': profile?.tenant_id || ''
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const loadSyncLogs = async () => {
    try {
      const response = await fetch(
        (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') +
          '/marcel-gpt/training/sync-status',
        {
          headers: {
            Authorization: 'Bearer ' + (localStorage.getItem('token') || ''),
            'x-tenant-id': profile?.tenant_id || ''
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSyncLogs(data.syncs || []);
      }
    } catch (error) {
      console.error('Failed to load sync logs:', error);
    }
  };

  const loadAvatars = async () => {
    try {
      const response = await fetch(
        (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') +
          '/marcel-gpt/avatars',
        {
          headers: {
            Authorization: 'Bearer ' + (localStorage.getItem('token') || ''),
            'x-tenant-id': profile?.tenant_id || ''
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAvatars(data.avatars || []);
        if (data.avatars && data.avatars.length > 0) {
          setSelectedAvatarId(data.avatars[0].avatar_id);
        }
      }
    } catch (error) {
      console.error('Failed to load avatars:', error);
    }
  };

  const loadVoices = async () => {
    try {
      const response = await fetch(
        (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') +
          '/marcel-gpt/voices',
        {
          headers: {
            Authorization: 'Bearer ' + (localStorage.getItem('token') || ''),
            'x-tenant-id': profile?.tenant_id || ''
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setVoices(data.voices || []);
        if (data.voices && data.voices.length > 0) {
          setSelectedVoiceId(data.voices[0].voice_id);
        }
      }
    } catch (error) {
      console.error('Failed to load voices:', error);
    }
  };

  const handleSyncSharePoint = async () => {
    setIsSyncing(true);

    try {
      const response = await fetch(
        (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') +
          '/marcel-gpt/training/sync-sharepoint',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + (localStorage.getItem('token') || ''),
            'x-tenant-id': profile?.tenant_id || ''
          },
          body: JSON.stringify({ force: true })
        }
      );

      if (response.ok) {
        toast.success(
          'SharePoint sync started. Reports will be updated in background.'
        );
        setTimeout(() => {
          loadReports();
          loadSyncLogs();
        }, 3000);
      } else {
        throw new Error('Sync failed');
      }
    } catch (error) {
      toast.error('Failed to sync SharePoint');
      console.error(error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGenerateTraining = async () => {
    if (!title || !prompt) {
      toast.error('Please fill in title and prompt');
      return;
    }

    if (!selectedAvatarId || !selectedVoiceId) {
      toast.error('Please select avatar and voice');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(
        (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') +
          '/marcel-gpt/training/generate-training',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + (localStorage.getItem('token') || ''),
            'x-tenant-id': profile?.tenant_id || ''
          },
          body: JSON.stringify({
            title,
            prompt,
            avatar_id: selectedAvatarId,
            voice_id: selectedVoiceId
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(
          'Training generation started! This may take a few minutes.'
        );
        setCreateDialogOpen(false);
        setTitle('');
        setPrompt('');

        // Reload sessions after a delay
        setTimeout(() => {
          loadSessions();
        }, 2000);
      } else {
        throw new Error('Generation failed');
      }
    } catch (error) {
      toast.error('Failed to generate training');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> =
      {
        pending: { variant: 'secondary', icon: Clock, label: 'Pending' },
        processing: {
          variant: 'default',
          icon: RefreshCw,
          label: 'Processing'
        },
        completed: {
          variant: 'default',
          icon: CheckCircle2,
          label: 'Completed'
        },
        failed: { variant: 'destructive', icon: XCircle, label: 'Failed' }
      };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className='mr-1 h-3 w-3' />
        {config.label}
      </Badge>
    );
  };

  const completedReports = reports.filter(
    (r) => r.processing_status === 'completed'
  );
  const processingReports = reports.filter(
    (r) => r.processing_status === 'processing'
  );

  return (
    <PageContainer scrollable>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              Training Builder
            </h1>
            <p className='text-muted-foreground mt-2'>
              Generate AI-powered training videos from incident reports
            </p>
          </div>

          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={handleSyncSharePoint}
              disabled={isSyncing}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`}
              />
              Sync SharePoint
            </Button>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Sparkles className='mr-2 h-4 w-4' />
                  Generate Training
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-2xl'>
                <DialogHeader>
                  <DialogTitle>Generate Training Video</DialogTitle>
                  <DialogDescription>
                    AI will analyze {completedReports.length} incident reports
                    and create a custom training script
                  </DialogDescription>
                </DialogHeader>

                <div className='space-y-4 py-4'>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>
                      Training Title
                    </label>
                    <Input
                      placeholder='e.g., Workplace Safety Best Practices'
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>
                      Training Topic / Instructions
                    </label>
                    <Textarea
                      placeholder='Describe what you want the training to cover. AI will use relevant incident reports to create the content...'
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>Avatar</label>
                      <Select
                        value={selectedAvatarId}
                        onValueChange={setSelectedAvatarId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select avatar' />
                        </SelectTrigger>
                        <SelectContent>
                          {avatars.map((avatar) => (
                            <SelectItem
                              key={avatar.avatar_id}
                              value={avatar.avatar_id}
                            >
                              {avatar.avatar_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>Voice</label>
                      <Select
                        value={selectedVoiceId}
                        onValueChange={setSelectedVoiceId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select voice' />
                        </SelectTrigger>
                        <SelectContent>
                          {voices.map((voice) => (
                            <SelectItem
                              key={voice.voice_id}
                              value={voice.voice_id}
                            >
                              {voice.name} ({voice.language})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className='rounded-lg bg-blue-50 p-4 dark:bg-blue-950'>
                    <p className='text-sm text-blue-900 dark:text-blue-100'>
                      <AlertCircle className='mr-2 inline h-4 w-4' />
                      AI will analyze {completedReports.length} processed
                      incident reports to create your training content. Video
                      generation may take 3-5 minutes.
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant='outline'
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGenerateTraining}
                    disabled={isGenerating}
                  >
                    {isGenerating ? 'Generating...' : 'Generate Training Video'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-muted-foreground text-sm font-medium'>
                Total Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{reports.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-muted-foreground text-sm font-medium'>
                Processed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {completedReports.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-muted-foreground text-sm font-medium'>
                Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>
                {processingReports.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-muted-foreground text-sm font-medium'>
                Training Videos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{sessions.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value='generator'>Training Sessions</TabsTrigger>
            <TabsTrigger value='reports'>Incident Reports</TabsTrigger>
            <TabsTrigger value='sync'>Sync History</TabsTrigger>
          </TabsList>

          <TabsContent value='generator' className='space-y-4'>
            {sessions.length === 0 ? (
              <Card>
                <CardContent className='py-12 text-center'>
                  <Sparkles className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
                  <p className='text-muted-foreground'>
                    No training sessions yet
                  </p>
                  <p className='text-muted-foreground mt-2 text-sm'>
                    Click &quot;Generate Training&quot; to create your first
                    AI-powered training video
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className='grid gap-4'>
                {sessions.map((session) => (
                  <Card key={session.id}>
                    <CardHeader>
                      <div className='flex items-start justify-between'>
                        <div>
                          <CardTitle>{session.title}</CardTitle>
                          <CardDescription className='mt-2'>
                            {session.prompt}
                          </CardDescription>
                        </div>
                        {getStatusBadge(session.heygen_status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {session.generated_text && (
                        <div className='mb-4'>
                          <p className='mb-2 text-sm font-medium'>
                            Generated Script:
                          </p>
                          <div className='max-h-40 overflow-y-auto rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-900'>
                            {session.generated_text}
                          </div>
                        </div>
                      )}

                      {session.video_url && (
                        <div className='flex items-center gap-2'>
                          <Button size='sm' asChild>
                            <a
                              href={session.video_url}
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              <Play className='mr-2 h-4 w-4' />
                              Watch Video
                            </a>
                          </Button>
                        </div>
                      )}

                      <div className='text-muted-foreground mt-4 text-xs'>
                        Created by {session.creator?.full_name || 'Unknown'} on{' '}
                        {new Date(session.created_at).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value='reports' className='space-y-4'>
            {reports.length === 0 ? (
              <Card>
                <CardContent className='py-12 text-center'>
                  <FileText className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
                  <p className='text-muted-foreground'>
                    No incident reports found
                  </p>
                  <p className='text-muted-foreground mt-2 text-sm'>
                    Click &quot;Sync SharePoint&quot; to import incident reports
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className='grid gap-4'>
                {reports.map((report) => (
                  <Card key={report.id}>
                    <CardHeader>
                      <div className='flex items-start justify-between'>
                        <div>
                          <CardTitle className='text-base'>
                            {report.file_name}
                          </CardTitle>
                          {report.summary && (
                            <CardDescription className='mt-2'>
                              {report.summary}
                            </CardDescription>
                          )}
                        </div>
                        {getStatusBadge(report.processing_status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='flex flex-wrap gap-2'>
                        {report.incident_type && (
                          <Badge variant='outline'>
                            {report.incident_type}
                          </Badge>
                        )}
                        {report.severity && (
                          <Badge
                            variant={
                              report.severity === 'Yüksek'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {report.severity}
                          </Badge>
                        )}
                      </div>
                      <div className='text-muted-foreground mt-2 text-xs'>
                        Uploaded:{' '}
                        {new Date(report.uploaded_date).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value='sync' className='space-y-4'>
            {syncLogs.length === 0 ? (
              <Card>
                <CardContent className='py-12 text-center'>
                  <RefreshCw className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
                  <p className='text-muted-foreground'>No sync history</p>
                </CardContent>
              </Card>
            ) : (
              <div className='grid gap-4'>
                {syncLogs.map((log) => (
                  <Card key={log.id}>
                    <CardHeader>
                      <div className='flex items-start justify-between'>
                        <CardTitle className='text-base'>
                          SharePoint Sync
                        </CardTitle>
                        {getStatusBadge(log.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='grid grid-cols-3 gap-4 text-sm'>
                        <div>
                          <p className='text-muted-foreground'>Files Found</p>
                          <p className='font-medium'>{log.files_found}</p>
                        </div>
                        <div>
                          <p className='text-muted-foreground'>Processed</p>
                          <p className='font-medium'>{log.files_processed}</p>
                        </div>
                        <div>
                          <p className='text-muted-foreground'>Started</p>
                          <p className='font-medium'>
                            {new Date(log.started_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
