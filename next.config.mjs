/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbo: {
    resolveAlias: {
      'pino': 'pino/browser',
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'pino': false,
        'pino-pretty': false,
        'thread-stream': false,
      };
    }
    return config;
  },
}

export default nextConfig
