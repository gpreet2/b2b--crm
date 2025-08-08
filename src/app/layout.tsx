import { Geist, Geist_Mono } from 'next/font/google';
import { getCurrentUser } from '@/lib/actions/get-user';

import './globals.css';
import ClientLayout from './client-layout';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Use server action approach to bypass middleware issues
  let user = undefined;
  try {
    const userResult = await getCurrentUser();
    
    if (userResult?.success && userResult.user) {
      user = {
        name: userResult.user.name,
        email: userResult.user.email,
      };
      console.log('Layout: Server action user data retrieved', { 
        name: user.name, 
        email: user.email,
        workosId: userResult.user.id
      });
    } else {
      console.log('Layout: No authenticated user found via server action');
    }
  } catch (error) {
    console.log('Layout: Server action error', error instanceof Error ? error.message : String(error));
  }

  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientLayout user={user}>{children}</ClientLayout>
      </body>
    </html>
  );
}
