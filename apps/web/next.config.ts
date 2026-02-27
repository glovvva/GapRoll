import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/:path*',
      },
      {
        source: '/root-cause/:path*',
        destination: 'http://localhost:8000/root-cause/:path*',
      },
      {
        source: '/reports/:path*',
        destination: 'http://localhost:8000/reports/:path*',
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
}

export default nextConfig
