export interface NavItem {
  title: string;
  href: string;
}

export interface ViewConfig {
  id: string;
  label: string;
  icon: string;
  navItems: NavItem[];
}

export const views: ViewConfig[] = [
  {
    id: "demo-ipam",
    label: "데모 - IPAM",
    icon: "Network",
    navItems: [
      { title: "대시보드", href: "/demo-ipam" },
      { title: "서브넷 관리", href: "/demo-ipam/subnets" },
      { title: "IP 주소 관리", href: "/demo-ipam/ip-addresses" },
    ],
  },
  {
    id: "demo-components",
    label: "데모 - 컴포넌트",
    icon: "Component",
    navItems: [
      { title: "대시보드", href: "/demo-components" },
      { title: "Kanban 보드", href: "/demo-components/kanban" },
      { title: "채팅", href: "/demo-components/chat" },
      { title: "상품 관리", href: "/demo-components/products" },
      { title: "사용자 목록", href: "/demo-components/users" },
    ],
  },
];

export function getViewByPath(pathname: string): ViewConfig | undefined {
  const viewId = pathname.split("/")[1];
  return views.find((v) => v.id === viewId);
}
