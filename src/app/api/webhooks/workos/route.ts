import { NextRequest, NextResponse } from 'next/server';
import { workos } from '@/lib/workos-client';
import { createClient } from '@/utils/supabase/server';
import { logger } from '@/lib/logger';

// WorkOS webhook event types we handle
const HANDLED_EVENTS = [
  'user.created',
  'user.updated',
  'user.deleted',
  'organization.created',
  'organization.updated',
  'organization.deleted',
  'organization_membership.created',
  'organization_membership.updated',
  'organization_membership.deleted',
  'invitation.created',
  'invitation.accepted',
  'invitation.expired',
  'invitation.revoked',
] as const;

export async function POST(request: NextRequest) {
  try {
    // Get the webhook signature from headers
    const signature = request.headers.get('workos-signature');
    
    if (!signature) {
      logger.warn('WorkOS webhook missing signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }
    
    // Get the raw body
    const rawBody = await request.text();
    
    // Verify the webhook signature
    const webhookSecret = process.env.WORKOS_WEBHOOK_SECRET;
    if (!webhookSecret) {
      logger.error('WorkOS webhook secret not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }
    
    let event: any;
    try {
      // WorkOS SDK should provide webhook verification
      // For now, parse the JSON (in production, use proper signature verification)
      event = JSON.parse(rawBody);
      
      // TODO: Implement proper signature verification
      // const isValid = workos.webhooks.verifySignature({
      //   body: rawBody,
      //   signature,
      //   secret: webhookSecret,
      // });
      
    } catch (error) {
      logger.error('Invalid webhook payload', { error });
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      );
    }
    
    // Log the webhook event
    logger.info(`WorkOS webhook received: ${event.event}`, {
      method: 'WEBHOOK',
      path: '/api/webhooks/workos',
      metadata: {
        eventId: event.id,
        eventType: event.event,
      },
    });
    
    // Handle the event
    if (HANDLED_EVENTS.includes(event.event)) {
      await handleWebhookEvent(event);
    } else {
      logger.debug(`Unhandled WorkOS event type: ${event.event}`);
    }
    
    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
    
  } catch (error) {
    logger.error('WorkOS webhook error', {
      method: 'WEBHOOK',
      path: '/api/webhooks/workos',
      error,
    });
    
    // Return 200 to prevent retries for processing errors
    return NextResponse.json({ received: true });
  }
}

async function handleWebhookEvent(event: any) {
  const supabase = await createClient();
  
  switch (event.event) {
    case 'user.created':
    case 'user.updated':
      // Sync user data
      const userData = event.data;
      await supabase
        .from('profiles')
        .update({
          email: userData.email,
          full_name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('workos_user_id', userData.id);
      break;
      
    case 'user.deleted':
      // Mark user as inactive
      await supabase
        .from('profiles')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('workos_user_id', event.data.id);
      break;
      
    case 'organization.created':
    case 'organization.updated':
      // Sync organization data
      const orgData = event.data;
      await supabase
        .from('gyms')
        .update({
          name: orgData.name,
          updated_at: new Date().toISOString(),
        })
        .eq('workos_organization_id', orgData.id);
      break;
      
    case 'organization.deleted':
      // Handle organization deletion
      // This is a critical event - might want to notify admins
      logger.warn('Organization deleted', {
        method: 'WEBHOOK',
        path: '/api/webhooks/workos',
        metadata: {
          organizationId: event.data.id,
        },
      });
      break;
      
    case 'organization_membership.created':
    case 'organization_membership.updated':
      // Update user's organization membership
      const membership = event.data;
      await supabase
        .from('profiles')
        .update({
          role: membership.role?.slug || 'member',
          updated_at: new Date().toISOString(),
        })
        .eq('workos_user_id', membership.user_id);
      break;
      
    case 'organization_membership.deleted':
      // Handle membership removal
      // Might want to update user's access or notify them
      logger.info('Organization membership removed', {
        method: 'WEBHOOK',
        path: '/api/webhooks/workos',
        metadata: {
          userId: event.data.user_id,
          organizationId: event.data.organization_id,
        },
      });
      break;
      
    case 'invitation.accepted':
      // Mark invitation as accepted (backup in case callback missed it)
      const acceptedInvite = event.data;
      await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('workos_invitation_id', acceptedInvite.id);
      break;
      
    case 'invitation.expired':
    case 'invitation.revoked':
      // Update invitation status
      const expiredInvite = event.data;
      await supabase
        .from('invitations')
        .update({
          status: event.event === 'invitation.expired' ? 'expired' : 'revoked',
          updated_at: new Date().toISOString(),
        })
        .eq('workos_invitation_id', expiredInvite.id);
      break;
  }
}

// WorkOS webhooks don't use standard HTTP methods other than POST
export async function GET() {
  return NextResponse.json({ message: 'WorkOS webhook endpoint' });
}