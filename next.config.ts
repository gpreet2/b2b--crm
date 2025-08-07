import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // Professional build with proper linting enabled
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Professional build with proper TypeScript checking enabled
    ignoreBuildErrors: false,
  },
  // Performance optimizations
  webpack: (config, { dev, isServer, webpack }) => {
    if (dev) {
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
      ];

      // Basic development optimizations
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }

    // Add DefinePlugin for proper Sentry tree-shaking and environment separation
    config.plugins.push(
      new webpack.DefinePlugin({
        __SENTRY_DEBUG__: JSON.stringify(false),
        __SENTRY_TRACING__: JSON.stringify(process.env.NODE_ENV === 'production'),
        __RRWEB_EXCLUDE_IFRAME__: JSON.stringify(true),
        __RRWEB_EXCLUDE_SHADOW_DOM__: JSON.stringify(true),
        __SENTRY_EXCLUDE_REPLAY_WORKER__: JSON.stringify(true),
        // Prevent browser globals from being used in server code
        'process.browser': JSON.stringify(!isServer),
      })
    );

    return config;
  },
};

// Disable Sentry config wrapper in development to avoid conflicts
export default process.env.NODE_ENV === 'production' 
  ? withSentryConfig(nextConfig, {
      org: 'tryzore',
      project: 'javascript-nextjs',
      silent: !process.env.CI,
      widenClientFileUpload: true,
      tunnelRoute: '/monitoring',
      disableLogger: true,
      automaticVercelMonitors: true,
    })
  : nextConfig;
