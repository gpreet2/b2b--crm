/**
 * Custom hook for managing client data from API
 */

import { useState, useEffect, useCallback } from 'react';
import type { 
  ClientListResponse, 
  ClientDTO, 
  ClientQueryParams 
} from '@/types/generated/client.types';

interface UseClientsOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  autoFetch?: boolean;
}

interface UseClientsReturn {
  clients: ClientDTO[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null;
  refetch: () => Promise<void>;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  setStatus: (status: string) => void;
  setSort: (sort: string, order?: 'asc' | 'desc') => void;
}

export function useClients(options: UseClientsOptions = {}): UseClientsReturn {
  const {
    page = 1,
    limit = 20,
    search = '',
    status = '',
    sort = 'name',
    order = 'asc',
    autoFetch = true
  } = options;

  const [clients, setClients] = useState<ClientDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseClientsReturn['pagination']>(null);

  // State for query parameters
  const [currentPage, setCurrentPage] = useState(page);
  const [currentSearch, setCurrentSearch] = useState(search);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentSort, setCurrentSort] = useState(sort);
  const [currentOrder, setCurrentOrder] = useState<'asc' | 'desc'>(order);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', limit.toString());
      
      if (currentSearch.trim()) {
        params.set('search', currentSearch.trim());
      }
      
      if (currentStatus) {
        params.set('status', currentStatus);
      }
      
      params.set('sort', currentSort);
      params.set('order', currentOrder);

      const response = await fetch(`/api/clients?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch clients');
      }

      const clientResponse: ClientListResponse = data.data;
      setClients(clientResponse.clients);
      setPagination(clientResponse.pagination);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, currentSearch, currentStatus, currentSort, currentOrder]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchClients();
    }
  }, [fetchClients, autoFetch]);

  // Helper functions to update query parameters
  const setPage = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const setSearch = useCallback((newSearch: string) => {
    setCurrentSearch(newSearch);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const setStatus = useCallback((newStatus: string) => {
    setCurrentStatus(newStatus);
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  const setSort = useCallback((newSort: string, newOrder: 'asc' | 'desc' = 'asc') => {
    setCurrentSort(newSort);
    setCurrentOrder(newOrder);
    setCurrentPage(1); // Reset to first page when sorting
  }, []);

  return {
    clients,
    loading,
    error,
    pagination,
    refetch: fetchClients,
    setPage,
    setSearch,
    setStatus,
    setSort
  };
}

/**
 * Hook for fetching a single client by ID
 */
export function useClient(clientId: string | null) {
  const [client, setClient] = useState<ClientDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClient = useCallback(async () => {
    if (!clientId) {
      setClient(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch client');
      }

      setClient(data.data);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching client:', err);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  return {
    client,
    loading,
    error,
    refetch: fetchClient
  };
}