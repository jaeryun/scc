import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true // 폐쇄망에서 외부 이미지 최적화 불가
  },
  // Turbopack 활성화 (Next.js 16 기본값)
  turbopack: {},
  // 개발 서버 cross-origin 요청 허용 (LAN IP 포함)
  allowedDevOrigins: ['localhost', '127.0.0.1', '10.10.10.5']
};

export default nextConfig;
