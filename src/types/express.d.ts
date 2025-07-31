import { User } from '../lib/types';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      organizationId?: string;
      validated?: {
        body?: any;
        params?: any;
        query?: any;
        headers?: any;
      };
      requestId?: string;
    }
    
    interface Response {
      locals: {
        requestId?: string;
      };
    }
  }
}

export {};