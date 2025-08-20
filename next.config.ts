import type { NextConfig } from 'next';
import { DefinePlugin } from 'webpack';

const nextConfig: NextConfig = {
  eslint: {
    // Allow warnings but block on TypeScript errors for deployment readiness
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Professional build with proper TypeScript checking enabled
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'workoscdn.com',
        port: '',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    // Disable server tracing to avoid OpenTelemetry issues in middleware
    // instrumentationHook: false, // This option doesn't exist in Next.js 15
  },
  // Performance optimizations
  webpack: (config, { dev, isServer }) => {
    // Handle Node.js built-in modules for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'node:http': false,
        'node:https': false,
        'node:fs': false,
        'node:path': false,
        'node:url': false,
        'node:crypto': false,
        'node:buffer': false,
        'node:util': false,
        'node:stream': false,
        'node:events': false,
        // WorkOS node client fallbacks
        'http': false,
        'https': false,
        'fs': false,
        'path': false,
        'url': false,
        'crypto': false,
        'buffer': false,
        'util': false,
        'stream': false,
        'events': false,
      };
    }

    if (dev) {
      // Completely exclude problematic packages in development to avoid CommonJS/ESM conflicts
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push({
          '@sentry/nextjs': 'commonjs @sentry/nextjs',
          '@sentry/node': 'commonjs @sentry/node',
          '@sentry/tracing': 'commonjs @sentry/tracing',
          '@sentry/browser': 'commonjs @sentry/browser',
          '@opentelemetry/api': 'commonjs @opentelemetry/api',
          '@opentelemetry/core': 'commonjs @opentelemetry/core',
          '@opentelemetry/instrumentation': 'commonjs @opentelemetry/instrumentation',
          '@workos-inc/node': 'commonjs @workos-inc/node',
        });
      }

      // Stub OpenTelemetry for edge runtime compatibility
      config.resolve.alias = {
        ...config.resolve.alias,
        '@opentelemetry/api': require.resolve('./src/lib/opentelemetry-stub.js'),
        '@opentelemetry/core': require.resolve('./src/lib/opentelemetry-stub.js'),
        '@opentelemetry/instrumentation': require.resolve('./src/lib/opentelemetry-stub.js'),
      };

      // Suppress the specific Prisma/OpenTelemetry warnings that spam the console
      config.ignoreWarnings = [
        // OpenTelemetry and Sentry instrumentation warnings
        /Critical dependency: the request of a dependency is an expression.*@prisma\/instrumentation/,
        /Critical dependency: the request of a dependency is an expression.*@opentelemetry/,
        /Critical dependency: the request of a dependency is an expression.*@sentry/,
        /Critical dependency: the request of a dependency is an expression.*instrumentation/,
        // Database driver warnings that don't affect our app
        /Module not found: Can't resolve 'pg-native'/,
        /Can't resolve 'mysql'/,
        /Can't resolve 'sqlite3'/,
        /Can't resolve 'tedious'/,
        /Can't resolve 'pg-query-stream'/,
        /Can't resolve 'oracledb'/,
        /Can't resolve 'redis'/,
        // Additional OpenTelemetry patterns
        /Critical dependency.*instrumentation.*build.*platform.*node/,
        /Critical dependency.*instrumentation.*esm.*platform.*node/,
        // Node built-in modules warnings
        /Module build failed.*UnhandledSchemeError.*node:/,
      ];

      // Disable vendor chunking completely in development to avoid CommonJS/ESM conflicts
      config.optimization = {
        ...config.optimization,
        splitChunks: false,
      };
    }

    // Add DefinePlugin for proper tree-shaking and environment separation
    config.plugins.push(
      new DefinePlugin({
        __SENTRY_DEBUG__: JSON.stringify(false),
        __SENTRY_TRACING__: JSON.stringify(process.env.NODE_ENV === 'production'),
        __RRWEB_EXCLUDE_IFRAME__: JSON.stringify(true),
        __RRWEB_EXCLUDE_SHADOW_DOM__: JSON.stringify(true),
        __SENTRY_EXCLUDE_REPLAY_WORKER__: JSON.stringify(true),
        // Completely disable Next.js tracing in development
        'process.env.NEXT_OTEL_VERBOSE': JSON.stringify('0'),
        'process.env.OTEL_SDK_DISABLED': JSON.stringify(dev ? 'true' : 'false'),
        // Prevent browser globals from being used in server code
        'process.browser': JSON.stringify(!isServer),
      })
    );

    return config;
  },
};

// Only import Sentry config wrapper in production to completely avoid dev conflicts
let finalConfig = nextConfig;

if (process.env.NODE_ENV === 'production') {
  try {
    const { withSentryConfig } = require('@sentry/nextjs');
    finalConfig = withSentryConfig(nextConfig, {
      org: 'tryzore',
      project: 'javascript-nextjs',
      silent: !process.env.CI,
      widenClientFileUpload: true,
      tunnelRoute: '/monitoring',
      disableLogger: true,
      automaticVercelMonitors: true,
    });
  } catch (error) {
    console.warn('Sentry config disabled:', error);
  }
}

export default finalConfig;