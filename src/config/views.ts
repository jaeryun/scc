export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  items?: NavItem[];
  isActive?: boolean;
}

export interface ViewConfig {
  id: string;
  label: string;
  icon: string;
  navItems: NavItem[];
}

export const views: ViewConfig[] = [
  {
    id: 'dcim',
    label: 'DCIM',
    icon: 'server',
    navItems: [
      { title: '개요', href: '/dcim', icon: 'info' },
      { title: '디바이스', href: '/dcim/devices', icon: 'server' },
      { title: 'IPAM', href: '/dcim/ipam', icon: 'network' }
    ]
  },
  {
    id: 'home',
    label: 'Home',
    icon: 'home',
    navItems: [{ title: 'SCC 소개', href: '/home', icon: 'info' }]
  },
  {
    id: 'library',
    label: '라이브러리',
    icon: 'lib',
    navItems: [
      { title: '소개', href: '/library', icon: 'info' },
      {
        title: '컴포넌트(UI)',
        href: '/library/components',
        icon: 'palette',
        items: [
          { title: '소개', href: '/library/components', icon: 'info' },
          { title: '칸반', href: '/library/components/kanban', icon: 'kanban' },
          { title: '채팅', href: '/library/components/chat', icon: 'chat' },
          { title: '폼', href: '/library/components/forms/basic', icon: 'forms' },
          { title: '아이콘', href: '/library/components/icons', icon: 'palette' },
          { title: '알림', href: '/library/components/notifications', icon: 'notification' },
          { title: '대화상자', href: '/library/components/dialog', icon: 'components' },
          { title: '코드 블록', href: '/library/components/code-block', icon: 'code' },
          { title: '오버레이', href: '/library/components/tooltip', icon: 'info' },
          { title: '탭 & 아코디언', href: '/library/components/tabs-accordion', icon: 'hierarchy' },
          { title: '진행률 & 스켈레톤', href: '/library/components/progress', icon: 'spinner' },
          { title: '테이블', href: '/library/components/table', icon: 'listTree' },
          { title: '드롭다운 & 컨텍스트', href: '/library/components/dropdown', icon: 'ellipsis' },
          { title: '커맨드 팔레트', href: '/library/components/command', icon: 'logo' },
          { title: '차트', href: '/library/components/chart', icon: 'barChart' },
          { title: '프로필', href: '/library/components/profile', icon: 'teams' },
          {
            title: '정적 페이지',
            href: '/library/components/static-pages',
            icon: 'page',
            items: [
              { title: '소개', href: '/library/components/static-pages', icon: 'info' },
              {
                title: '404 Not Found',
                href: '/library/components/static-pages/not-found',
                icon: 'slash'
              },
              {
                title: '에러 페이지',
                href: '/library/components/static-pages/error',
                icon: 'warning'
              }
            ]
          }
        ]
      },
      {
        title: '모듈(UI + Data)',
        href: '/library/modules',
        icon: 'code',
        items: [
          { title: '소개', href: '/library/modules', icon: 'info' },
          { title: '대시보드', href: '/library/modules/dashboard', icon: 'dashboard' },
          { title: '제품', href: '/library/modules/products', icon: 'product' },
          { title: '사용자', href: '/library/modules/users', icon: 'teams' },
          { title: 'React Query', href: '/library/modules/react-query', icon: 'code' },
          { title: '결제', href: '/library/modules/billing', icon: 'billing' },
          { title: '특별', href: '/library/modules/exclusive', icon: 'sparkles' },
          { title: '워크스페이스', href: '/library/modules/workspaces', icon: 'workspace' }
        ]
      },
      {
        title: 'API 레퍼런스',
        href: '/library/api-reference',
        icon: 'api',
        items: [
          { title: '전체 API', href: '/library/api-reference', icon: 'listTree' },
          { title: 'SemaphoreUI', href: '/library/api-reference/semaphore', icon: 'serverBolt' }
        ]
      }
    ]
  },
  {
    id: 'settings',
    label: '설정',
    icon: 'settings',
    navItems: [
      { title: '뷰 설정', href: '/settings/views', icon: 'dashboard' },
      { title: '일반', href: '/settings/general', icon: 'settings' },
      { title: '외형', href: '/settings/appearance', icon: 'palette' },
      { title: '알림', href: '/settings/notifications', icon: 'notification' }
    ]
  }
];

export function getViewByPath(pathname: string): ViewConfig | undefined {
  const viewId = pathname.split('/')[1];
  return views.find((v) => v.id === viewId);
}
