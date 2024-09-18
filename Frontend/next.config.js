/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['utfs.io']
  },
  eslint: {
    ignoreDuringBuilds: true, // Add this line to ignore ESLint warnings during builds
  },
  typescript: {
    ignoreBuildErrors: true, // Skip type checking during build
  }
};

module.exports = nextConfig;
