/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  experimental: {
    outputFileTracingRoot: process.cwd(),
  },
  
  trailingSlash: false,
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  async generateStaticParams() {
    return []
  }
}

module.exports = nextConfig