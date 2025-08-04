import { Metadata } from 'next';

import { FormsManager } from '@/components/forms/FormsManager';

export const metadata: Metadata = {
  title: 'Forms - B2B Gym CRM',
  description: 'Manage waivers, agreements, and other forms for your gym',
};

export default function FormsPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-primary-text'>Forms & Documents</h1>
        <p className='text-secondary-text'>
          Upload, organize, and manage all your gym&apos;s forms and documents
        </p>
      </div>

      <FormsManager />
    </div>
  );
}
