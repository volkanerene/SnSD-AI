'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  IconSparkles,
  IconFileUpload,
  IconEdit,
  IconLoader2,
  IconCheck,
  IconX
} from '@tabler/icons-react';
import { toast } from 'sonner';
import {
  useGenerateScript,
  useGenerateScriptFromPDF,
  useRefineScript
} from '@/hooks/useMarcelGPT';

interface ScriptGeneratorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ScriptGenerator({ value, onChange }: ScriptGeneratorProps) {
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isRefineOpen, setIsRefineOpen] = useState(false);
  const [isPDFOpen, setIsPDFOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [refinementInstructions, setRefinementInstructions] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateMutation = useGenerateScript();
  const pdfMutation = useGenerateScriptFromPDF();
  const refineMutation = useRefineScript();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    try {
      const result = await generateMutation.mutateAsync({ prompt });
      onChange(result?.script ?? '');
      setPrompt('');
      setIsGenerateOpen(false);
      toast.success('Script generated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate script');
    }
  };

  const handlePDFUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a PDF file');
      return;
    }

    try {
      const result = await pdfMutation.mutateAsync(selectedFile);
      onChange(result?.script ?? '');
      setSelectedFile(null);
      setIsPDFOpen(false);
      toast.success('Script extracted from PDF successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to extract script from PDF');
    }
  };

  const handleRefine = async () => {
    if (!refinementInstructions.trim()) {
      toast.error('Please enter refinement instructions');
      return;
    }

    if (!value.trim()) {
      toast.error('Please enter a script to refine');
      return;
    }

    try {
      const result = await refineMutation.mutateAsync({
        original_script: value,
        refinement_instructions: refinementInstructions
      });
      onChange(result?.script ?? '');
      setRefinementInstructions('');
      setIsRefineOpen(false);
      toast.success('Script refined successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to refine script');
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

  return (
    <div className='flex gap-2'>
      {/* Generate with AI Button */}
      <Button
        variant='outline'
        size='sm'
        onClick={() => setIsGenerateOpen(true)}
      >
        <IconSparkles className='mr-2 h-4 w-4' />
        Generate with AI
      </Button>

      {/* Upload PDF Button */}
      <Button variant='outline' size='sm' onClick={() => setIsPDFOpen(true)}>
        <IconFileUpload className='mr-2 h-4 w-4' />
        From PDF
      </Button>

      {/* Refine Script Button */}
      <Button
        variant='outline'
        size='sm'
        onClick={() => setIsRefineOpen(true)}
        disabled={!value.trim()}
      >
        <IconEdit className='mr-2 h-4 w-4' />
        Refine
      </Button>

      {/* Generate Dialog */}
      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Script with AI</DialogTitle>
            <DialogDescription>
              Describe what you want the video to be about, and AI will generate
              a script for you.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='prompt'>Prompt</Label>
              <Textarea
                id='prompt'
                placeholder='e.g., Create a professional introduction for a software company that specializes in AI solutions...'
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsGenerateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending || !prompt.trim()}
            >
              {generateMutation.isPending ? (
                <>
                  <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                  Generating...
                </>
              ) : (
                <>
                  <IconSparkles className='mr-2 h-4 w-4' />
                  Generate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Upload Dialog */}
      <Dialog open={isPDFOpen} onOpenChange={setIsPDFOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extract Script from PDF</DialogTitle>
            <DialogDescription>
              Upload a PDF document and AI will convert it into a video script.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='pdf-file'>PDF File</Label>
              <Input
                id='pdf-file'
                type='file'
                accept='.pdf'
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
              {selectedFile && (
                <div className='bg-muted flex items-center justify-between rounded-md p-2 text-sm'>
                  <span>{selectedFile.name}</span>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    <IconX className='h-4 w-4' />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsPDFOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePDFUpload}
              disabled={pdfMutation.isPending || !selectedFile}
            >
              {pdfMutation.isPending ? (
                <>
                  <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                  Processing...
                </>
              ) : (
                <>
                  <IconCheck className='mr-2 h-4 w-4' />
                  Extract Script
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refine Script Dialog */}
      <Dialog open={isRefineOpen} onOpenChange={setIsRefineOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refine Script with AI</DialogTitle>
            <DialogDescription>
              Tell the AI how you want to improve or modify your current script.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='refinement'>Refinement Instructions</Label>
              <Textarea
                id='refinement'
                placeholder='e.g., Make it more professional and concise, remove unnecessary details...'
                value={refinementInstructions}
                onChange={(e) => setRefinementInstructions(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsRefineOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRefine}
              disabled={
                refineMutation.isPending || !refinementInstructions.trim()
              }
            >
              {refineMutation.isPending ? (
                <>
                  <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                  Refining...
                </>
              ) : (
                <>
                  <IconEdit className='mr-2 h-4 w-4' />
                  Refine Script
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
