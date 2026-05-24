export interface NavItem {
  title: string;
  href: string;
  icon?: string;
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
    id: 'san',
    label: '(데모) SAN',
    icon: 'network',
    navItems: [{ title: '대시보드', href: '/san', icon: 'dashboard' }]
  },
  {
    id: 'demo-ipam',
    label: '(데모)IPAM',
    icon: 'network',
    navItems: [
      { title: '대시보드', href: '/demo-ipam', icon: 'dashboard' },
      { title: '서브넷 관리', href: '/demo-ipam/subnets', icon: 'network' },
      { title: 'IP 할당/반납', href: '/demo-ipam/ip-addresses', icon: 'server' }
    ]
  },
  {
    id: 'demo-ui',
    label: '[데모] 순수 UI',
    icon: 'palette',
    navItems: [
      { title: '칸반 보드', href: '/demo-ui/kanban', icon: 'kanban' },
      { title: '채팅', href: '/demo-ui/chat', icon: 'chat' },
      { title: '폼', href: '/demo-ui/forms/basic', icon: 'forms' },
      { title: '아이콘', href: '/demo-ui/icons', icon: 'palette' },
      { title: '알림', href: '/demo-ui/notifications', icon: 'notification' },
      { title: '프로필', href: '/demo-ui/profile', icon: 'teams' }
    ]
  },
  {
    id: 'demo-logic',
    label: '[데모] UI + Logic',
    icon: 'code',
    navItems: [
      { title: '대시보드', href: '/demo-logic/overview', icon: 'dashboard' },
      { title: '상품 관리', href: '/demo-logic/products', icon: 'product' },
      { title: '사용자 관리', href: '/demo-logic/users', icon: 'teams' },
      { title: '그리드 대시보드', href: '/demo-logic/grid-dashboard', icon: 'dashboard' },
      { title: '스위치 매핑', href: '/demo-logic/switch-mapping', icon: 'network' },
      { title: 'React Query', href: '/demo-logic/react-query', icon: 'code' },
      { title: 'Billing', href: '/demo-logic/billing', icon: 'payment' },
      { title: 'Exclusive', href: '/demo-logic/exclusive', icon: 'shapes' },
      { title: 'Workspaces', href: '/demo-logic/workspaces', icon: 'building' }
    ]
  },
  {
    id: 'api-reference',
    label: 'API Reference',
    icon: 'api',
    navItems: [
      { title: 'All APIs', href: '/api-reference', icon: 'listTree' },
      { title: 'SemaphoreUI', href: '/api-reference/semaphore', icon: 'serverBolt' }
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
