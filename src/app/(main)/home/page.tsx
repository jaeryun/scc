import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'SE Command Center',
  description: 'AI 기반 개발을 위한 일관된 웹 애플리케이션 프레임워크'
};

export default function HomePage() {
  return (
    <div className='flex min-h-[calc(100vh-3.5rem)] flex-1 flex-col items-center justify-center px-4 py-12'>
      <div className='mx-auto max-w-4xl text-center'>
        <div className='mb-6 flex justify-center'>
          <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground'>
            <Icons.logo className='h-8 w-8' />
          </div>
        </div>
        <h1 className='text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl'>
          SE Command Center
        </h1>
        <p className='mt-6 text-lg text-muted-foreground'>
          AI 기반 개발을 위한 일관된 웹 애플리케이션 프레임워크
        </p>
      </div>

      <div className='mt-12 grid w-full max-w-4xl gap-6 md:grid-cols-2'>
        <Card className='hover:border-primary/50 transition-colors'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Icons.network className='h-5 w-5 text-primary' />
              데모 - IPAM
            </CardTitle>
            <CardDescription>
              IP 주소 관리 시스템 데모. 서브넷/IP CRUD, 상태 추적
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground mb-4'>
              네트워크 인프라를 관리하는 IPAM 시스템의 UI/UX 패턴을 참고하세요.
              서브넷 할당, IP 주소 상태 추적, 검색 및 필터링 기능을 포함합니다.
            </p>
            <Link href='/demo-ipam'>
              <Button className='w-full'>
                IPAM 데모 보기
                <Icons.chevronRight className='ml-2 h-4 w-4' />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className='hover:border-primary/50 transition-colors'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Icons.dashboard className='h-5 w-5 text-primary' />
              데모 - 컴포넌트
            </CardTitle>
            <CardDescription>
              다양한 UI 패턴 참고용 (차트, 테이블, 칸반, 폼 등)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground mb-4'>
              shadcn/ui 기반의 대시보드 템플릿에서 사용하는 다양한 UI 컴포넌트와
              패턴을 확인하세요. 차트, 데이터 테이블, 칸반 보드, 폼 등을 포함합니다.
            </p>
            <Link href='/demo-components/overview'>
              <Button className='w-full' variant='outline'>
                컴포넌트 데모 보기
                <Icons.chevronRight className='ml-2 h-4 w-4' />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className='mt-16 max-w-2xl text-center'>
        <h2 className='text-2xl font-semibold'>기술 스택</h2>
        <div className='mt-6 flex flex-wrap justify-center gap-3'>
          {['Next.js 16', 'React 19', 'TypeScript 5.7', 'Tailwind CSS v4', 'shadcn/ui', 'TanStack Query', 'Prisma', 'PostgreSQL'].map(
            (tech) => (
              <span
                key={tech}
                className='inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium'
              >
                {tech}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
