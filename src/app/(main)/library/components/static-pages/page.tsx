import PageContainer from '@/components/layout/page-container';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '정적 페이지',
  description: '404, 에러, 점검중 등 정적 페이지 UI 모음'
};

const pages = [
  {
    title: '404 Not Found',
    description: '페이지를 찾을 수 없을 때 표시되는 UI입니다.',
    href: '/library/components/static-pages/not-found',
    badge: '404'
  },
  {
    title: '에러 페이지',
    description: '500, 502, 503 등 서버 에러 상태를 표시하는 UI 모음입니다.',
    href: '/library/components/static-pages/error',
    badge: '5xx'
  }
];

export default function StaticPagesOverview() {
  return (
    <PageContainer
      pageTitle='정적 페이지'
      pageDescription='404, 에러 등 정적 페이지 UI 구현 패턴 모음입니다.'
    >
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {pages.map(({ title, description, href, badge }) => (
          <Link key={href} href={href} className='group'>
            <Card className='h-full hover:border-primary/50 hover:shadow-md transition-all'>
              <CardHeader>
                <div className='flex items-center gap-3'>
                  <Badge variant='secondary' className='font-mono text-lg px-3 py-1'>
                    {badge}
                  </Badge>
                  <CardTitle>{title}</CardTitle>
                </div>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}
