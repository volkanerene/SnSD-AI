'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import {
  IconSparkles,
  IconLoader2,
  IconAlertTriangle
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { useGenerateIncidentScript } from '@/hooks/useMarcelGPT';

interface IncidentScriptFormProps {
  onScriptGenerated: (script: string, videoTitle?: string) => void;
}

interface IncidentDetails {
  whatHappened: string;
  whyDidItHappen: string;
  whatDidTheyLearn: string;
  askYourselfOrCrew: string;
}

export function IncidentScriptForm({
  onScriptGenerated
}: IncidentScriptFormProps) {
  const [incidentDetails, setIncidentDetails] = useState<IncidentDetails>({
    whatHappened: '',
    whyDidItHappen: '',
    whatDidTheyLearn: '',
    askYourselfOrCrew: ''
  });
  const [videoTitle, setVideoTitle] = useState('');

  const generateMutation = useGenerateIncidentScript();

  const handleInputChange = (field: keyof IncidentDetails, value: string) => {
    setIncidentDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateScript = async () => {
    // Validate inputs
    if (!incidentDetails.whatHappened.trim()) {
      toast.error('Please describe what happened');
      return;
    }

    try {
      const result = await generateMutation.mutateAsync({
        what_happened: incidentDetails.whatHappened,
        why_did_it_happen: incidentDetails.whyDidItHappen,
        what_did_they_learn: incidentDetails.whatDidTheyLearn,
        ask_yourself_or_crew: incidentDetails.askYourselfOrCrew
      });

      if (result?.script) {
        onScriptGenerated(result.script, videoTitle || undefined);
        toast.success('Script generated successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate script');
    }
  };

  return (
    <Card>
      <CardContent className='pt-6'>
        <div className='mb-6 space-y-1'>
          <h3 className='flex items-center gap-2 text-lg font-semibold'>
            <IconAlertTriangle className='h-5 w-5 text-orange-500' />
            Describe the Incident
          </h3>
          <p className='text-muted-foreground text-sm'>
            Provide details about the incident so the AI can create an
            appropriate training script
          </p>
        </div>

        <div className='space-y-6'>
          {/* Video Title */}
          <div className='space-y-2'>
            <Label htmlFor='video-title'>Video Title (optional)</Label>
            <Input
              id='video-title'
              placeholder='Enter a title for your video (e.g., "Safety Incident Report 2024")'
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
            />
            <p className='text-muted-foreground text-xs'>
              If left empty, a title will be generated from the incident
            </p>
          </div>

          {/* What happened */}
          <div className='space-y-2'>
            <Label htmlFor='what-happened' className='font-semibold'>
              What happened?
            </Label>
            <Textarea
              id='what-happened'
              placeholder='Describe the incident in detail: who was involved, what were they doing, what went wrong...'
              value={incidentDetails.whatHappened}
              onChange={(e) =>
                handleInputChange('whatHappened', e.target.value)
              }
              rows={4}
              className='resize-none'
            />
          </div>

          {/* Why did it happen */}
          <div className='space-y-2'>
            <Label htmlFor='why-happened' className='font-semibold'>
              Why did it happen?
            </Label>
            <Textarea
              id='why-happened'
              placeholder='Root cause analysis: equipment failure, human error, inadequate procedures, lack of training...'
              value={incidentDetails.whyDidItHappen}
              onChange={(e) =>
                handleInputChange('whyDidItHappen', e.target.value)
              }
              rows={3}
              className='resize-none'
            />
            <p className='text-muted-foreground text-xs'>Optional</p>
          </div>

          {/* What did they learn */}
          <div className='space-y-2'>
            <Label htmlFor='lessons-learned' className='font-semibold'>
              What did they learn? (Key takeaways)
            </Label>
            <Textarea
              id='lessons-learned'
              placeholder='What are the main lessons learned? What changes were made to prevent recurrence?'
              value={incidentDetails.whatDidTheyLearn}
              onChange={(e) =>
                handleInputChange('whatDidTheyLearn', e.target.value)
              }
              rows={3}
              className='resize-none'
            />
            <p className='text-muted-foreground text-xs'>Optional</p>
          </div>

          {/* Ask yourself or crew */}
          <div className='space-y-2'>
            <Label htmlFor='ask-yourself' className='font-semibold'>
              Ask yourself or your crew
            </Label>
            <Textarea
              id='ask-yourself'
              placeholder='Reflection questions or action items for viewers (e.g., "How would you have prevented this?", "What training would help?")'
              value={incidentDetails.askYourselfOrCrew}
              onChange={(e) =>
                handleInputChange('askYourselfOrCrew', e.target.value)
              }
              rows={2}
              className='resize-none'
            />
            <p className='text-muted-foreground text-xs'>Optional</p>
          </div>
        </div>

        <div className='mt-6 flex gap-2'>
          <Button
            onClick={handleGenerateScript}
            disabled={
              generateMutation.isPending || !incidentDetails.whatHappened.trim()
            }
            className='flex-1 gap-2'
            size='lg'
          >
            {generateMutation.isPending ? (
              <>
                <IconLoader2 className='h-4 w-4 animate-spin' />
                Generating Script...
              </>
            ) : (
              <>
                <IconSparkles className='h-4 w-4' />
                Generate Script
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
