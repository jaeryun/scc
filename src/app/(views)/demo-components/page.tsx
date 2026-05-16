import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import Link from 'next/link';

const demos = [
  {
    title: '대시보드',
    href: '/demo-components/overview',
    icon: Icons.dashboard,
    description: '통계 카드, 차트, 그래프를 활용한 대시보드 레이아웃 패턴',
    features: ['통계 카드', '막대 그래프', '원형 그래프', '영역 그래프'],
    components: ['Card', 'Badge', 'Recharts']
  },
  {
    title: '상품 관리',
    href: '/demo-components/products',
    icon: Icons.product,
    description: 'React Query와 nuqs를 활용한 데이터 테이블 및 CRUD 패턴',
    features: ['서버 사이드 필터링', '페이지네이션', '정렬', '검색'],
    components: ['TanStack Table', 'React Query', 'Dialog', 'Form']
  },
  {
    title: '사용자 관리',
    href: '/demo-components/users',
    icon: Icons.teams,
    description: '사용자 목록 조회 및 관리 기능 데모',
    features: ['사용자 목록', '역할 관리', '상태 필터링'],
    components: ['TanStack Table', 'Badge', 'Avatar']
  },
  {
    title: '칸반 보드',
    href: '/demo-components/kanban',
    icon: Icons.kanban,
    description: '드래그 앤 드롭이 가능한 칸반 보드 UI 패턴',
    features: ['드래그 앤 드롭', '상태 변경', '보드 관리'],
    components: ['@dnd-kit', 'Card', 'Badge']
  },
  {
    title: '채팅',
    href: '/demo-components/chat',
    icon: Icons.chat,
    description: '실시간 메시징 UI 컴포넌트 패턴',
    features: ['메시지 버블', '대화 목록', '메시지 입력'],
    components: ['ScrollArea', 'Avatar', 'Input']
  },
  {
    title: '폼',
    href: '/demo-components/forms/basic',
    icon: Icons.forms,
    description: '다양한 폼 패턴과 유효성 검증 데모',
    features: ['기본 폼', '고급 폼', '다단계 폼', '시트 폼'],
    components: ['TanStack Form', 'Zod', 'Input', 'Select']
  },
  {
    title: '아이콘',
    href: '/demo-components/elements/icons',
    icon: Icons.palette,
    description: '프로젝트에서 사용 가능한 모든 아이콘 목록',
    features: ['아이콘 검색', '카테고리별 분류', '크기 조절'],
    components: ['@tabler/icons-react']
  },
  {
    title: '알림',
    href: '/demo-components/notifications',
    icon: Icons.notification,
    description: '알림 센터 및 토스트 메시지 패턴',
    features: ['실시간 알림', '읽음 처리', '알림 필터링'],
    components: ['Sonner', 'Popover', 'Badge']
  }
];

export default function DemoComponentsPage() {
  return (
    <div className='container mx-auto py-8 px-4'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold tracking-tight'>컴포넌트 데모 모음</h1>
        <p className='text-muted-foreground mt-2 text-lg'>
          이 프로젝트에서 사용하는 다양한 UI 컴포넌트와 패턴을 확인할 수 있습니다.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {demos.map((demo) => {
          const Icon = demo.icon;
          return (
            <Link href={demo.href} key={demo.title} className='block group'>
              <Card className='h-full hover:border-primary/50 hover:shadow-md transition-all duration-200'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-xl'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors'>
                      <Icon className='h-5 w-5' />
                    </div>
                    {demo.title}
                  </CardTitle>
                  <CardDescription className='text-sm leading-relaxed'>
                    {demo.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div>
                    <h4 className='text-sm font-semibold mb-2'>주요 기능</h4>
                    <div className='flex flex-wrap gap-2'>
                      {demo.features.map((feature) => (
                        <span
                          key={feature}
                          className='inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground'
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className='text-sm font-semibold mb-2'>주요 컴포넌트</h4>
                    <div className='flex flex-wrap gap-2'>
                      {demo.components.map((component) => (
                        <span
                          key={component}
                          className='inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium'
                        >
                          {component}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className='mt-12 p-6 rounded-lg border border-dashed bg-muted/50'>
        <h2 className='text-lg font-semibold mb-2'>기술 스택</h2>
        <p className='text-muted-foreground text-sm mb-4'>
          모든 데모는 다음 기술을 기반으로 구현되어 있습니다:
        </p>
        <div className='flex flex-wrap gap-2'>
          {['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS', 'shadcn/ui', 'TanStack Query', 'TanStack Table', 'TanStack Form'].map(
            (tech) => (
              <span
                key={tech}
                className='inline-flex items-center rounded-full bg-background border px-3 py-1 text-sm font-medium'
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
