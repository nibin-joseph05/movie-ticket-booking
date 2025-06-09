/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // This allows production builds to complete even with ESLint errors.
    // Remember to fix your ESLint warnings eventually for better code quality!
    ignoreDuringBuilds: true,
  },
  images: {
    // Add 'image.tmdb.org' to the list of allowed external image domains
    domains: ['image.tmdb.org'],
  },
};

export default nextConfig;
