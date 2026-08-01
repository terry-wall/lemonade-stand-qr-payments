/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // Moved out of `experimental` in Next 15; it was being silently ignored here.
  outputFileTracingRoot: process.cwd(),

  trailingSlash: false,
}

module.exports = nextConfig
