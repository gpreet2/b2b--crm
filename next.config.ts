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
};

export default nextConfig;
