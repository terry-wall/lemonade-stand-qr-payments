/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // Disable static optimization for dynamic routes
  trailingSlash: false,
  // Force dynamic rendering for API routes
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
  // Ensure static generation doesn't fail on missing routes
  async generateStaticParams() {
    return []
  },
  // Export configuration for static generation
  output: 'standalone',
  // Disable static export for routes that use server features
  experimental: {
    appDir: true,
    outputFileTracingRoot: undefined,
  },
}

module.exports = nextConfig