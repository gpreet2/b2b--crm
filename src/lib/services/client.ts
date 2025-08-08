/**
 * Client Service
 * 
 * Handles business logic for client management operations.
 * Ensures proper organization-level data isolation and security.
 */

import { getDatabase } from '@/config/database';
import { logger } from '@/utils/logger';
import type { 
  ClientDTO, 
  ClientListResponse, 
  ClientQueryFilters, 
  RawClientData 
} from '@/types/generated/client.types';

export class ClientService {
  private db = getDatabase();

  /**
   * Get clients for a specific organization with filters, search, and pagination
   */
  async getClients(filters: ClientQueryFilters): Promise<ClientListResponse> {
    try {
      logger.info('Fetching clients with filters', { filters });

      // Validate and sanitize filters
      const sanitizedFilters = this.sanitizeFilters(filters);

      const query = this.buildClientQuery(sanitizedFilters);
      const countQuery = this.buildClientCountQuery(sanitizedFilters);

      // Execute both queries in parallel
      const [{ data: clients, error: clientError }, { data: countData, error: countError }] = 
        await Promise.all([
          query,
          countQuery
        ]);

      if (clientError) {
        logger.error('Error fetching clients', { error: clientError });
        throw new Error(`Failed to fetch clients: ${clientError.message}`);
      }

      if (countError) {
        logger.error('Error counting clients', { error: countError });
        throw new Error(`Failed to count clients: ${countError.message}`);
      }

      const total = countData?.[0]?.total || 0;
      const totalPages = Math.ceil(total / sanitizedFilters.limit);
      const currentPage = Math.floor(sanitizedFilters.offset / sanitizedFilters.limit) + 1;

      // Transform raw data to DTO format
      let clientDTOs: ClientDTO[] = (clients || []).map(this.transformToClientDTO);

      // Apply in-memory search filtering if needed
      if (sanitizedFilters.search) {
        const searchTerm = sanitizedFilters.search.toLowerCase();
        clientDTOs = clientDTOs.filter(client => 
          client.first_name?.toLowerCase().includes(searchTerm) ||
          client.last_name?.toLowerCase().includes(searchTerm) ||
          client.email.toLowerCase().includes(searchTerm)
        );
      }

      // Apply in-memory sorting for user-related fields
      if (sanitizedFilters.sort === 'name') {
        clientDTOs.sort((a, b) => {
          const nameA = `${a.first_name || ''} ${a.last_name || ''}`.trim().toLowerCase();
          const nameB = `${b.first_name || ''} ${b.last_name || ''}`.trim().toLowerCase();
          return sanitizedFilters.order === 'asc' 
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA);
        });
      } else if (sanitizedFilters.sort === 'email') {
        clientDTOs.sort((a, b) => {
          return sanitizedFilters.order === 'asc'
            ? a.email.localeCompare(b.email)
            : b.email.localeCompare(a.email);
        });
      }

      const response: ClientListResponse = {
        clients: clientDTOs,
        pagination: {
          page: currentPage,
          limit: sanitizedFilters.limit,
          total,
          totalPages,
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1
        }
      };

      logger.info('Successfully fetched clients', { 
        count: clientDTOs.length, 
        total, 
        page: currentPage 
      });

      return response;

    } catch (error) {
      logger.error('ClientService.getClients failed', { error, filters });
      throw error;
    }
  }

  /**
   * Sanitize and validate filter parameters
   */
  private sanitizeFilters(filters: ClientQueryFilters): ClientQueryFilters {
    return {
      organizationId: filters.organizationId,
      search: filters.search,
      status: filters.status,
      limit: Math.max(1, Math.min(100, filters.limit)), // Ensure positive, max 100
      offset: Math.max(0, filters.offset), // Ensure non-negative
      sort: filters.sort,
      order: filters.order
    };
  }

  /**
   * Build the main client query with joins and filters
   */
  private buildClientQuery(filters: ClientQueryFilters) {
    let query = this.db
      .getSupabaseClient()
      .from('clients')
      .select(`
        id,
        user_id,
        date_of_birth,
        gender,
        emergency_contact_name,
        emergency_contact_phone,
        medical_conditions,
        preferences,
        created_at,
        updated_at,
        users!inner(
          first_name,
          last_name,
          email,
          user_type
        ),
        client_organizations!inner(
          membership_status,
          joined_at,
          last_visit_at,
          visit_count,
          notes,
          organization_id
        )
      `)
      .eq('client_organizations.organization_id', filters.organizationId);

    // Apply search filter - use simplified approach
    if (filters.search) {
      // We'll filter search results in memory for now since cross-table search is complex
      // In a real implementation, we'd use a more sophisticated search approach
    }

    // Apply status filter
    if (filters.status) {
      query = query.eq('client_organizations.membership_status', filters.status);
    }

    // Apply sorting - use only client table fields for database sorting
    // Related table sorting will be done in memory
    if (['name', 'email', 'status', 'joined', 'last_visit'].includes(filters.sort)) {
      // Sort by created_at for now, we'll sort properly in memory
      query = query.order('created_at', { ascending: filters.order === 'asc' });
    } else {
      query = query.order('created_at', { ascending: filters.order === 'asc' });
    }

    // Apply pagination
    query = query.range(filters.offset, filters.offset + filters.limit - 1);

    return query;
  }

  /**
   * Build the count query for pagination
   */
  private buildClientCountQuery(filters: ClientQueryFilters) {
    let query = this.db
      .getSupabaseClient()
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('client_organizations.organization_id', filters.organizationId);

    // Apply same filters as main query (except pagination)
    if (filters.search) {
      query = query.or(
        `users.first_name.ilike.%${filters.search}%,users.last_name.ilike.%${filters.search}%,users.email.ilike.%${filters.search}%`
      );
    }

    if (filters.status) {
      query = query.eq('client_organizations.membership_status', filters.status);
    }

    return this.db
      .getSupabaseClient()
      .rpc('count_clients_for_organization', {
        org_id: filters.organizationId,
        search_term: filters.search || null,
        status_filter: filters.status || null
      });
  }

  /**
   * Map API sort parameters to database columns (simplified for direct table fields)
   */
  private mapSortFieldSimple(sort: string): string {
    const sortMap: Record<string, string> = {
      'status': 'membership_status',
      'joined': 'joined_at',
      'last_visit': 'last_visit_at',
      'created': 'created_at'
    };

    return sortMap[sort] || 'created_at';
  }

  /**
   * Map API sort parameters to database columns (full table.column format)
   */
  private mapSortField(sort: string): string {
    const sortMap: Record<string, string> = {
      'name': 'users.first_name',
      'email': 'users.email',
      'status': 'client_organizations.membership_status',
      'joined': 'client_organizations.joined_at',
      'last_visit': 'client_organizations.last_visit_at',
      'created': 'created_at'
    };

    return sortMap[sort] || 'users.first_name';
  }

  /**
   * Transform raw database result to ClientDTO
   */
  private transformToClientDTO(raw: any): ClientDTO {
    // Handle different structures depending on how Supabase returns the data
    const userData = Array.isArray(raw.users) ? raw.users[0] : raw.users || {};
    const orgData = Array.isArray(raw.client_organizations) ? raw.client_organizations[0] : raw.client_organizations || {};

    return {
      id: raw.id,
      user_id: raw.user_id,
      // User information
      first_name: userData.first_name || null,
      last_name: userData.last_name || null,
      email: userData.email || '',
      user_type: userData.user_type || '',
      // Client-specific information
      date_of_birth: raw.date_of_birth,
      gender: raw.gender,
      emergency_contact_name: raw.emergency_contact_name,
      emergency_contact_phone: raw.emergency_contact_phone,
      medical_conditions: raw.medical_conditions,
      preferences: raw.preferences,
      // Organization-specific information
      membership_status: orgData.membership_status || null,
      joined_at: orgData.joined_at || null,
      last_visit_at: orgData.last_visit_at || null,
      visit_count: orgData.visit_count || null,
      notes: orgData.notes || null,
      // Timestamps
      created_at: raw.created_at,
      updated_at: raw.updated_at
    };
  }

  /**
   * Get a single client by ID (with organization check)
   */
  async getClientById(clientId: string, organizationId: string): Promise<ClientDTO | null> {
    try {
      logger.info('Fetching client by ID', { clientId, organizationId });

      const { data: client, error } = await this.db
        .getSupabaseClient()
        .from('clients')
        .select(`
          id,
          user_id,
          date_of_birth,
          gender,
          emergency_contact_name,
          emergency_contact_phone,
          medical_conditions,
          preferences,
          created_at,
          updated_at,
          users!inner(
            first_name,
            last_name,
            email,
            user_type
          ),
          client_organizations!inner(
            membership_status,
            joined_at,
            last_visit_at,
            visit_count,
            notes,
            organization_id
          )
        `)
        .eq('id', clientId)
        .eq('client_organizations.organization_id', organizationId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          logger.info('Client not found', { clientId, organizationId });
          return null;
        }
        logger.error('Error fetching client by ID', { error, clientId });
        throw new Error(`Failed to fetch client: ${error.message}`);
      }

      return this.transformToClientDTO(client);

    } catch (error) {
      logger.error('ClientService.getClientById failed', { error, clientId, organizationId });
      throw error;
    }
  }
}