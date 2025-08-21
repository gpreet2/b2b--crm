'use server';

import { signOut, withAuth, refreshSession } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';

export async function logoutAction() {
  await signOut();
  redirect('/');
}

export async function getUserAction() {
  try {
    const session = await withAuth();
    return {
      user: session.user,
      organizationId: session.organizationId,
      role: session.role,
      permissions: session.permissions,
      entitlements: session.entitlements,
      featureFlags: session.featureFlags,
      sessionId: session.sessionId,
      impersonator: session.impersonator,
    };
  } catch (error) {
    console.error('getUserAction error:', error);
    return null;
  }
}

export async function refreshSessionAction() {
  try {
    return await refreshSession();
  } catch (error) {
    console.error('refreshSessionAction error:', error);
    return null;
  }
}

export async function switchOrganizationAction(organizationId: string) {
  try {
    return await refreshSession({ organizationId });
  } catch (error) {
    console.error('switchOrganizationAction error:', error);
    return null;
  }
}