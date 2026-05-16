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
    id: "home",
    label: "Home",
    icon: "home",
    navItems: [
      { title: "SCC 소개", href: "/home", icon: "info" },
      { title: "주요 팀내 페이지 모음", href: "/home/pages", icon: "page" },
    ],
  },
  {
    id: "demo-ipam",
    label: "(데모)IPAM",
    icon: "network",
    navItems: [
      { title: "대시보드", href: "/demo-ipam", icon: "dashboard" },
      { title: "서브넷 관리", href: "/demo-ipam/subnets", icon: "network" },
      { title: "IP 주소 관리", href: "/demo-ipam/ip-addresses", icon: "server" },
    ],
  },
  {
    id: "demo-components",
    label: "(데모)컴포넌트 모음",
    icon: "palette",
    navItems: [
      { title: "데모 소개", href: "/demo-components", icon: "info" },
      { title: "대시보드", href: "/demo-components/overview", icon: "dashboard" },
      { title: "상품 관리", href: "/demo-components/products", icon: "product" },
      { title: "사용자 관리", href: "/demo-components/users", icon: "teams" },
      { title: "칸반 보드", href: "/demo-components/kanban", icon: "kanban" },
      { title: "채팅", href: "/demo-components/chat", icon: "chat" },
      { title: "폼", href: "/demo-components/forms/basic", icon: "forms" },
      { title: "아이콘", href: "/demo-components/elements/icons", icon: "palette" },
      { title: "알림", href: "/demo-components/notifications", icon: "notification" },
    ],
  },
];

export function getViewByPath(pathname: string): ViewConfig | undefined {
  const viewId = pathname.split("/")[1];
  return views.find((v) => v.id === viewId);
}
