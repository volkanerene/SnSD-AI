'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Download, Upload, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

interface ImportContractorsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
}

export function ImportContractorsDialog({
  open,
  onOpenChange,
  tenantId
}: ImportContractorsDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    // Create Excel template with headers
    const headers = [
      'Name',
      'Legal Name',
      'Tax Number',
      'Trade Registry Number',
      'Contact Person',
      'Contact Email',
      'Contact Phone',
      'Address',
      'City',
      'Country',
      'Status'
    ];

    // Sample data row
    const sampleData = [
      'Güveli İnşaat',
      'Güveli İnşaat Ticaret Limited Şirketi',
      '1234567890',
      'TR123456',
      'Ahmet Güveli',
      'ahmet@guveli.com',
      '+90 555 123 4567',
      'Example Street No:1',
      'Istanbul',
      'Turkey',
      'active'
    ];

    // Create CSV content
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      headers.join(',') +
      '\n' +
      sampleData.join(',');

    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'contractors_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Template downloaded successfully');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];

      if (
        !validTypes.includes(file.type) &&
        !file.name.endsWith('.csv') &&
        !file.name.endsWith('.xlsx')
      ) {
        toast.error('Please upload a CSV or Excel file');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);

    try {
      // TODO: Implement API call to upload and process Excel file
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('tenant_id', tenantId);

      // Simulate upload
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success(
        `Successfully imported contractors from ${selectedFile.name}`
      );

      // Reset state
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to import contractors');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Import Contractors</DialogTitle>
          <DialogDescription>
            Upload an Excel or CSV file to import multiple contractors at once
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Download Template */}
          <div className='space-y-2'>
            <Label>Step 1: Download Template</Label>
            <Button
              variant='outline'
              className='w-full'
              onClick={handleDownloadTemplate}
            >
              <Download className='mr-2 h-4 w-4' />
              Download Excel Template
            </Button>
            <p className='text-muted-foreground text-xs'>
              Download the template, fill in your contractor data, and upload it
              back
            </p>
          </div>

          {/* Upload File */}
          <div className='space-y-2'>
            <Label htmlFor='file-upload'>Step 2: Upload Filled Template</Label>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                className='flex-1'
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className='mr-2 h-4 w-4' />
                {selectedFile ? selectedFile.name : 'Choose File'}
              </Button>
              <input
                ref={fileInputRef}
                id='file-upload'
                type='file'
                accept='.csv,.xlsx,.xls'
                onChange={handleFileSelect}
                className='hidden'
              />
            </div>
            {selectedFile && (
              <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                <FileSpreadsheet className='h-4 w-4' />
                <span>{selectedFile.name}</span>
                <span className='text-xs'>
                  ({(selectedFile.size / 1024).toFixed(2)} KB)
                </span>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className='bg-muted rounded-md p-3'>
            <h4 className='mb-2 text-sm font-semibold'>File Requirements:</h4>
            <ul className='text-muted-foreground space-y-1 text-xs'>
              <li>• Supported formats: CSV, XLS, XLSX</li>
              <li>• First row must contain column headers</li>
              <li>• Required fields: Name, Tax Number, Contact Email</li>
              <li>• Status must be: active, inactive, or blacklisted</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isUploading || !selectedFile}
          >
            {isUploading ? 'Importing...' : 'Import Contractors'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
