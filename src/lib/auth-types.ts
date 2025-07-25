export interface AuthUser {
  id: string;
  email: string;
  gym_id: string | null;
  role: UserRole;
  full_name: string | null;
  workos_user_id: string | null;
  workos_organization_id: string | null;
  auth_provider: string;
  last_login_at: string | null;
  permissions?: string[];
  organization_membership_id?: string | null;
}

export type UserRole = 'owner' | 'admin' | 'manager' | 'trainer' | 'member';

export interface Session {
  id: string;
  profile_id: string;
  token: string;
  expires_at: string;
  created_at: string;
  last_activity_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

export interface WorkOSProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  idp_id: string;
  connection_id: string;
  connection_type: string;
  organization_id?: string;
  raw_attributes: Record<string, any>;
}

export interface AuthResponse {
  user?: AuthUser;
  error?: string;
  success: boolean;
}