'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IconChevronRight, IconCircleCheck } from '@tabler/icons-react';
import { toast } from 'sonner';
import { EducationScriptForm } from './education-script-form';
import { IncidentScriptForm } from './incident-script-form';
import { VideoGenerationForm } from './video-generation-form';

export type ScriptType = 'education' | 'incident' | 'manual' | null;
export type Step = 'type-select' | 'script-generation' | 'video-generation';

interface ScriptGenerationFlowProps {
  onScriptGenerated?: (script: string) => void;
}

export function ScriptGenerationFlow({
  onScriptGenerated
}: ScriptGenerationFlowProps) {
  const [step, setStep] = useState<Step>('type-select');
  const [scriptType, setScriptType] = useState<ScriptType>(null);
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [videoTitle, setVideoTitle] = useState<string>('');

  const handleScriptTypeSelect = (type: ScriptType) => {
    setScriptType(type);
    setStep('script-generation');
  };

  const [editingScript, setEditingScript] = useState<string>('');

  const handleScriptGenerated = (script: string, title?: string) => {
    setGeneratedScript(script);
    setEditingScript(script);
    if (title) {
      setVideoTitle(title);
    }
    onScriptGenerated?.(script);
  };

  const handleBackToType = () => {
    setStep('type-select');
    setScriptType(null);
    setGeneratedScript('');
  };

  const handleBackToScript = () => {
    setStep('script-generation');
  };

  return (
    <div className='space-y-8 p-8'>
      {/* Progress indicator */}
      <div className='flex items-center gap-3'>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
            step === 'type-select'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          1
        </div>
        <div className='bg-muted h-1 flex-1' />
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
            step === 'script-generation'
              ? 'bg-primary text-primary-foreground'
              : step === 'video-generation'
                ? 'bg-muted text-muted-foreground'
                : 'bg-muted text-muted-foreground'
          }`}
        >
          2
        </div>
        <div className='bg-muted h-1 flex-1' />
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
            step === 'video-generation'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          3
        </div>
      </div>

      {/* Step 1: Select script type */}
      {step === 'type-select' && (
        <div className='space-y-4'>
          <div>
            <Label className='text-2xl font-semibold'>
              What type of video do you want to create?
            </Label>
          </div>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            <Card
              className='hover:border-primary min-h-64 cursor-pointer border-2 p-8 transition-all hover:shadow-lg'
              onClick={() => handleScriptTypeSelect('education')}
            >
              <h3 className='mb-4 text-2xl font-semibold'>
                📚 Education Video
              </h3>
              <p className='text-muted-foreground mb-6 text-base'>
                Create training videos by uploading educational materials or
                describing a topic
              </p>
              <Button variant='outline' size='lg' className='w-full gap-2'>
                Choose <IconChevronRight className='h-5 w-5' />
              </Button>
            </Card>

            <Card
              className='hover:border-primary min-h-64 cursor-pointer border-2 p-8 transition-all hover:shadow-lg'
              onClick={() => handleScriptTypeSelect('incident')}
            >
              <h3 className='mb-4 text-2xl font-semibold'>
                ⚠️ Incident Report
              </h3>
              <p className='text-muted-foreground mb-6 text-base'>
                Generate safety training from incident reports with lessons
                learned
              </p>
              <Button variant='outline' size='lg' className='w-full gap-2'>
                Choose <IconChevronRight className='h-5 w-5' />
              </Button>
            </Card>

            <Card
              className='hover:border-primary min-h-64 cursor-pointer border-2 p-8 transition-all hover:shadow-lg'
              onClick={() => handleScriptTypeSelect('manual')}
            >
              <h3 className='mb-4 text-2xl font-semibold'>✍️ Write Script</h3>
              <p className='text-muted-foreground mb-6 text-base'>
                Write your video script manually and proceed directly to video
                generation
              </p>
              <Button variant='outline' size='lg' className='w-full gap-2'>
                Choose <IconChevronRight className='h-5 w-5' />
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* Step 2: Generate script */}
      {step === 'script-generation' && scriptType && (
        <div className='w-full space-y-6'>
          <div className='flex items-center gap-4'>
            <Button onClick={handleBackToType} size='lg' className='gap-2 px-6'>
              ← Change type
            </Button>
            <Label className='text-2xl font-semibold'>
              {scriptType === 'education'
                ? '📚 Generate Education Script'
                : scriptType === 'incident'
                  ? '⚠️ Generate Incident Report Script'
                  : '✍️ Write Your Script'}
            </Label>
          </div>

          {!generatedScript && (
            <>
              {scriptType === 'education' && (
                <div className='min-h-[500px] overflow-y-auto'>
                  <EducationScriptForm
                    onScriptGenerated={handleScriptGenerated}
                  />
                </div>
              )}

              {scriptType === 'incident' && (
                <div className='min-h-[500px] overflow-y-auto'>
                  <IncidentScriptForm
                    onScriptGenerated={handleScriptGenerated}
                  />
                </div>
              )}

              {scriptType === 'manual' && (
                <ManualScriptEditor
                  onScriptGenerated={handleScriptGenerated}
                  videoTitle={videoTitle}
                  setVideoTitle={setVideoTitle}
                />
              )}
            </>
          )}

          {generatedScript && (
            <div className='space-y-6'>
              <Card className='p-6'>
                <Label className='mb-4 block text-lg font-semibold'>
                  Script (Editable):
                </Label>
                <Textarea
                  value={editingScript}
                  onChange={(e) => setEditingScript(e.target.value)}
                  rows={12}
                  className='resize-none p-4 font-mono text-base'
                />
              </Card>
              <div className='flex gap-3'>
                <Button
                  variant='outline'
                  size='lg'
                  onClick={() => {
                    setGeneratedScript('');
                    setEditingScript('');
                  }}
                >
                  ← Regenerate
                </Button>
                <Button
                  onClick={() => {
                    setGeneratedScript(editingScript);
                    setStep('video-generation');
                  }}
                  className='ml-auto gap-2'
                  size='lg'
                >
                  Next → Generate Video <IconChevronRight className='h-5 w-5' />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Generate video */}
      {step === 'video-generation' && generatedScript && (
        <div className='w-full space-y-6'>
          <div className='flex items-center gap-4'>
            <Button
              onClick={handleBackToScript}
              size='lg'
              className='gap-2 px-6'
            >
              ← Edit script
            </Button>
            <Label className='text-2xl font-semibold'>🎬 Generate Video</Label>
          </div>

          <VideoGenerationForm
            initialScript={generatedScript}
            initialVideoTitle={videoTitle}
          />
        </div>
      )}
    </div>
  );
}

// Manual Script Editor Component
interface ManualScriptEditorProps {
  onScriptGenerated: (script: string, videoTitle?: string) => void;
  videoTitle: string;
  setVideoTitle: (title: string) => void;
}

function ManualScriptEditor({
  onScriptGenerated,
  videoTitle,
  setVideoTitle
}: ManualScriptEditorProps) {
  const [manualScript, setManualScript] = useState('');

  const handleUseScript = () => {
    if (!manualScript.trim()) {
      toast.error('Please write a script');
      return;
    }
    onScriptGenerated(manualScript, videoTitle || undefined);
    toast.success('Script ready to use!');
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-3'>
        <Label htmlFor='video-title-manual' className='text-lg'>
          Video Title (optional)
        </Label>
        <Input
          id='video-title-manual'
          placeholder='Enter a title for your video (e.g., "Training Session 2024")'
          value={videoTitle}
          onChange={(e) => setVideoTitle(e.target.value)}
          className='h-12 text-base'
        />
        <p className='text-muted-foreground text-sm'>
          If left empty, the avatar name will be used as the title
        </p>
      </div>

      <div className='space-y-3'>
        <Label htmlFor='manual-script-full' className='text-lg'>
          Write your video script
        </Label>
        <Textarea
          id='manual-script-full'
          placeholder='Type your script here. Write naturally as if someone is speaking. This will be used directly for your video.'
          value={manualScript}
          onChange={(e) => setManualScript(e.target.value)}
          rows={14}
          className='resize-none p-4 font-mono text-base'
        />
        <div className='text-muted-foreground flex justify-between text-sm'>
          <span>Write naturally and conversationally</span>
          <span>{manualScript.length} characters</span>
        </div>
      </div>

      <Button
        onClick={handleUseScript}
        disabled={!manualScript.trim()}
        className='w-full gap-2 py-6 text-lg'
        size='xl'
      >
        <IconCircleCheck className='h-5 w-5' />
        Continue to Video Generation
      </Button>
    </div>
  );
}
