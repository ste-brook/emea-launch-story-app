/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [];
  },
  webpack: (config) => {
    return config;
  },
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/launch-story-app' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/launch-story-app/' : '',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
