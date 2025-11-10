'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  IconFileUpload,
  IconSparkles,
  IconLoader2,
  IconCheckCircle
} from '@tabler/icons-react';
import { toast } from 'sonner';
import {
  useGenerateScript,
  useGenerateScriptFromPDF
} from '@/hooks/useMarcelGPT';

interface EducationScriptFormProps {
  onScriptGenerated: (script: string) => void;
}

export function EducationScriptForm({
  onScriptGenerated
}: EducationScriptFormProps) {
  const [activeTab, setActiveTab] = useState<'describe' | 'pdf'>('describe');
  const [topic, setTopic] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateMutation = useGenerateScript();
  const pdfMutation = useGenerateScriptFromPDF();

  const handleGenerateFromTopic = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic or description');
      return;
    }

    try {
      const result = await generateMutation.mutateAsync({ prompt: topic });
      if (result?.script) {
        onScriptGenerated(result.script);
        toast.success('Script generated successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate script');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleGenerateFromPDF = async () => {
    if (!selectedFile) {
      toast.error('Please select a PDF file');
      return;
    }

    try {
      const result = await pdfMutation.mutateAsync(selectedFile);
      if (result?.script) {
        onScriptGenerated(result.script);
        toast.success('Script generated from PDF successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to extract script from PDF');
    }
  };

  return (
    <Card className='border-dashed'>
      <CardContent className='pt-6'>
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'describe' | 'pdf')}
          className='w-full'
        >
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='describe'>📝 Describe Topic</TabsTrigger>
            <TabsTrigger value='pdf'>📄 Upload PDF</TabsTrigger>
          </TabsList>

          {/* Tab 1: Describe Topic */}
          <TabsContent value='describe' className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='topic'>What topic do you want to teach?</Label>
              <Textarea
                id='topic'
                placeholder='Enter the educational topic, learning objectives, key points, etc. The AI will generate a script based on your description.'
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={6}
                className='resize-none'
              />
              <p className='text-muted-foreground text-xs'>
                Be as detailed as possible to get better script results
              </p>
            </div>

            <Button
              onClick={handleGenerateFromTopic}
              disabled={generateMutation.isPending || !topic.trim()}
              className='w-full gap-2'
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
                  Generate Script with AI
                </>
              )}
            </Button>
          </TabsContent>

          {/* Tab 2: Upload PDF */}
          <TabsContent value='pdf' className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='pdf-upload'>Select PDF file</Label>
              <div className='flex flex-col gap-4'>
                <div className='relative'>
                  <Input
                    id='pdf-upload'
                    ref={fileInputRef}
                    type='file'
                    accept='application/pdf'
                    onChange={handleFileSelect}
                    className='hidden'
                  />
                  <Button
                    type='button'
                    variant='outline'
                    className='w-full'
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <IconFileUpload className='mr-2 h-4 w-4' />
                    {selectedFile ? selectedFile.name : 'Choose PDF file...'}
                  </Button>
                </div>

                {selectedFile && (
                  <div className='flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-200'>
                    <IconCheckCircle className='h-4 w-4' />
                    <span>
                      {selectedFile.name} (
                      {(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                )}

                <p className='text-muted-foreground text-xs'>
                  Upload a PDF with educational content (training materials,
                  course notes, etc.) and the AI will extract key information to
                  create a video script.
                </p>
              </div>
            </div>

            <Button
              onClick={handleGenerateFromPDF}
              disabled={pdfMutation.isPending || !selectedFile}
              className='w-full gap-2'
              size='lg'
            >
              {pdfMutation.isPending ? (
                <>
                  <IconLoader2 className='h-4 w-4 animate-spin' />
                  Processing PDF...
                </>
              ) : (
                <>
                  <IconSparkles className='h-4 w-4' />
                  Generate Script from PDF
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
