/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use standalone output for deployment
  output: 'standalone',
  
  // Disable static optimization to avoid prerender errors
  experimental: {
    outputFileTracingRoot: process.cwd(),
  },
  
  // Configure trailing slash behavior
  trailingSlash: false,
  
  // Configure generateStaticParams for dynamic routes
  async generateStaticParams() {
    return []
  }
}

module.exports = nextConfig