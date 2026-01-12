import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["yemreeke.dev", 'localhost', '127.0.0.1'],
  },
  trailingSlash: true,
  output: 'export',
  distDir: 'build',
};

export default nextConfig;
