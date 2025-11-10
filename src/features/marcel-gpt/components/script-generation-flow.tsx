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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IconChevronRight } from '@tabler/icons-react';
import { EducationScriptForm } from './education-script-form';
import { IncidentScriptForm } from './incident-script-form';
import { VideoGenerationForm } from './video-generation-form';

export type ScriptType = 'education' | 'incident' | null;
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

  const handleScriptTypeSelect = (type: ScriptType) => {
    setScriptType(type);
    setStep('script-generation');
  };

  const handleScriptGenerated = (script: string) => {
    setGeneratedScript(script);
    onScriptGenerated?.(script);
    setStep('video-generation');
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
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
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
          </div>
        </div>
      )}

      {/* Step 2: Generate script */}
      {step === 'script-generation' && scriptType && (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <Label className='text-base font-semibold'>
                {scriptType === 'education'
                  ? '📚 Generate Education Script'
                  : '⚠️ Generate Incident Report Script'}
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

          {scriptType === 'education' && (
            <EducationScriptForm onScriptGenerated={handleScriptGenerated} />
          )}

          {scriptType === 'incident' && (
            <IncidentScriptForm onScriptGenerated={handleScriptGenerated} />
          )}
        </div>
      )}

      {/* Step 3: Generate video */}
      {step === 'video-generation' && generatedScript && (
        <div className='space-y-4'>
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

          <VideoGenerationForm initialScript={generatedScript} />
        </div>
      )}
    </div>
  );
}
