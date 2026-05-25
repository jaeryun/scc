import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '모듈(UI + Data)',
  description: '데이터 연동이 포함된 실전 모듈 모음'
};

const modules = [
  {
    title: 'Dashboard',
    description: '차트, 통계, 매출 요약 대시보드 예시',
    href: '/library/modules/dashboard',
    icon: Icons.dashboard
  },
  {
    title: 'Products',
    description: 'TanStack Query + nuqs 기반 상품 CRUD',
    href: '/library/modules/products',
    icon: Icons.product
  },
  {
    title: 'Users',
    description: '사용자 목록 및 관리',
    href: '/library/modules/users',
    icon: Icons.teams
  },
  {
    title: 'React Query',
    description: 'React Query 데이터 페칭 패턴 레퍼런스',
    href: '/library/modules/react-query',
    icon: Icons.code
  },
  {
    title: 'Billing',
    description: '구독 및 결제 관리',
    href: '/library/modules/billing',
    icon: Icons.billing
  },
  {
    title: 'Exclusive',
    description: '프리미엄 기능 데모',
    href: '/library/modules/exclusive',
    icon: Icons.sparkles
  },
  {
    title: 'Workspaces',
    description: '팀 워크스페이스 관리',
    href: '/library/modules/workspaces',
    icon: Icons.workspace
  }
];

export default function ModulesPage() {
  return (
    <PageContainer
      pageTitle='모듈(UI + Data)'
      pageDescription='데이터 연동이 포함된 실전 모듈 모음입니다. TanStack Query, nuqs, mock API를 활용한 데이터 페칭 패턴을 참고하세요.'
    >
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {modules.map(({ title, description, href, icon: Icon }) => (
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
