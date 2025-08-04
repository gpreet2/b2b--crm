'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function TestMultipleAccountsPage() {
  const router = useRouter();

  return (
    <div className='min-h-screen bg-gradient-to-br from-surface via-surface-light to-accent flex items-center justify-center p-8'>
      <Card className='max-w-2xl w-full p-8'>
        <h1 className='text-2xl font-bold text-primary-text mb-4'>
          Testing Multiple Accounts Locally
        </h1>

        <div className='space-y-4 text-secondary-text'>
          <p>
            WorkOS maintains session cookies on their domain (api.workos.com) that persist across
            local signouts. This can make testing multiple accounts challenging during development.
          </p>

          <div className='bg-warning/10 border border-warning/20 rounded-lg p-4'>
            <p className='font-semibold text-warning mb-2'>⚠️ Known Issue:</p>
            <p className='text-sm'>
              After creating an account, WorkOS will auto-authenticate you with that account even
              when trying to create a new one.
            </p>
          </div>

          <div className='space-y-3'>
            <h2 className='text-lg font-semibold text-primary-text'>Workarounds:</h2>

            <div className='space-y-2'>
              <div className='flex items-start space-x-2'>
                <span className='text-primary font-bold'>1.</span>
                <div>
                  <p className='font-medium'>Use Incognito/Private Mode</p>
                  <p className='text-sm text-muted'>
                    Open a new incognito window for each test account
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-2'>
                <span className='text-primary font-bold'>2.</span>
                <div>
                  <p className='font-medium'>Clear Browser Data</p>
                  <p className='text-sm text-muted'>
                    Clear cookies for api.workos.com domain:
                    <br />• Chrome: Settings → Privacy → Cookies → See all cookies → Search "workos"
                    <br />• Firefox: Settings → Privacy → Cookies → Manage Data → Search "workos"
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-2'>
                <span className='text-primary font-bold'>3.</span>
                <div>
                  <p className='font-medium'>Use Different Browsers</p>
                  <p className='text-sm text-muted'>
                    Test each account in a different browser (Chrome, Firefox, Safari, etc.)
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-2'>
                <span className='text-primary font-bold'>4.</span>
                <div>
                  <p className='font-medium'>Delete User in WorkOS Dashboard</p>
                  <p className='text-sm text-muted'>
                    Go to WorkOS Dashboard → Users → Delete the test user before creating a new one
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-primary/5 border border-primary/10 rounded-lg p-4 mt-6'>
            <p className='text-sm'>
              <strong>Note:</strong> This is only an issue during local development. In production,
              users won't typically need to create multiple accounts with different emails on the
              same device.
            </p>
          </div>
        </div>

        <div className='flex space-x-4 mt-8'>
          <Button onClick={() => router.push('/create-account')} variant='primary'>
            Try Create Account Flow
          </Button>
          <Button onClick={() => router.push('/auth')} variant='outline'>
            Back to Auth
          </Button>
        </div>
      </Card>
    </div>
  );
}
