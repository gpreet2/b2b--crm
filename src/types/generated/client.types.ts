export interface ClientQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ClientQueryFilters {
  status?: string;
  membershipType?: string;
}

export interface ClientDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  membershipType: string;
  membershipStartDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  membershipType: string;
  membershipStartDate: Date;
}