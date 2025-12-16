
/** @type {import('next').NextConfig} */
const nextConfig = {
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
        protocol: 'https'
        ,
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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
  experimental: {
  }
>>>>>>> Stashed changes
=======
  experimental: {
  }
>>>>>>> Stashed changes
};

module.exports = nextConfig;
