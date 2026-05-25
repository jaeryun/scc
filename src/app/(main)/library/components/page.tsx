import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '컴포넌트(UI)',
  description: 'shadcn/ui 기반의 순수 UI 컴포넌트 모음'
};

const components = [
  {
    title: 'Kanban',
    description: 'dnd-kit 기반 드래그 앤 드롭 칸반 보드',
    href: '/library/components/kanban',
    icon: Icons.kanban
  },
  {
    title: 'Chat',
    description: '채팅 인터페이스 UI',
    href: '/library/components/chat',
    icon: Icons.chat
  },
  {
    title: 'Forms',
    description: 'TanStack Form + Zod 기반 폼 패턴 모음',
    href: '/library/components/forms/basic',
    icon: Icons.forms
  },
  {
    title: 'Icons',
    description: '프로젝트에서 사용 가능한 아이콘 갤러리',
    href: '/library/components/icons',
    icon: Icons.palette
  },
  {
    title: 'Notifications',
    description: '알림 센터 및 알림 카드 UI',
    href: '/library/components/notifications',
    icon: Icons.notification
  },
  {
    title: 'Overlay',
    description: 'Toast, Tooltip, Popover, HoverCard 등 오버레이 UI',
    href: '/library/components/tooltip',
    icon: Icons.info
  },
  {
    title: 'Dialog',
    description: 'Dialog, AlertDialog, Sheet 등 대화상자 UI',
    href: '/library/components/dialog',
    icon: Icons.components
  },
  {
    title: 'Code Block',
    description: 'shiki 코드 뷰어 + CodeMirror 에디터',
    href: '/library/components/code-block',
    icon: Icons.code
  },
  {
    title: 'Tabs & Accordion',
    description: 'Tabs, Accordion, Collapsible 등 콘텐츠 컨테이너 UI',
    href: '/library/components/tabs-accordion',
    icon: Icons.hierarchy
  },
  {
    title: 'Progress & Skeleton',
    description: '진행률 바, 스켈레톤, 스피너 등 로딩 상태 UI',
    href: '/library/components/progress',
    icon: Icons.spinner
  },
  {
    title: 'Table',
    description: '데이터 테이블 — 정렬, 선택, 페이지네이션',
    href: '/library/components/table',
    icon: Icons.listTree
  },
  {
    title: 'Dropdown & Context',
    description: 'DropdownMenu, ContextMenu, Menubar 등 메뉴 UI',
    href: '/library/components/dropdown',
    icon: Icons.ellipsis
  },
  {
    title: 'Command Palette',
    description: 'Command, CommandDialog 등 커맨드 팔레트 UI',
    href: '/library/components/command',
    icon: Icons.logo
  },
  {
    title: 'Chart',
    description: 'Recharts 기반 차트 — Bar, Line, Area, Pie, Donut',
    href: '/library/components/chart',
    icon: Icons.barChart
  },
  {
    title: 'Profile',
    description: '사용자 프로필 페이지',
    href: '/library/components/profile',
    icon: Icons.teams
  },
  {
    title: 'Static Pages',
    description: '404, 에러 페이지 등 정적 페이지 UI',
    href: '/library/components/static-pages',
    icon: Icons.page
  }
];

export default function ComponentsPage() {
  return (
    <PageContainer
      pageTitle='컴포넌트(UI)'
      pageDescription='shadcn/ui 기반의 순수 UI 컴포넌트 모음입니다. 데이터 연동 없이 UI 구현 패턴을 참고하세요.'
    >
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {components.map(({ title, description, href, icon: Icon }) => (
          <Link key={href} href={href} className='group'>
            <Card className='h-full hover:border-primary/50 hover:shadow-md transition-all'>
              <CardHeader>
                <div className='mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors'>
                  <Icon className='h-5 w-5' />
                </div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}
