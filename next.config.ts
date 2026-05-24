import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true // 폐쇄망에서 외부 이미지 최적화 불가
  },
  // Turbopack 활성화 (Next.js 16 기본값)
  turbopack: {},
  // 개발 서버 cross-origin 요청 허용 (LAN IP 포함)
  allowedDevOrigins: ['localhost', '127.0.0.1', '10.10.10.5'],
  async redirects() {
    return [
      // 기존 redirect 업데이트
      {
        source: '/switch-mapping',
        destination: '/demo-logic/switch-mapping',
        permanent: true
      },
      // demo-ui 단독 경로 (catch-all보다 먼저)
      { source: '/demo-components/kanban', destination: '/demo-ui/kanban', permanent: true },
      { source: '/demo-components/chat', destination: '/demo-ui/chat', permanent: true },
      {
        source: '/demo-components/forms/:path*',
        destination: '/demo-ui/forms/:path*',
        permanent: true
      },
      {
        source: '/demo-components/elements/:path*',
        destination: '/demo-ui/:path*',
        permanent: true
      },
      {
        source: '/demo-components/notifications',
        destination: '/demo-ui/notifications',
        permanent: true
      },
      {
        source: '/demo-components/profile/:path*',
        destination: '/demo-ui/profile/:path*',
        permanent: true
      },
      // demo-logic catch-all
      { source: '/demo-components/:path*', destination: '/demo-logic/:path*', permanent: true }
    ];
  }
};

export default nextConfig;
