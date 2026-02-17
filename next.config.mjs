/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    turbopack: {
      resolveAlias: {
        'pino': false,
        'thread-stream': false,
        'sonic-boom': false,
      },
    },
  },
}

export default nextConfig
