import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true, // 폐쇄망에서 외부 이미지 최적화 불가
  },
  // Turbopack 활성화 (Next.js 16 기본값)
  turbopack: {},
  // 개발 서버 cross-origin 요청 허용 (모든 origin 허용)
  allowedDevOrigins: ['*'],
};

export default nextConfig;
