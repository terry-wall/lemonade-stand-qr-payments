/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use standalone output for better deployment
  output: 'standalone',
  
  // Cache control headers for API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, max-age=0, must-revalidate',
          },
        ],
      },
    ]
  },
  
  // Ensure we skip non-existent pages during static generation
  async generateStaticParams() {
    return []
  },
  
  // Explicitly disable static optimization for dynamic routes
  experimental: {
    outputFileTracingRoot: process.cwd(),
  },
}

module.exports = nextConfig