/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/emea-launch-story-app' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/emea-launch-story-app/' : '',
  webpack: (config) => {
    return config;
  },
}

module.exports = nextConfig
