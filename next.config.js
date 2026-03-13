/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use standalone output for deployment
  output: 'standalone',
  
  // Force dynamic rendering for all routes to avoid prerender errors
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, max-age=0, must-revalidate',
          },
        ],
      },
    ]
  },
  
  experimental: {
    outputFileTracingRoot: process.cwd(),
  },
}

module.exports = nextConfig