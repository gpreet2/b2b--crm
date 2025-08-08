/**
 * Client Management Types
 * Generated types for client-related API responses and requests
 */

export interface ClientDTO {
  id: string;
  user_id: string;
  // User information from the users table
  first_name: string | null;
  last_name: string | null;
  email: string;
  user_type: string;
  // Client-specific information
  date_of_birth: string | null;
  gender: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  medical_conditions: string | null;
  preferences: Record<string, any> | null;
  // Organization-specific information
  membership_status: string | null;
  joined_at: string | null;
  last_visit_at: string | null;
  visit_count: number | null;
  notes: string | null;
  // Timestamps
  created_at: string | null;
  updated_at: string | null;
}

export interface ClientListResponse {
  clients: ClientDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ClientQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Internal types for database queries
export interface ClientQueryFilters {
  organizationId: string;
  search?: string;
  status?: string;
  limit: number;
  offset: number;
  sort: string;
  order: 'asc' | 'desc';
}

export interface RawClientData {
  id: string;
  user_id: string;
  date_of_birth: string | null;
  gender: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  medical_conditions: string | null;
  preferences: any | null;
  created_at: string | null;
  updated_at: string | null;
  // User fields (joined)
  first_name: string | null;
  last_name: string | null;
  email: string;
  user_type: string;
  // Client organization fields (joined)
  membership_status: string | null;
  joined_at: string | null;
  last_visit_at: string | null;
  visit_count: number | null;
  notes: string | null;
}