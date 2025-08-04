import helmet from 'helmet';

/**
 * Environment-specific security configuration
 */
interface SecurityConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  frontendDomains: string[];
  apiDomain: string;
}

/**
 * Get security configuration based on environment
 */
function getSecurityConfig(): SecurityConfig {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isDevelopment = nodeEnv === 'development';
  const isProduction = nodeEnv === 'production';

  // Get allowed frontend domains from environment
  const frontendDomains = process.env.ALLOWED_FRONTEND_DOMAINS
    ? process.env.ALLOWED_FRONTEND_DOMAINS.split(',').map(d => d.trim())
    : isDevelopment
      ? ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000']
      : ['https://app.tryzore.com', 'https://admin.tryzore.com'];

  const apiDomain =
    process.env.NEXT_PUBLIC_APP_URL ||
    (isDevelopment ? 'http://localhost:3000' : 'https://api.tryzore.com');

  return {
    isDevelopment,
    isProduction,
    frontendDomains,
    apiDomain,
  };
}

/**
 * Generate Content Security Policy directives
 */
function generateCSPDirectives(
  config: SecurityConfig
): helmet.ContentSecurityPolicyOptions['directives'] {
  const { isDevelopment, frontendDomains, apiDomain } = config;

  // Base directives for all environments
  const baseDirectives: helmet.ContentSecurityPolicyOptions['directives'] = {
    defaultSrc: ["'self'"],

    // Scripts: Allow self, inline scripts in development, and trusted CDNs
    scriptSrc: [
      "'self'",
      ...(isDevelopment ? ["'unsafe-inline'", "'unsafe-eval'"] : []),
      'https://js.workos.com', // WorkOS SDK
      'https://cdn.supabase.com', // Supabase client
      'https://unpkg.com', // CDN for libraries (if needed)
    ],

    // Styles: Allow self, inline styles, and trusted CDNs
    styleSrc: [
      "'self'",
      "'unsafe-inline'", // Required for dynamic CSS-in-JS
      'https://fonts.googleapis.com',
      'https://cdn.jsdelivr.net',
    ],

    // Images: Allow self, data URLs, and trusted sources
    imgSrc: [
      "'self'",
      'data:',
      'blob:',
      'https:', // Allow HTTPS images for user avatars, logos, etc.
      ...(isDevelopment ? ['http:'] : []), // Allow HTTP in development
    ],

    // Fonts: Allow self and Google Fonts
    fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],

    // Connect: API endpoints and WebSocket connections
    connectSrc: [
      "'self'",
      apiDomain,
      ...frontendDomains,
      'https://api.workos.com', // WorkOS API
      'https://ulymixjoyuhapqxkcwbi.supabase.co', // Supabase API
      'wss://ulymixjoyuhapqxkcwbi.supabase.co', // Supabase Realtime
      'https://sentry.io', // Sentry error reporting
      ...(isDevelopment ? ['ws:', 'wss:'] : []), // WebSocket in development
    ],

    // Media: Allow self and blob URLs for uploads
    mediaSrc: ["'self'", 'blob:', 'data:'],

    // Objects and embeds: Restrict to prevent XSS
    objectSrc: ["'none'"],
    embedSrc: ["'none'"],

    // Frames: Only allow same origin and trusted sources
    frameSrc: [
      "'self'",
      'https://js.workos.com', // WorkOS iframe
    ],

    // Workers and manifests
    workerSrc: ["'self'", 'blob:'],
    manifestSrc: ["'self'"],

    // Base URI: Restrict to prevent injection
    baseUri: ["'self'"],

    // Form actions: Only allow same origin
    formAction: ["'self'"],
  };

  return baseDirectives;
}

/**
 * Get Helmet.js configuration
 */
export function getHelmetConfig(): Parameters<typeof helmet>[0] {
  const config = getSecurityConfig();
  const { isDevelopment, isProduction } = config;

  return {
    // Content Security Policy
    contentSecurityPolicy: {
      directives: generateCSPDirectives(config),
      reportOnly: isDevelopment, // Report-only in development for easier debugging
    },

    // HTTP Strict Transport Security
    hsts: {
      maxAge: isProduction ? 31536000 : 0, // 1 year in production, disabled in dev
      includeSubDomains: isProduction,
      preload: isProduction,
    },

    // X-Frame-Options: Prevent clickjacking
    frameguard: {
      action: 'deny', // Block all framing
    },

    // X-Content-Type-Options: Prevent MIME type sniffing
    noSniff: true,

    // X-XSS-Protection: Enable XSS filtering (legacy browsers)
    xssFilter: {
      setOnOldIE: true, // For older IE versions
    },

    // Referrer Policy: Control referrer information
    referrerPolicy: {
      policy: ['strict-origin-when-cross-origin'],
    },

    // Cross-Origin-Embedder-Policy: Restrict loading of cross-origin resources
    crossOriginEmbedderPolicy: false, // Disabled for now - can break some integrations

    // Cross-Origin-Opener-Policy: Isolate browsing context
    crossOriginOpenerPolicy: {
      policy: 'same-origin',
    },

    // Cross-Origin-Resource-Policy: Restrict cross-origin resource loading
    crossOriginResourcePolicy: {
      policy: 'cross-origin', // Allow cross-origin for API usage
    },

    // Origin-Agent-Cluster: Request origin-keyed agent clusters
    originAgentCluster: true,

    // Permissions Policy (Feature Policy): Control browser features
    permissionsPolicy: {
      camera: ['()'], // Block camera access
      microphone: ['()'], // Block microphone access
      geolocation: ['()'], // Block geolocation
      payment: ['()'], // Block payment API
      usb: ['()'], // Block USB API
      magnetometer: ['()'], // Block magnetometer
      gyroscope: ['()'], // Block gyroscope
      accelerometer: ['()'], // Block accelerometer
      // Allow fullscreen for modals/dialogs
      fullscreen: ['self'],
    },

    // Hide X-Powered-By header
    hidePoweredBy: true,

    // DNS Prefetch Control: Control DNS prefetching
    dnsPrefetchControl: {
      allow: false, // Disable DNS prefetching for privacy
    },

    // Expect-CT: Certificate Transparency reporting
    expectCt: isProduction
      ? {
          maxAge: 86400, // 1 day
          enforce: true,
        }
      : false,
  };
}

/**
 * Get security headers for manual application
 */
export function getSecurityHeaders(): Record<string, string> {
  const config = getSecurityConfig();
  const { isProduction } = config;

  return {
    // Server information disclosure
    Server: 'TryZore-API',

    // API-specific headers
    'X-API-Version': '1.0',
    'X-Rate-Limit-Policy': 'strict',

    // Security headers not covered by Helmet
    'X-Permitted-Cross-Domain-Policies': 'none',
    'X-Download-Options': 'noopen',
    'X-Robots-Tag': isProduction ? 'noindex, nofollow' : 'noindex',

    // Cache control for sensitive endpoints
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    Pragma: 'no-cache',
    Expires: '0',
  };
}

/**
 * Get CORS origins based on environment
 */
export function getCorsOrigins(): string[] {
  const config = getSecurityConfig();
  return config.frontendDomains;
}

/**
 * Validate if origin is allowed
 */
export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return false;

  const allowedOrigins = getCorsOrigins();
  return allowedOrigins.includes(origin);
}

/**
 * Security configuration constants
 */
export const SECURITY_CONSTANTS = {
  // Rate limiting
  MAX_REQUESTS_PER_MINUTE: 60,
  MAX_AUTH_REQUESTS_PER_MINUTE: 10,
  MAX_REQUESTS_PER_HOUR: 1000,

  // Session security
  SESSION_TIMEOUT_HOURS: 24,
  REFRESH_TOKEN_ROTATION: true,

  // Upload limits
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/json',
    'application/xml',
  ],

  // Request limits
  MAX_REQUEST_SIZE: '10mb',
  MAX_PARAMETER_LIMIT: 100,

  // Security timeouts
  REQUEST_TIMEOUT: 30000, // 30 seconds
  SLOW_REQUEST_THRESHOLD: 5000, // 5 seconds
} as const;
