import { NextRequest, NextResponse } from 'next/server';

// CORS configuration
const corsOptions = {
  // Allowed origins - add your staging and production domains
  allowedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    // Add your staging domain here
    process.env.NEXT_PUBLIC_STAGING_URL,
    // Add your production domain here
    process.env.NEXT_PUBLIC_PRODUCTION_URL,
  ].filter(Boolean) as string[],
  
  // Allowed methods
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  
  // Allowed headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  
  // Allow credentials
  credentials: true,
  
  // Max age for preflight cache (in seconds)
  maxAge: 86400, // 24 hours
};

export function middleware(request: NextRequest) {
  // Get the origin from the request
  const origin = request.headers.get('origin');
  const isAllowedOrigin = origin && corsOptions.allowedOrigins.includes(origin);
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    
    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    
    response.headers.set(
      'Access-Control-Allow-Methods',
      corsOptions.allowedMethods.join(', ')
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      corsOptions.allowedHeaders.join(', ')
    );
    response.headers.set(
      'Access-Control-Max-Age',
      corsOptions.maxAge.toString()
    );
    
    return response;
  }
  
  // Handle actual requests
  const response = NextResponse.next();
  
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Only set HSTS in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }
  
  return response;
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Run on all API routes
    '/api/:path*',
    // Skip static files and images
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};