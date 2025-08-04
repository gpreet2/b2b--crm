'use client';

import {
  XMarkIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import React, { useState, useRef } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface FormUploaderProps {
  onUpload: (formData: {
    name: string;
    type: 'waiver' | 'agreement' | 'medical' | 'emergency' | 'policy' | 'other';
    description?: string;
    isRequired?: boolean;
    file: File;
  }) => void;
  onClose: () => void;
}

export function FormUploader({ onUpload, onClose }: FormUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    type: 'waiver' | 'agreement' | 'medical' | 'emergency' | 'policy' | 'other';
    description: string;
    isRequired: boolean;
  }>({
    name: '',
    type: 'waiver',
    description: '',
    isRequired: false,
  });
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>(
    'idle'
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF, Word document, or text file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);

    // Auto-populate form name from filename
    if (!formData.name) {
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
      setFormData(prev => ({ ...prev, name: nameWithoutExtension }));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !formData.name.trim()) {
      alert('Please select a file and enter a form name');
      return;
    }

    setUploadStatus('uploading');

    // Simulate upload process
    setTimeout(() => {
      setUploadStatus('success');
      setTimeout(() => {
        onUpload({
          ...formData,
          file: selectedFile,
        });
      }, 1000);
    }, 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))  } ${  sizes[i]}`;
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return '📄';
    if (file.type.includes('word')) return '📝';
    if (file.type === 'text/plain') return '📃';
    return '📄';
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-surface rounded-xl shadow-2xl w-full max-w-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-border'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-primary/10 rounded-lg'>
              <CloudArrowUpIcon className='h-5 w-5 text-primary' />
            </div>
            <div>
              <h2 className='text-xl font-semibold text-primary-text'>Upload Form</h2>
              <p className='text-secondary-text'>Upload an existing form document</p>
            </div>
          </div>
          <button onClick={onClose} className='p-2 hover:bg-accent rounded-lg transition-colors'>
            <XMarkIcon className='h-5 w-5 text-secondary-text' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 space-y-6'>
          {uploadStatus === 'success' ? (
            /* Success State */
            <div className='text-center py-8'>
              <CheckCircleIcon className='h-16 w-16 text-green-500 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-primary-text mb-2'>
                Form Uploaded Successfully!
              </h3>
              <p className='text-secondary-text'>
                Your form has been uploaded and is ready for use.
              </p>
            </div>
          ) : (
            <>
              {/* File Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-primary bg-primary/5'
                    : selectedFile
                      ? 'border-green-300 bg-green-50'
                      : 'border-border hover:border-primary/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='.pdf,.doc,.docx,.txt'
                  onChange={handleFileInputChange}
                  className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                />

                {selectedFile ? (
                  /* File Selected */
                  <div className='space-y-3'>
                    <div className='text-4xl'>{getFileIcon(selectedFile)}</div>
                    <div>
                      <p className='font-medium text-primary-text'>{selectedFile.name}</p>
                      <p className='text-sm text-secondary-text'>
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                    >
                      Remove File
                    </Button>
                  </div>
                ) : (
                  /* Upload Prompt */
                  <div className='space-y-4'>
                    <CloudArrowUpIcon className='h-12 w-12 text-secondary-text mx-auto' />
                    <div>
                      <p className='text-lg font-medium text-primary-text'>
                        Drop your form here, or click to browse
                      </p>
                      <p className='text-sm text-secondary-text mt-1'>
                        Supports PDF, Word documents, and text files (max 10MB)
                      </p>
                    </div>
                    <Button variant='outline'>Choose File</Button>
                  </div>
                )}
              </div>

              {/* Form Details */}
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-primary-text mb-2'>
                    Form Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder='Enter form name'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-primary-text mb-2'>
                    Form Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={e =>
                      setFormData({ ...formData, type: e.target.value as typeof formData.type })
                    }
                    className='w-full px-3 py-2 border border-border rounded-lg bg-surface text-primary-text focus:outline-none focus:ring-2 focus:ring-primary/20'
                  >
                    <option value='waiver'>Liability Waiver</option>
                    <option value='agreement'>Membership Agreement</option>
                    <option value='medical'>Medical Form</option>
                    <option value='emergency'>Emergency Contact</option>
                    <option value='policy'>Gym Policy</option>
                    <option value='other'>Other</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-primary-text mb-2'>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder='Brief description of this form (optional)'
                    rows={3}
                    className='w-full px-3 py-2 border border-border rounded-lg bg-surface text-primary-text focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none'
                  />
                </div>

                <div className='flex items-center gap-3'>
                  <input
                    type='checkbox'
                    id='isRequired'
                    checked={formData.isRequired}
                    onChange={e => setFormData({ ...formData, isRequired: e.target.checked })}
                    className='w-4 h-4 text-primary bg-surface border-border rounded focus:ring-primary/20'
                  />
                  <label htmlFor='isRequired' className='text-sm font-medium text-primary-text'>
                    Mark as required form
                  </label>
                </div>
              </div>

              {/* Upload Status */}
              {uploadStatus === 'uploading' && (
                <div className='flex items-center gap-3 p-4 bg-blue-50 rounded-lg'>
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-primary' />
                  <span className='text-sm text-primary-text'>Uploading form...</span>
                </div>
              )}

              {uploadStatus === 'error' && (
                <div className='flex items-center gap-3 p-4 bg-red-50 rounded-lg'>
                  <ExclamationTriangleIcon className='h-5 w-5 text-red-500' />
                  <span className='text-sm text-red-700'>Upload failed. Please try again.</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {uploadStatus !== 'success' && (
          <div className='flex items-center justify-end gap-3 p-6 border-t border-border'>
            <Button variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !formData.name.trim() || uploadStatus === 'uploading'}
            >
              {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Form'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
