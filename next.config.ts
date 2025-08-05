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
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Suppress the specific Prisma/OpenTelemetry warnings that spam the console
      config.ignoreWarnings = [
        /Critical dependency: the request of a dependency is an expression.*@prisma\/instrumentation/,
        /Critical dependency: the request of a dependency is an expression.*@opentelemetry/,
        /Critical dependency: the request of a dependency is an expression.*@sentry/,
        /Module not found: Can't resolve 'pg-native'/,
        /Can't resolve 'mysql'/,
        /Can't resolve 'sqlite3'/,
        /Can't resolve 'tedious'/,
        /Can't resolve 'pg-query-stream'/,
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
    return config;
  },
};

export default nextConfig;
