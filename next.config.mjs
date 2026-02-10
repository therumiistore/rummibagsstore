/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to enable getServerSideProps
  // This allows dynamic server-side rendering based on domain

  transpilePackages: ['lucide-react', 'react-quill'],

  // Image optimization
  images: {
    unoptimized: true, // Use unoptimized for external images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    NEXT_PUBLIC_DEFAULT_STORE: process.env.NEXT_PUBLIC_DEFAULT_STORE,
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;
