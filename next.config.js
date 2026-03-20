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
  }
}

module.exports = nextConfig