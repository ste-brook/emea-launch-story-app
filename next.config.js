/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  webpack: (config) => {
    return config;
  },
  ...(process.env.NODE_ENV === 'production' ? {
    basePath: '/launch-story-app',
    assetPrefix: '/launch-story-app/',
  } : {})
}

module.exports = nextConfig
