/**
 * Example usage of validation middleware and generated types
 */

import express from 'express';
import { validate } from '../middleware/validation';
import { createUserSchema, updateUserSchema } from '../validation/schemas/user.schema';
import { CreateUser, UpdateUser } from '../types/generated';

const app = express();

/**
 * Example 1: Using validation middleware with generated types
 */
app.post('/api/users',
  validate({ body: createUserSchema }),
  async (req, res) => {
    // TypeScript now knows the exact shape of validated data
    const userData: CreateUser = req.validated!.body;
    
    // All properties are typed correctly
    console.log(userData.email); // string
    console.log(userData.role); // 'admin' | 'manager' | 'trainer' | 'member'
    console.log(userData.organization_ids); // string[]
    
    res.json({ success: true });
  }
);

/**
 * Example 2: Using types in service functions
 */
class UserService {
  async createUser(data: CreateUser) {
    // Type-safe user creation
    const { email, phone, role, profile, organization_ids } = data;
    
    // All fields are properly typed
    if (profile.date_of_birth) {
      const age = this.calculateAge(new Date(profile.date_of_birth));
    }
    
    // ... create user in database
  }
  
  async updateUser(id: string, data: UpdateUser) {
    // Type-safe partial updates
    // UpdateUser type knows all fields are optional
    if (data.profile?.emergency_contact) {
      // Nested properties are also typed
      console.log(data.profile.emergency_contact.name);
    }
    
    // ... update user in database
  }
  
  private calculateAge(birthDate: Date): number {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age;
  }
}

/**
 * Example 3: Using validation with query parameters
 */
import { userFilterSchema } from '../validation/schemas/user.schema';

app.get('/api/users',
  validate({ query: userFilterSchema }),
  async (req, res) => {
    // Query parameters are validated and typed
    const filters = req.validated!.query;
    
    // Pagination is typed from commonSchemas
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    
    // Status filter is typed as UserStatus[]
    if (filters.status) {
      console.log(`Filtering by status: ${filters.status.join(', ')}`);
    }
    
    res.json({ users: [] });
  }
);

/**
 * Example 4: Type guards and runtime validation
 */
import { z } from 'zod';

function isValidUser(data: unknown): data is CreateUser {
  return createUserSchema.safeParse(data).success;
}

// Usage
const untrustedData = { /* some data from external source */ };

if (isValidUser(untrustedData)) {
  // TypeScript knows this is a valid CreateUser
  console.log(untrustedData.email);
}