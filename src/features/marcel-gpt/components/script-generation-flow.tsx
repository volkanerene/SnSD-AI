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
    <div className='space-y-6'>
      {/* Progress indicator */}
      <div className='flex items-center gap-2'>
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
            <Label className='text-base font-semibold'>
              What type of video do you want to create?
            </Label>
          </div>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <Card
              className='hover:border-primary cursor-pointer border-2 p-6 transition-all hover:shadow-md'
              onClick={() => handleScriptTypeSelect('education')}
            >
              <h3 className='mb-2 text-lg font-semibold'>📚 Education Video</h3>
              <p className='text-muted-foreground mb-4 text-sm'>
                Create training videos by uploading educational materials or
                describing a topic
              </p>
              <Button variant='outline' size='sm' className='gap-2'>
                Choose <IconChevronRight className='h-4 w-4' />
              </Button>
            </Card>

            <Card
              className='hover:border-primary cursor-pointer border-2 p-6 transition-all hover:shadow-md'
              onClick={() => handleScriptTypeSelect('incident')}
            >
              <h3 className='mb-2 text-lg font-semibold'>⚠️ Incident Report</h3>
              <p className='text-muted-foreground mb-4 text-sm'>
                Generate safety training from incident reports with lessons
                learned
              </p>
              <Button variant='outline' size='sm' className='gap-2'>
                Choose <IconChevronRight className='h-4 w-4' />
              </Button>
            </Card>

            <Card
              className='hover:border-primary cursor-pointer border-2 p-6 transition-all hover:shadow-md'
              onClick={() => handleScriptTypeSelect('manual')}
            >
              <h3 className='mb-2 text-lg font-semibold'>✍️ Write Script</h3>
              <p className='text-muted-foreground mb-4 text-sm'>
                Write your video script manually and proceed directly to video
                generation
              </p>
              <Button variant='outline' size='sm' className='gap-2'>
                Choose <IconChevronRight className='h-4 w-4' />
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* Step 2: Generate script */}
      {step === 'script-generation' && scriptType && (
        <div className='w-full space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <Label className='text-base font-semibold'>
                {scriptType === 'education'
                  ? '📚 Generate Education Script'
                  : scriptType === 'incident'
                    ? '⚠️ Generate Incident Report Script'
                    : '✍️ Write Your Script'}
              </Label>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleBackToType}
              className='text-xs'
            >
              ← Change type
            </Button>
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
            <div className='space-y-4'>
              <Card className='p-4'>
                <Label className='mb-2 block text-sm font-semibold'>
                  Script (Editable):
                </Label>
                <Textarea
                  value={editingScript}
                  onChange={(e) => setEditingScript(e.target.value)}
                  rows={6}
                  className='resize-none font-mono text-sm'
                />
              </Card>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
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
                >
                  Next → Generate Video <IconChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Generate video */}
      {step === 'video-generation' && generatedScript && (
        <div className='w-full space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <Label className='text-base font-semibold'>
                🎬 Generate Video
              </Label>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleBackToScript}
              className='text-xs'
            >
              ← Edit script
            </Button>
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
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='video-title-manual'>Video Title (optional)</Label>
        <Input
          id='video-title-manual'
          placeholder='Enter a title for your video (e.g., "Training Session 2024")'
          value={videoTitle}
          onChange={(e) => setVideoTitle(e.target.value)}
        />
        <p className='text-muted-foreground text-xs'>
          If left empty, the avatar name will be used as the title
        </p>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='manual-script-full'>Write your video script</Label>
        <Textarea
          id='manual-script-full'
          placeholder='Type your script here. Write naturally as if someone is speaking. This will be used directly for your video.'
          value={manualScript}
          onChange={(e) => setManualScript(e.target.value)}
          rows={12}
          className='resize-none font-mono text-sm'
        />
        <div className='text-muted-foreground flex justify-between text-xs'>
          <span>Write naturally and conversationally</span>
          <span>{manualScript.length} characters</span>
        </div>
      </div>

      <Button
        onClick={handleUseScript}
        disabled={!manualScript.trim()}
        className='w-full gap-2'
        size='lg'
      >
        <IconCircleCheck className='h-4 w-4' />
        Continue to Video Generation
      </Button>
    </div>
  );
}
