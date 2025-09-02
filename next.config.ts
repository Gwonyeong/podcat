import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: false,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // CSS 및 정적 파일 처리 최적화
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  trailingSlash: false,
};

export default nextConfig;
