/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/emea-launch-story-app' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/emea-launch-story-app/' : '',
  output: 'standalone',
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
}

module.exports = nextConfig
