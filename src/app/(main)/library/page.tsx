import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '라이브러리',
  description: 'SCC 웹 개발을 위한 재사용 가능한 라이브러리'
};

const reasons = [
  {
    title: '일관된 개발 패턴',
    description:
      '모든 모듈이 동일한 구조(types → service → queries)를 따릅니다. 어떤 모듈을 열어도 데이터 흐름을 바로 이해할 수 있습니다.',
    icon: Icons.code
  },
  {
    title: 'Demo / Production 분리',
    description:
      '데모 모듈은 mock-store로 즉시 동작하고, 운영 모듈은 Prisma로 실제 DB에 연결됩니다. service.ts만 교체하면 데모를 운영으로 전환할 수 있습니다.',
    icon: Icons.gitMerge
  },
  {
    title: '살아있는 문서',
    description:
      '정적 문서 대신 실제 동작하는 코드입니다. 컴포넌트와 모듈이 항상 최신 상태로 유지되므로 문서와 코드의 불일치가 발생하지 않습니다.',
    icon: Icons.bookmark
  },
  {
    title: '온보딩 가속',
    description:
      '신규 팀원이 라이브러리를 탐색하면 폼, 테이블, 차트, 쿼리 패턴을 실행 가능한 예제로 바로 학습할 수 있습니다.',
    icon: Icons.teams
  },
  {
    title: '격리된 프로토타이핑',
    description:
      '운영 데이터에 영향을 주지 않고 새 기능을 mock 환경에서 실험할 수 있습니다. API 라우트 없이 service.ts → mock-store로 완전히 독립적입니다.',
    icon: Icons.serverBolt
  },
  {
    title: '공통 인프라 공유',
    description:
      'shadcn/ui, TanStack Query, Prisma, Zod 등 검증된 라이브러리를 일관된 방식으로 사용합니다. 팀 전체가 동일한 도구를 같은 패턴으로 다룹니다.',
    icon: Icons.stack3
  }
];

export default function LibraryPage() {
  return (
    <PageContainer
      pageTitle='라이브러리'
      pageDescription='SCC 웹 개발팀을 위한 재사용 가능한 컴포넌트, 모듈, API 문서 컬렉션입니다.'
    >
      <div className='space-y-10 max-w-4xl'>
        <div className='prose prose-neutral dark:prose-invert max-w-none'>
          <p className='text-base text-muted-foreground leading-relaxed'>
            SCC Command Center는 <strong>인프라팀 내부 운영 도구</strong>입니다. 이 라이브러리는
            단순한 데모 페이지가 아니라, 팀이 일관된 방식으로 기능을 개발할 수 있도록{' '}
            <strong>개발 패턴을 표준화하고 재사용성을 극대화</strong>하기 위해 설계되었습니다.
          </p>
        </div>

        <div>
          <h3 className='text-lg font-semibold mb-4'>이 라이브러리가 존재하는 이유</h3>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {reasons.map((item) => (
              <Card key={item.title}>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-base'>
                    <item.icon className='h-5 w-5 text-primary shrink-0' />
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className='text-sm leading-relaxed'>
                    {item.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className='text-lg font-semibold mb-4'>무엇이 있는지</h3>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            <Link href='/library/components' className='group'>
              <Card className='h-full hover:border-primary/50 hover:shadow-md transition-all'>
                <CardHeader>
                  <div className='mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors'>
                    <Icons.palette className='h-6 w-6' />
                  </div>
                  <CardTitle>컴포넌트 (UI)</CardTitle>
                  <CardDescription>shadcn/ui 기반 순수 UI 컴포넌트 모음</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className='space-y-1 text-sm text-muted-foreground'>
                    <li>칸반 보드</li>
                    <li>채팅 인터페이스</li>
                    <li>폼 (Basic, Multi-Step, Sheet)</li>
                    <li>아이콘 갤러리</li>
                    <li>알림 시스템</li>
                    <li>대화상자, Tooltip, Popover</li>
                    <li>코드 블록, 테이블, 차트</li>
                    <li>진행률, 스켈레톤, 프로필</li>
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
                  <CardTitle>모듈 (UI + Data)</CardTitle>
                  <CardDescription>데이터 연동이 포함된 실전 모듈</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className='space-y-1 text-sm text-muted-foreground'>
                    <li>대시보드 (위젯, DnD 레이아웃)</li>
                    <li>제품 / 사용자 CRUD</li>
                    <li>React Query 데이터 페칭</li>
                    <li>Billing, Workspaces</li>
                  </ul>
                  <div className='mt-3 flex flex-wrap gap-1.5'>
                    <Badge variant='secondary' className='text-xs'>
                      Demo
                    </Badge>
                    <Badge variant='outline' className='text-xs'>
                      Mock Store
                    </Badge>
                  </div>
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
                  <CardDescription>외부 시스템 통합 API 문서</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className='space-y-1 text-sm text-muted-foreground'>
                    <li>SemaphoreUI API</li>
                    <li>Scalar 인터랙티브 문서</li>
                    <li>OpenAPI 3.0 스펙 뷰어</li>
                  </ul>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        <div className='space-y-4'>
          <h3 className='text-lg font-semibold'>개발 패턴</h3>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Demo 모듈 (mock-store)</CardTitle>
              <CardDescription>
                라이브러리에서 데모로 보여주는 모듈입니다. 데이터는 메모리에만 존재하며 서버 재시작
                시 초기화됩니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className='bg-muted p-4 rounded-lg text-xs overflow-auto'>
                {`src/modules/<name>/api/
├── types.ts          # 타입 정의
├── mock-store.ts     # in-memory 저장소 + seed
├── service.ts        # mock-store re-export
├── queries.ts        # service 함수 호출
└── mutations.ts      # service 함수 호출`}
              </pre>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Production 모듈 (Prisma)</CardTitle>
              <CardDescription>
                실제 운영 데이터를 다루는 모듈입니다. src/app/api/ 아래 Route Handler를 통해 Prisma
                DB에 연결됩니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className='bg-muted p-4 rounded-lg text-xs overflow-auto'>
                {`src/modules/<name>/api/
├── types.ts           # 타입 정의
├── schemas.ts         # Zod 검증
├── *-handlers.ts      # Prisma CRUD 로직
├── service.ts         # apiClient() 호출
├── queries.ts         # service 함수 호출
└── mutations.ts       # service 함수 호출

src/app/api/<name>/
├── route.ts           # Route Handler → handlers → Prisma
└── [id]/route.ts`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
