
require('dotenv').config();

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@google-cloud/recaptcha-enterprise'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'citizensadviceteignbridge.org.uk',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
    GOOGLE_SCRIPT_WEB_APP_URL: process.env.GOOGLE_SCRIPT_WEB_APP_URL,
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    RECAPTCHA_PRIVATE_KEY: process.env.RECAPTCHA_PRIVATE_KEY,
    RECAPTCHA_CLIENT_EMAIL: process.env.RECAPTCHA_CLIENT_EMAIL,
  },
};

module.exports = nextConfig;
