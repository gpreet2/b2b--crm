/**
 * Swagger/OpenAPI Configuration
 * 
 * This file sets up the OpenAPI specification for the TryZore B2B CRM API
 * 
 * Features:
 * - Complete API documentation
 * - Authentication schemas  
 * - Security definitions
 * - Type-safe route documentation
 * - Example requests and responses
 */

import swaggerJSDoc from 'swagger-jsdoc';
import { NextApiRequest } from 'next';

// Base OpenAPI specification
const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'TryZore B2B CRM API',
    version: '1.0.0',
    description: `
      ## TryZore B2B CRM Backend API

      Professional gym management system with multi-tenant support for gym chains and franchises.

      ### Key Features
      - **Multi-Tenant Architecture**: Complete data isolation between organizations
      - **Enterprise SSO**: WorkOS-powered authentication with organization switching
      - **Permission-Based Security**: Role-based access control with resource permissions
      - **Real-Time Data**: Supabase integration with real-time subscriptions
      - **Mobile-Ready**: RESTful API optimized for mobile app integration
      - **Audit Trail**: Complete tracking of all data changes

      ### Security
      All endpoints require authentication via WorkOS. Each request must include valid session cookies.
      Data access is restricted by organization context - users can only access their organization's data.

      ### Rate Limiting
      API endpoints are rate-limited per user and per IP to prevent abuse.

      ### Error Handling
      All errors follow RFC 7807 Problem Details format with structured error responses.
    `,
    contact: {
      name: 'TryZore Development Team',
      email: 'dev@tryzore.com',
    },
    license: {
      name: 'Proprietary',
      url: 'https://tryzore.com/license',
    },
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production' 
        ? 'https://api.tryzore.com' 
        : 'http://localhost:3000',
      description: process.env.NODE_ENV === 'production' 
        ? 'Production server' 
        : 'Development server',
    },
    {
      url: 'https://staging-api.tryzore.com',
      description: 'Staging server',
    },
  ],
  components: {
    securitySchemes: {
      WorkOSSession: {
        type: 'apiKey',
        in: 'cookie',
        name: 'wos-session',
        description: 'WorkOS session cookie for authentication',
      },
      CurrentUserId: {
        type: 'apiKey', 
        in: 'cookie',
        name: 'current-user-id',
        description: 'Current user ID cookie for session tracking',
      },
    },
    schemas: {
      // Error schemas
      Error: {
        type: 'object',
        required: ['error'],
        properties: {
          error: {
            type: 'string',
            description: 'Error message',
            example: 'Authentication required',
          },
          details: {
            type: 'object',
            description: 'Additional error details',
          },
          code: {
            type: 'string',
            description: 'Machine-readable error code',
            example: 'AUTH_REQUIRED',
          },
        },
      },
      ValidationError: {
        type: 'object',
        required: ['error'],
        properties: {
          error: {
            type: 'string',
            example: 'Validation failed',
          },
          details: {
            type: 'object',
            properties: {
              field: {
                type: 'string',
                description: 'Field that failed validation',
                example: 'email',
              },
              message: {
                type: 'string',
                description: 'Validation error message',
                example: 'Invalid email format',
              },
            },
          },
        },
      },
      // Success response wrapper
      SuccessResponse: {
        type: 'object',
        required: ['success', 'data'],
        properties: {
          success: {
            type: 'boolean',
            example: true,
            description: 'Indicates successful operation',
          },
          data: {
            type: 'object',
            description: 'Response data payload',
          },
        },
      },
      // Pagination schema
      Pagination: {
        type: 'object',
        required: ['page', 'limit', 'total', 'totalPages'],
        properties: {
          page: {
            type: 'integer',
            minimum: 1,
            description: 'Current page number',
            example: 1,
          },
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            description: 'Items per page',
            example: 20,
          },
          total: {
            type: 'integer',
            minimum: 0,
            description: 'Total number of items',
            example: 150,
          },
          totalPages: {
            type: 'integer',
            minimum: 0,
            description: 'Total number of pages',
            example: 8,
          },
          hasNext: {
            type: 'boolean',
            description: 'Whether there are more pages',
            example: true,
          },
          hasPrev: {
            type: 'boolean',
            description: 'Whether there are previous pages',
            example: false,
          },
        },
      },
      // User schema
      User: {
        type: 'object',
        required: ['id', 'workos_user_id', 'email', 'first_name', 'last_name'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'User ID',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          workos_user_id: {
            type: 'string',
            description: 'WorkOS user identifier',
            example: 'user_01H1234567890ABCDEF',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
            example: 'user@example.com',
          },
          first_name: {
            type: 'string',
            description: 'User first name',
            example: 'John',
          },
          last_name: {
            type: 'string',
            description: 'User last name',
            example: 'Doe',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'User creation timestamp',
            example: '2023-01-01T12:00:00.000Z',
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: 'User last update timestamp',
            example: '2023-01-01T12:00:00.000Z',
          },
        },
      },
      // Client schema
      Client: {
        type: 'object',
        required: ['id', 'email', 'first_name', 'last_name'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Client ID',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Client email address',
            example: 'client@example.com',
          },
          first_name: {
            type: 'string',
            description: 'Client first name',
            example: 'Jane',
          },
          last_name: {
            type: 'string',
            description: 'Client last name',
            example: 'Smith',
          },
          phone: {
            type: 'string',
            description: 'Client phone number',
            example: '+1-555-123-4567',
            nullable: true,
          },
          date_of_birth: {
            type: 'string',
            format: 'date',
            description: 'Client date of birth',
            example: '1990-05-15',
            nullable: true,
          },
          membership_status: {
            type: 'string',
            enum: ['active', 'inactive', 'pending', 'suspended', 'expired'],
            description: 'Current membership status',
            example: 'active',
            nullable: true,
          },
          joined_date: {
            type: 'string',
            format: 'date-time',
            description: 'Date client joined',
            example: '2023-01-15T10:30:00.000Z',
            nullable: true,
          },
          last_visit: {
            type: 'string',
            format: 'date-time',
            description: 'Last visit timestamp',
            example: '2023-12-01T18:45:00.000Z',
            nullable: true,
          },
          emergency_contact_name: {
            type: 'string',
            description: 'Emergency contact name',
            example: 'John Smith',
            nullable: true,
          },
          emergency_contact_phone: {
            type: 'string',
            description: 'Emergency contact phone',
            example: '+1-555-987-6543',
            nullable: true,
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Client creation timestamp',
            example: '2023-01-01T12:00:00.000Z',
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: 'Client last update timestamp',
            example: '2023-01-01T12:00:00.000Z',
          },
        },
      },
      // Organization schema
      Organization: {
        type: 'object',
        required: ['id', 'name', 'type'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Organization ID',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          name: {
            type: 'string',
            description: 'Organization name',
            example: 'FitLife Gym Downtown',
          },
          type: {
            type: 'string',
            enum: ['franchise', 'location'],
            description: 'Organization type',
            example: 'location',
          },
          settings: {
            type: 'object',
            description: 'Organization-specific settings',
            example: {
              timezone: 'America/New_York',
              business_hours: {
                monday: { open: '06:00', close: '22:00' },
                tuesday: { open: '06:00', close: '22:00' },
              },
            },
          },
          parent_id: {
            type: 'string',
            format: 'uuid',
            description: 'Parent organization ID (for franchise hierarchies)',
            example: '987fcdeb-51d2-12d3-a456-426614174000',
            nullable: true,
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Organization creation timestamp',
            example: '2023-01-01T12:00:00.000Z',
          },
          updated_at: {
            type: 'string',
            format: 'date-time', 
            description: 'Organization last update timestamp',
            example: '2023-01-01T12:00:00.000Z',
          },
        },
      },
    },
    parameters: {
      // Common query parameters
      PageParam: {
        name: 'page',
        in: 'query',
        description: 'Page number for pagination',
        required: false,
        schema: {
          type: 'integer',
          minimum: 1,
          default: 1,
          example: 1,
        },
      },
      LimitParam: {
        name: 'limit',
        in: 'query',
        description: 'Number of items per page',
        required: false,
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 20,
          example: 20,
        },
      },
      SearchParam: {
        name: 'search',
        in: 'query',
        description: 'Search term (minimum 2 characters)',
        required: false,
        schema: {
          type: 'string',
          minLength: 2,
          example: 'john',
        },
      },
      SortParam: {
        name: 'sort',
        in: 'query',
        description: 'Field to sort by',
        required: false,
        schema: {
          type: 'string',
          example: 'name',
        },
      },
      OrderParam: {
        name: 'order',
        in: 'query',
        description: 'Sort order',
        required: false,
        schema: {
          type: 'string',
          enum: ['asc', 'desc'],
          default: 'asc',
          example: 'asc',
        },
      },
    },
    responses: {
      // Common error responses
      400: {
        description: 'Bad Request - Invalid input parameters',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ValidationError',
            },
          },
        },
      },
      401: {
        description: 'Unauthorized - Authentication required',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              error: 'Authentication required',
            },
          },
        },
      },
      403: {
        description: 'Forbidden - Insufficient permissions',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              error: 'No active organization. Please select an organization first.',
            },
          },
        },
      },
      404: {
        description: 'Not Found - Resource does not exist',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              error: 'Resource not found',
            },
          },
        },
      },
      405: {
        description: 'Method Not Allowed',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              error: 'Method not allowed. Use GET to retrieve clients.',
            },
          },
        },
      },
      429: {
        description: 'Too Many Requests - Rate limit exceeded',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              error: 'Rate limit exceeded',
            },
          },
        },
      },
      500: {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              error: 'Internal server error occurred',
            },
          },
        },
      },
    },
  },
  // Global security requirement
  security: [
    {
      WorkOSSession: [],
      CurrentUserId: [],
    },
  ],
};

// Swagger JSDoc options
const swaggerOptions: swaggerJSDoc.Options = {
  definition: swaggerDefinition,
  apis: [
    './src/app/api/**/*.ts', // Path to the API files with JSDoc comments
    './src/config/swagger.ts', // This file for additional documentation
  ],
};

// Generate swagger specification
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Helper function to get base URL for requests
export function getApiBaseUrl(req?: NextApiRequest): string {
  if (process.env.NODE_ENV === 'production') {
    return 'https://api.tryzore.com';
  }
  
  if (req?.headers.host) {
    return `http://${req.headers.host}`;
  }
  
  return 'http://localhost:3000';
}

/**
 * Authentication Flow Documentation
 * 
 * @swagger
 * /api/auth/signin:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Generate WorkOS sign-in URL
 *     description: |
 *       Generate a WorkOS AuthKit sign-in URL for enterprise SSO authentication.
 *       
 *       **Flow**:
 *       1. Frontend calls this endpoint with optional email hint
 *       2. Backend generates WorkOS sign-in URL
 *       3. Frontend redirects user to WorkOS URL
 *       4. User authenticates via their organization's SSO provider
 *       5. WorkOS redirects to `/api/auth/callback` with authentication data
 *       6. Backend validates auth and creates/updates user record
 *       7. User is redirected to dashboard with session cookies
 *       
 *       **Security**: No authentication required for this endpoint.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Optional email hint to pre-fill WorkOS login form
 *                 example: user@company.com
 *           examples:
 *             with_email_hint:
 *               summary: Sign-in request with email hint
 *               value:
 *                 email: "manager@fitnessgym.com"
 *             without_email:
 *               summary: Sign-in request without email hint
 *               value: {}
 *     responses:
 *       200:
 *         description: WorkOS sign-in URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [url]
 *               properties:
 *                 url:
 *                   type: string
 *                   format: uri
 *                   description: WorkOS AuthKit sign-in URL
 *                   example: "https://auth.workos.com/sso/authorize?client_id=client_123&redirect_uri=..."
 *             examples:
 *               success_response:
 *                 summary: Successful sign-in URL generation
 *                 value:
 *                   url: "https://auth.workos.com/sso/authorize?client_id=client_123&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback&response_type=code&state=..."
 *       500:
 *         description: Failed to generate sign-in URL
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Failed to generate sign-in URL"
 *     security: []
 * 
 * /api/auth/callback:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: WorkOS authentication callback
 *     description: |
 *       WorkOS authentication callback endpoint. This is called by WorkOS after successful authentication.
 *       
 *       **Process**:
 *       1. Receives authorization code from WorkOS
 *       2. Exchanges code for user information and tokens
 *       3. Creates or updates user record in database
 *       4. Handles WorkOS user ID changes for existing users
 *       5. Sets secure httpOnly session cookies
 *       6. Redirects to dashboard
 *       
 *       **Security**: This endpoint is called by WorkOS, not directly by clients.
 *       
 *       **Error Handling**: Authentication failures redirect to home page with error parameter.
 *     parameters:
 *       - name: code
 *         in: query
 *         description: WorkOS authorization code
 *         required: true
 *         schema:
 *           type: string
 *       - name: state
 *         in: query
 *         description: CSRF protection state parameter
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirect to dashboard on success or home page on error
 *         headers:
 *           Location:
 *             description: Redirect URL
 *             schema:
 *               type: string
 *               example: "/dashboard"
 *           Set-Cookie:
 *             description: Session cookies (wos-session, current-user-id)
 *             schema:
 *               type: string
 *               example: "wos-session=encrypted_session_data; HttpOnly; Secure; SameSite=Lax"
 *     security: []
 * 
 * /api/auth/signout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Sign out user
 *     description: |
 *       Sign out the authenticated user and clear session cookies.
 *       
 *       **Process**:
 *       1. Clears WorkOS session cookies
 *       2. Clears current-user-id cookie
 *       3. Optionally revokes tokens on WorkOS side
 *       4. Redirects to sign-in page
 *       
 *       **Security**: Requires valid session cookies.
 *     responses:
 *       302:
 *         description: Redirect to sign-in page
 *         headers:
 *           Location:
 *             description: Sign-in page URL
 *             schema:
 *               type: string
 *               example: "/"
 *           Set-Cookie:
 *             description: Cleared session cookies
 *             schema:
 *               type: string
 *               example: "wos-session=; Max-Age=0; Path=/"
 *     security:
 *       - WorkOSSession: []
 *         CurrentUserId: []
 * 
 * /api/auth/switch-organization:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Switch active organization context
 *     description: |
 *       Switch the authenticated user's active organization context.
 *       
 *       **Process**:
 *       1. Validates user has access to target organization
 *       2. Updates session context with new organization
 *       3. Returns new session information
 *       
 *       **Security**: User must have existing membership in target organization.
 *       
 *       **Multi-Tenancy**: This enables users to work with multiple gym locations
 *       or franchise organizations within the same session.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [organizationId]
 *             properties:
 *               organizationId:
 *                 type: string
 *                 format: uuid
 *                 description: Target organization ID to switch to
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *           examples:
 *             switch_org:
 *               summary: Switch to different organization
 *               value:
 *                 organizationId: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Successfully switched organization
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         organizationId:
 *                           type: string
 *                           format: uuid
 *                         organizationName:
 *                           type: string
 *                         role:
 *                           type: string
 *             examples:
 *               success:
 *                 summary: Successful organization switch
 *                 value:
 *                   success: true
 *                   data:
 *                     organizationId: "123e4567-e89b-12d3-a456-426614174000"
 *                     organizationName: "FitLife Gym Downtown"
 *                     role: "admin"
 *       400:
 *         $ref: '#/components/responses/400'
 *       401:
 *         $ref: '#/components/responses/401'
 *       403:
 *         description: User does not have access to target organization
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Access denied to organization"
 *       500:
 *         $ref: '#/components/responses/500'
 *     security:
 *       - WorkOSSession: []
 *         CurrentUserId: []
 */

export { swaggerSpec, swaggerDefinition, swaggerOptions };