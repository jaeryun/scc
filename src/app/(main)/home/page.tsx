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
            <CardDescription>IP 주소 관리 시스템 데모. 서브넷/IP CRUD, 상태 추적</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground mb-4'>
              네트워크 인프라를 관리하는 IPAM 시스템의 UI/UX 패턴을 참고하세요. 서브넷 할당, IP 주소
              상태 추적, 검색 및 필터링 기능을 포함합니다.
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
            <CardDescription>다양한 UI 패턴 참고용 (차트, 테이블, 칸반, 폼 등)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground mb-4'>
              shadcn/ui 기반의 대시보드 템플릿에서 사용하는 다양한 UI 컴포넌트와 패턴을 확인하세요.
              차트, 데이터 테이블, 칸반 보드, 폼 등을 포함합니다.
            </p>
            <Link href='/library/modules/dashboard'>
              <Button className='w-full' variant='outline'>
                컴포넌트 데모 보기
                <Icons.chevronRight className='ml-2 h-4 w-4' />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className='mt-16 max-w-5xl'>
        <div className='mb-8 text-center'>
          <h2 className='text-2xl font-semibold'>기술 스택</h2>
          <p className='mt-2 text-sm text-muted-foreground'>
            각 기술이 프로젝트에서 어떤 역할을 하고, 어떻게 시너지를 내는지 소개합니다
          </p>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Icons.nextjs className='h-5 w-5 text-primary' />
                Next.js 16
              </CardTitle>
              <CardDescription>풀스택 React 프레임워크</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className='space-y-1 text-sm text-muted-foreground'>
                <li>&middot; App Router, RSC/SSR/SSG</li>
                <li>&middot; 파일 기반 라우팅</li>
                <li>&middot; Server Actions &amp; 스트리밍</li>
              </ul>
              <p className='mt-3 border-t pt-3 text-xs text-muted-foreground'>
                <strong className='text-foreground'>시너지:</strong> React 19 RSC와 TypeScript로
                완전한 엔드투엔드 타입 안전성을 확보하며, App Router로 복잡한 멀티뷰 대시보드를
                직관적으로 구성할 수 있어 채택했습니다.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Icons.react className='h-5 w-5 text-primary' />
                React 19
              </CardTitle>
              <CardDescription>UI 라이브러리</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className='space-y-1 text-sm text-muted-foreground'>
                <li>&middot; 서버 컴포넌트 (RSC)</li>
                <li>&middot; Suspense 기반 스트리밍</li>
                <li>&middot; use() Hook, Actions</li>
              </ul>
              <p className='mt-3 border-t pt-3 text-xs text-muted-foreground'>
                <strong className='text-foreground'>시너지:</strong> Next.js 16 + shadcn/ui +
                TanStack Query의 기반. RSC로 초기 로드를 최소화하고 Suspense로 데이터 스트리밍을
                자연스럽게 처리합니다.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Icons.typescript className='h-5 w-5 text-primary' />
                TypeScript 5.7
              </CardTitle>
              <CardDescription>정적 타입 시스템</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className='space-y-1 text-sm text-muted-foreground'>
                <li>&middot; 엄격 모드 타입 추론</li>
                <li>&middot; IDE 자동완성 및 리팩터링</li>
                <li>&middot; Zod로 런타임 검증 보완</li>
              </ul>
              <p className='mt-3 border-t pt-3 text-xs text-muted-foreground'>
                <strong className='text-foreground'>시너지:</strong> Prisma가 생성한 DB 타입부터
                TanStack Query 키 추론, Zod 스키마까지 전 레이어에서 타입 안전성을 보장해 DX를
                극대화합니다.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Icons.tailwind className='h-5 w-5 text-primary' />
                Tailwind CSS v4
              </CardTitle>
              <CardDescription>유틸리티-퍼스트 CSS</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className='space-y-1 text-sm text-muted-foreground'>
                <li>&middot; 제로 런타임, CSS 전용</li>
                <li>&middot; OKLCH 기반 테마 시스템</li>
                <li>&middot; 임의 값 및 컨테이너 쿼리</li>
              </ul>
              <p className='mt-3 border-t pt-3 text-xs text-muted-foreground'>
                <strong className='text-foreground'>시너지:</strong> shadcn/ui의 스타일링 기반으로,
                CSS-in-JS 없이도 컴포넌트 스타일링이 예측 가능합니다. 10가지 테마를 통해 다크/라이트
                모드를 일관되게 지원합니다.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Icons.components className='h-5 w-5 text-primary' />
                shadcn/ui
              </CardTitle>
              <CardDescription>접근성 높은 UI 컴포넌트</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className='space-y-1 text-sm text-muted-foreground'>
                <li>&middot; Radix 기반 접근성</li>
                <li>&middot; 복사-붙여넣기 소유권</li>
                <li>&middot; 자유로운 커스터마이징</li>
              </ul>
              <p className='mt-3 border-t pt-3 text-xs text-muted-foreground'>
                <strong className='text-foreground'>시너지:</strong> Tailwind v4 + React 19와 완벽
                호환. 컴포넌트 코드를 직접 소유하므로 벤더 락인 없이 필요에 맞게 수정할 수 있어
                선택했습니다.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Icons.arrowsExchange className='h-5 w-5 text-primary' />
                TanStack Query
              </CardTitle>
              <CardDescription>서버 상태 관리</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className='space-y-1 text-sm text-muted-foreground'>
                <li>&middot; 자동 캐싱 &amp; 무효화</li>
                <li>&middot; Suspense 통합</li>
                <li>&middot; Devtools &amp; 낙관적 업데이트</li>
              </ul>
              <p className='mt-3 border-t pt-3 text-xs text-muted-foreground'>
                <strong className='text-foreground'>시너지:</strong> Next.js 서버 프리페치 +
                HydrationBoundary와 결합해 클라이언트 네비게이션 시 즉시 로딩을 구현합니다.
                useMutation으로 Prisma API 응답을 즉시 캐시에 반영합니다.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Icons.prisma className='h-5 w-5 text-primary' />
                Prisma
              </CardTitle>
              <CardDescription>TypeScript ORM</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className='space-y-1 text-sm text-muted-foreground'>
                <li>&middot; 타입 안전 쿼리</li>
                <li>&middot; 자동 마이그레이션 &amp; 시드</li>
                <li>&middot; Prisma Studio GUI</li>
              </ul>
              <p className='mt-3 border-t pt-3 text-xs text-muted-foreground'>
                <strong className='text-foreground'>시너지:</strong> PostgreSQL과 TypeScript 사이의
                타입 브릿지. 스키마에서 생성된 타입이 API 응답까지 전파되어 실수 없는 데이터 접근을
                보장합니다.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Icons.database className='h-5 w-5 text-primary' />
                PostgreSQL
              </CardTitle>
              <CardDescription>관계형 데이터베이스</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className='space-y-1 text-sm text-muted-foreground'>
                <li>&middot; ACID 트랜잭션</li>
                <li>&middot; JSONB 유연 스키마</li>
                <li>&middot; 풀텍스트 검색 &amp; 인덱싱</li>
              </ul>
              <p className='mt-3 border-t pt-3 text-xs text-muted-foreground'>
                <strong className='text-foreground'>시너지:</strong> Prisma와 결합해 견고한 데이터
                무결성을 보장하며, JSONB로 스키마 변경 없이 유연한 데이터 모델 확장이 가능해 실무
                인프라팀 데이터에 적합합니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
