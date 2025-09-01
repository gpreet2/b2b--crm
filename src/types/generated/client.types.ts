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
  membershipStatus: string;
  accessLevel: string;
  profileData?: {
    dateOfBirth?: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
    medicalInfo?: string;
    goals?: string;
  };
  tags?: string[];
  notes?: string;
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

export interface ClientListResponse {
  success: boolean;
  data: ClientDTO[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}