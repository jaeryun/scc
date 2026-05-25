import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '라이브러리',
  description: '재사용 가능한 컴포넌트, 모듈, API 문서 컬렉션'
};

export default function LibraryPage() {
  return (
    <PageContainer
      pageTitle='라이브러리'
      pageDescription='재사용 가능한 컴포넌트, 모듈, API 문서 컬렉션입니다.'
    >
      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <Link href='/library/components' className='group'>
          <Card className='h-full hover:border-primary/50 hover:shadow-md transition-all'>
            <CardHeader>
              <div className='mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors'>
                <Icons.palette className='h-6 w-6' />
              </div>
              <CardTitle>컴포넌트(UI)</CardTitle>
              <CardDescription>shadcn/ui 기반의 순수 UI 컴포넌트 모음입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className='space-y-1 text-sm text-muted-foreground'>
                <li>칸반 보드</li>
                <li>채팅 인터페이스</li>
                <li>폼 (Basic, Multi-Step, Sheet)</li>
                <li>아이콘 갤러리</li>
                <li>알림 시스템</li>
                <li>오버레이</li>
                <li>대화상자</li>
                <li>코드 블록</li>
                <li>Tooltip & Popover</li>
                <li>Tabs & Accordion</li>
                <li>진행률 & 스켈레톤</li>
                <li>테이블</li>
                <li>드롭다운 & 컨텍스트</li>
                <li>커맨드 팔레트</li>
                <li>차트</li>
                <li>프로필 페이지</li>
                <li>정적 페이지 (404, 에러)</li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        <Link href='/library/modules' className='group'>
          <Card className='h-full hover:border-primary/50 hover:shadow-md transition-all'>
            <CardHeader>
              <div className='mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors'>
                <Icons.code className='h-6 w-6' />
              </div>
              <CardTitle>모듈(UI + Data)</CardTitle>
              <CardDescription>데이터 연동이 포함된 실전 모듈입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className='space-y-1 text-sm text-muted-foreground'>
                <li>대시보드 (개요, 그리드)</li>
                <li>상품 / 사용자 CRUD</li>
                <li>React Query 패턴</li>
                <li>Billing & Workspaces</li>
                <li>스위치 포트 매핑</li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        <Link href='/library/api-reference' className='group'>
          <Card className='h-full hover:border-primary/50 hover:shadow-md transition-all'>
            <CardHeader>
              <div className='mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors'>
                <Icons.api className='h-6 w-6' />
              </div>
              <CardTitle>API Reference</CardTitle>
              <CardDescription>외부 시스템 통합을 위한 OpenAPI 스펙 문서입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className='space-y-1 text-sm text-muted-foreground'>
                <li>SemaphoreUI API</li>
                <li>Scalar 기반 인터랙티브 문서</li>
                <li>OpenAPI 3.0 스펙 뷰어</li>
              </ul>
            </CardContent>
          </Card>
        </Link>
      </div>
    </PageContainer>
  );
}
