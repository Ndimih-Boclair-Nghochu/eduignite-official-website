import type {NextConfig} from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Tell Next.js the real repo root so it doesn't confuse the workspace root
  // when multiple package-lock.json files exist (silences the workspace warning).
  outputFileTracingRoot: path.join(__dirname, '../'),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
