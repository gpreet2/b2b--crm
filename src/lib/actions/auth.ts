'use server';

import { signOut } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';

export async function logoutAction() {
  try {
    await signOut();
    redirect('/auth');
  } catch (error) {
    console.error('Logout failed:', error);
    redirect('/auth');
  }
}