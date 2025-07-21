/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Type checking during build
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Enable SWC minification for better performance
  swcMinify: true,
}

module.exports = nextConfig 