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
    id: 'home',
    label: 'Home',
    icon: 'home',
    navItems: [{ title: 'SCC 소개', href: '/home', icon: 'info' }]
  },
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
    id: 'demo',
    label: '데모',
    icon: 'lib',
    navItems: [
      { title: '소개', href: '/demo', icon: 'info' },
      {
        title: '컴포넌트(UI)',
        href: '/demo/components',
        icon: 'palette',
        items: [
          { title: '소개', href: '/demo/components', icon: 'info' },
          { title: '칸반', href: '/demo/components/kanban', icon: 'kanban' },
          { title: '채팅', href: '/demo/components/chat', icon: 'chat' },
          { title: '폼', href: '/demo/components/forms/basic', icon: 'forms' },
          { title: '아이콘', href: '/demo/components/icons', icon: 'palette' },
          { title: '알림', href: '/demo/components/notifications', icon: 'notification' },
          { title: '대화상자', href: '/demo/components/dialog', icon: 'components' },
          { title: '코드 블록', href: '/demo/components/code-block', icon: 'code' },
          { title: '오버레이', href: '/demo/components/tooltip', icon: 'info' },
          { title: '탭 & 아코디언', href: '/demo/components/tabs-accordion', icon: 'hierarchy' },
          { title: '진행률 & 스켈레톤', href: '/demo/components/progress', icon: 'spinner' },
          { title: '테이블', href: '/demo/components/table', icon: 'listTree' },
          { title: '드롭다운 & 컨텍스트', href: '/demo/components/dropdown', icon: 'ellipsis' },
          { title: '커맨드 팔레트', href: '/demo/components/command', icon: 'logo' },
          { title: '차트', href: '/demo/components/chart', icon: 'barChart' },
          { title: '프로필', href: '/demo/components/profile', icon: 'teams' },
          {
            title: '정적 페이지',
            href: '/demo/components/static-pages',
            icon: 'page',
            items: [
              { title: '소개', href: '/demo/components/static-pages', icon: 'info' },
              {
                title: '404 Not Found',
                href: '/demo/components/static-pages/not-found',
                icon: 'slash'
              },
              {
                title: '에러 페이지',
                href: '/demo/components/static-pages/error',
                icon: 'warning'
              }
            ]
          }
        ]
      },
      {
        title: '모듈(UI + Data)',
        href: '/demo/modules',
        icon: 'code',
        items: [
          { title: '소개', href: '/demo/modules', icon: 'info' },
          { title: '대시보드', href: '/demo/modules/dashboard', icon: 'dashboard' },
          { title: '제품', href: '/demo/modules/products', icon: 'product' },
          { title: '사용자', href: '/demo/modules/users', icon: 'teams' },
          { title: 'React Query', href: '/demo/modules/react-query', icon: 'code' },
          { title: '결제', href: '/demo/modules/billing', icon: 'billing' },
          { title: '특별', href: '/demo/modules/exclusive', icon: 'sparkles' },
          { title: '워크스페이스', href: '/demo/modules/workspaces', icon: 'workspace' }
        ]
      }
    ]
  },
  {
    id: 'api-reference',
    label: 'API Reference',
    icon: 'api',
    navItems: [{ title: 'API Reference', href: '/api-reference', icon: 'api' }]
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
