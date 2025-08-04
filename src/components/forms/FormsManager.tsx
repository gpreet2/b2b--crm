'use client';

import {
  DocumentTextIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  ShareIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

import { FormUploader } from './FormUploader';

interface FormDocument {
  id: string;
  name: string;
  type: 'waiver' | 'agreement' | 'medical' | 'emergency' | 'policy' | 'other';
  fileType: 'pdf' | 'doc' | 'docx' | 'txt';
  fileSize: string;
  uploadedDate: string;
  uploadedBy: string;
  downloadCount: number;
  isRequired: boolean;
  description?: string;
}

const mockForms: FormDocument[] = [
  {
    id: '1',
    name: 'Liability Waiver 2024',
    type: 'waiver',
    fileType: 'pdf',
    fileSize: '245 KB',
    uploadedDate: '2024-01-15',
    uploadedBy: 'Admin',
    downloadCount: 156,
    isRequired: true,
    description: 'Updated liability waiver with new safety clauses',
  },
  {
    id: '2',
    name: 'Membership Terms & Conditions',
    type: 'agreement',
    fileType: 'pdf',
    fileSize: '1.2 MB',
    uploadedDate: '2024-01-10',
    uploadedBy: 'Manager',
    downloadCount: 89,
    isRequired: true,
    description: 'Complete membership agreement and terms',
  },
  {
    id: '3',
    name: 'Health Screening Questionnaire',
    type: 'medical',
    fileType: 'pdf',
    fileSize: '180 KB',
    uploadedDate: '2024-01-08',
    uploadedBy: 'Staff',
    downloadCount: 67,
    isRequired: false,
    description: 'Pre-exercise health screening form',
  },
  {
    id: '4',
    name: 'Emergency Contact Information',
    type: 'emergency',
    fileType: 'pdf',
    fileSize: '95 KB',
    uploadedDate: '2024-01-05',
    uploadedBy: 'Admin',
    downloadCount: 134,
    isRequired: true,
    description: 'Emergency contact and medical information',
  },
  {
    id: '5',
    name: 'Gym Rules & Policies',
    type: 'policy',
    fileType: 'pdf',
    fileSize: '320 KB',
    uploadedDate: '2024-01-03',
    uploadedBy: 'Manager',
    downloadCount: 45,
    isRequired: false,
    description: 'Complete gym rules and facility policies',
  },
  {
    id: '6',
    name: 'Personal Training Agreement',
    type: 'agreement',
    fileType: 'docx',
    fileSize: '150 KB',
    uploadedDate: '2023-12-28',
    uploadedBy: 'Trainer',
    downloadCount: 23,
    isRequired: false,
    description: 'Personal training service agreement',
  },
];

export function FormsManager() {
  const [forms, setForms] = useState<FormDocument[]>(mockForms);
  const [showUploader, setShowUploader] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'required' | 'waiver' | 'agreement' | 'medical' | 'emergency' | 'policy' | 'other'
  >('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getTypeColor = (type: FormDocument['type']) => {
    switch (type) {
      case 'waiver':
        return { backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }; // Red
      case 'agreement':
        return { backgroundColor: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' }; // Blue
      case 'medical':
        return { backgroundColor: '#f0fdf4', color: '#059669', borderColor: '#bbf7d0' }; // Emerald
      case 'emergency':
        return { backgroundColor: '#fff7ed', color: '#d97706', borderColor: '#fed7aa' }; // Orange
      case 'policy':
        return { backgroundColor: '#f5f3ff', color: '#7c3aed', borderColor: '#ddd6fe' }; // Purple
      case 'other':
        return { backgroundColor: '#f9fafb', color: '#4b5563', borderColor: '#e5e7eb' }; // Gray
      default:
        return { backgroundColor: '#f9fafb', color: '#4b5563', borderColor: '#e5e7eb' }; // Gray
    }
  };

  const getRequiredBadgeColor = () => {
    return { backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }; // Primary red
  };

  const getFileTypeIcon = (fileType: FormDocument['fileType']) => {
    switch (fileType) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'txt':
        return '📃';
      default:
        return '📄';
    }
  };

  const getFileTypeColor = (fileType: FormDocument['fileType']) => {
    switch (fileType) {
      case 'pdf':
        return { backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }; // Red
      case 'doc':
      case 'docx':
        return { backgroundColor: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' }; // Blue
      case 'txt':
        return { backgroundColor: '#f9fafb', color: '#6b7280', borderColor: '#e5e7eb' }; // Gray
      default:
        return { backgroundColor: '#f9fafb', color: '#6b7280', borderColor: '#e5e7eb' }; // Gray
    }
  };

  const filteredForms = forms.filter(form => {
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'required' && form.isRequired) ||
      form.type === activeFilter;

    const matchesSearch =
      searchTerm === '' ||
      form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.description?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleDeleteForm = (formId: string) => {
    if (confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      setForms(forms.filter(form => form.id !== formId));
    }
  };

  const handleDownload = (form: FormDocument) => {
    // Simulate download
    setForms(forms.map(f => (f.id === form.id ? { ...f, downloadCount: f.downloadCount + 1 } : f)));
    // In a real app, this would trigger the actual download
    console.log(`Downloading ${form.name}`);
  };

  const handleShare = (form: FormDocument) => {
    // Simulate sharing (copy link to clipboard)
    const shareUrl = `${window.location.origin}/forms/view/${form.id}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Share link copied to clipboard!');
  };

  return (
    <div className='space-y-6'>
      {/* Search and Filters */}
      <div className='flex flex-col sm:flex-row gap-4 justify-between'>
        <div className='flex-1 max-w-md'>
          <input
            type='text'
            placeholder='Search forms...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-full px-4 py-2 border border-border rounded-lg bg-surface text-primary-text focus:outline-none focus:ring-2 focus:ring-primary/20'
          />
        </div>

        <div className='flex gap-2 flex-wrap'>
          {(
            ['all', 'required', 'waiver', 'agreement', 'medical', 'emergency', 'policy'] as const
          ).map(filter => {
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  activeFilter === filter
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface text-secondary-text hover:bg-accent border-border hover:border-primary/30'
                }`}
              >
                {filter === 'all'
                  ? 'All Forms'
                  : filter === 'required'
                    ? 'Required'
                    : filter.charAt(0).toUpperCase() + filter.slice(1)}
                {filter !== 'all' && (
                  <span className='ml-2 px-1.5 py-0.5 bg-white/20 rounded-full text-xs font-semibold'>
                    {filter === 'required'
                      ? forms.filter(f => f.isRequired).length
                      : forms.filter(f => f.type === filter).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <Button onClick={() => setShowUploader(true)} className='flex items-center gap-2'>
          <CloudArrowUpIcon className='h-4 w-4' />
          Upload Form
        </Button>
      </div>

      {/* Forms List */}
      <div className='space-y-4'>
        {filteredForms.map(form => (
          <Card key={form.id} className='p-6 hover:shadow-md transition-shadow'>
            <div className='flex items-center justify-between'>
              {/* Form Info */}
              <div className='flex items-center gap-4 flex-1'>
                <div className='text-2xl'>{getFileTypeIcon(form.fileType)}</div>

                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-3 mb-2'>
                    <h3 className='font-semibold text-primary-text truncate'>{form.name}</h3>
                    {form.isRequired ? <Badge
                        className='text-xs px-2.5 py-0.5 font-medium border animate-pulse'
                        style={getRequiredBadgeColor()}
                      >
                        REQUIRED
                      </Badge> : null}
                  </div>

                  <div className='flex items-center gap-3 text-sm'>
                    <Badge
                      className='text-xs px-2.5 py-0.5 font-medium border'
                      style={getTypeColor(form.type)}
                    >
                      {form.type.toUpperCase()}
                    </Badge>
                    <Badge
                      className='text-xs px-2.5 py-0.5 font-medium border'
                      style={getFileTypeColor(form.fileType)}
                    >
                      {form.fileType.toUpperCase()}
                    </Badge>
                    <span className='text-secondary-text font-medium'>{form.fileSize}</span>
                    <span className='text-secondary-text'>•</span>
                    <span className='text-secondary-text'>Uploaded {form.uploadedDate}</span>
                    <span className='text-secondary-text'>•</span>
                    <span className='text-secondary-text'>by {form.uploadedBy}</span>
                    <span className='text-secondary-text'>•</span>
                    <span className='text-secondary-text font-medium'>
                      {form.downloadCount} downloads
                    </span>
                  </div>

                  {form.description ? <p className='text-sm text-secondary-text mt-1 truncate'>{form.description}</p> : null}
                </div>
              </div>

              {/* Actions */}
              <div className='flex items-center gap-2 ml-4'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleDownload(form)}
                  className='flex items-center gap-1'
                  title='Download'
                >
                  <ArrowDownTrayIcon className='h-4 w-4' />
                </Button>

                <Button
                  variant='ghost'
                  size='sm'
                  className='flex items-center gap-1'
                  title='Preview'
                >
                  <EyeIcon className='h-4 w-4' />
                </Button>

                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleShare(form)}
                  className='flex items-center gap-1'
                  title='Share'
                >
                  <ShareIcon className='h-4 w-4' />
                </Button>

                <Button variant='ghost' size='sm' className='flex items-center gap-1' title='Print'>
                  <PrinterIcon className='h-4 w-4' />
                </Button>

                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleDeleteForm(form.id)}
                  className='flex items-center gap-1 text-danger hover:text-danger'
                  title='Delete'
                >
                  <TrashIcon className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredForms.length === 0 && (
        <div className='text-center py-12'>
          <DocumentTextIcon className='h-12 w-12 text-secondary-text mx-auto mb-4' />
          <h3 className='text-lg font-medium text-primary-text mb-2'>
            {searchTerm ? 'No forms match your search' : 'No forms found'}
          </h3>
          <p className='text-secondary-text mb-6'>
            {searchTerm
              ? `No forms found matching "${searchTerm}". Try adjusting your search or filters.`
              : activeFilter === 'all'
                ? 'Upload your first form to get started with document management.'
                : `No ${activeFilter} forms found. Try switching to a different filter.`}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowUploader(true)} className='flex items-center gap-2'>
              <CloudArrowUpIcon className='h-4 w-4' />
              Upload Your First Form
            </Button>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUploader ? <FormUploader
          onUpload={uploadedForm => {
            const newForm: FormDocument = {
              id: Date.now().toString(),
              name: uploadedForm.name,
              type: uploadedForm.type,
              fileType: uploadedForm.file.name.split('.').pop() as FormDocument['fileType'],
              fileSize: `${(uploadedForm.file.size / 1024).toFixed(0)  } KB`,
              uploadedDate: new Date().toISOString().split('T')[0],
              uploadedBy: 'Current User', // In real app, get from auth
              downloadCount: 0,
              isRequired: uploadedForm.isRequired || false,
              description: uploadedForm.description,
            };
            setForms([...forms, newForm]);
            setShowUploader(false);
          }}
          onClose={() => setShowUploader(false)}
        /> : null}
    </div>
  );
}
