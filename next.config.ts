import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'yemreeke.dev' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
    ],
    unoptimized: true
  },
  trailingSlash: true,
  output: 'export',
  distDir: 'out',
};

export default nextConfig;
