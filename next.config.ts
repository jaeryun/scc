import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true, // 폐쇄망에서 외부 이미지 최적화 불가
  },
  // Turbopack 활성화 (Next.js 16 기본값)
  turbopack: {},
};

export default nextConfig;
