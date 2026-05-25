'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const TOAST_VARIANTS = [
  {
    label: 'Default',
    description: '기본 토스트 메시지',
    action: () => toast('기본 알림 메시지입니다.')
  },
  {
    label: 'Success',
    description: '작업 성공을 알리는 메시지',
    action: () => toast.success('작업이 성공적으로 완료되었습니다.')
  },
  {
    label: 'Error',
    description: '오류 발생을 알리는 메시지',
    action: () => toast.error('오류가 발생했습니다. 다시 시도해주세요.')
  },
  {
    label: 'Warning',
    description: '주의가 필요한 메시지',
    action: () => toast.warning('이 작업은 되돌릴 수 없습니다.')
  },
  {
    label: 'Info',
    description: '정보성 메시지',
    action: () => toast.info('새로운 업데이트가 있습니다.')
  },
  {
    label: 'Promise',
    description: '비동기 작업 상태 추적',
    action: () =>
      toast.promise(new Promise((r) => setTimeout(r, 2000)), {
        loading: '데이터를 불러오는 중...',
        success: '데이터 로드 완료!',
        error: '데이터 로드 실패'
      })
  }
];

const TOAST_ADVANCED = [
  {
    label: 'Action Button',
    description: '액션 버튼이 있는 토스트',
    action: () =>
      toast('파일이 업로드되었습니다.', {
        action: { label: '보기', onClick: () => toast.info('파일 뷰어로 이동합니다.') }
      })
  },
  {
    label: 'Undo Action',
    description: '되돌리기 액션',
    action: () =>
      toast.success('항목이 삭제되었습니다.', {
        action: { label: '되돌리기', onClick: () => toast.info('삭제가 취소되었습니다.') }
      })
  },
  {
    label: 'Cancel + Dismiss',
    description: '취소 및 닫기 버튼',
    action: () =>
      toast('파일 업로드 중...', {
        cancel: { label: '취소', onClick: () => toast.info('취소되었습니다.') },
        dismissible: true
      })
  },
  {
    label: 'Duration: 10s',
    description: '10초 동안 유지',
    action: () => toast.info('이 토스트는 10초 동안 표시됩니다.', { duration: 10000 })
  },
  {
    label: 'Rich Content',
    description: '제목과 설명 포함',
    action: () =>
      toast.message('SE Command Center', {
        description: '인프라팀 대시보드 v2.1.0이 출시되었습니다.',
        duration: 5000
      })
  }
];

export function TooltipDemos() {
  return (
    <div className='space-y-8'>
      <Card>
        <CardHeader>
          <CardTitle>Tooltip</CardTitle>
          <CardDescription>
            마우스 호버 시 추가 정보를 표시하는 툴팁입니다. 접근성을 위해 키보드 포커스도
            지원합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-wrap items-center gap-4'>
          <BasicTooltip />
          <RichTooltip />
          <TooltipSides />
          <DelayedTooltip />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Popover</CardTitle>
          <CardDescription>
            클릭 시 표시되는 팝오버입니다. 폼, 메뉴 등 복잡한 콘텐츠를 담을 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-wrap items-start gap-4'>
          <BasicPopover />
          <FormPopover />
          <MenuPopover />
          <AlignedPopovers />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>HoverCard</CardTitle>
          <CardDescription>
            호버 시 카드 형태의 상세 정보를 표시합니다. 링크 미리보기, 프로필 카드 등에 사용됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-wrap items-start gap-4'>
          <ServerHoverCard />
          <UserHoverCard />
          <LinkPreviewHoverCard />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>토스트 메시지 (기본)</CardTitle>
          <CardDescription>
            sonner 기반의 6가지 토스트 타입입니다. 버튼을 클릭하여 확인하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6'>
            {TOAST_VARIANTS.map((v) => (
              <Button
                key={v.label}
                variant='outline'
                onClick={v.action}
                className='flex-col gap-1 h-auto py-3'
              >
                <span className='text-sm font-semibold'>{v.label}</span>
                <span className='text-[10px] text-muted-foreground leading-tight text-center'>
                  {v.description}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>토스트 메시지 (고급)</CardTitle>
          <CardDescription>
            액션 버튼, duration, dismissible, cancel, rich content 등.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {TOAST_ADVANCED.map((v) => (
              <Button
                key={v.label}
                variant='outline'
                onClick={v.action}
                className='flex-col gap-1 h-auto py-3'
              >
                <span className='text-sm font-semibold'>{v.label}</span>
                <span className='text-[10px] text-muted-foreground leading-tight text-center'>
                  {v.description}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BasicTooltip() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant='outline' size='icon'>
          <Icons.help className='h-4 w-4' />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>도움말이 필요하시면 클릭하세요</p>
      </TooltipContent>
    </Tooltip>
  );
}

function RichTooltip() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant='outline'>상세 정보</Button>
      </TooltipTrigger>
      <TooltipContent className='max-w-56'>
        <div className='flex flex-col gap-1'>
          <p className='font-semibold text-xs'>서버 상태 확인</p>
          <p className='text-[10px] leading-tight opacity-90'>
            현재 선택된 서버의 CPU, 메모리, 디스크 사용량을 실시간으로 확인할 수 있습니다.
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

const TOOLTIP_SIDES = ['top', 'bottom', 'left', 'right'] as const;

function TooltipSides() {
  return (
    <div className='flex items-center gap-2'>
      {TOOLTIP_SIDES.map((side) => (
        <Tooltip key={side}>
          <TooltipTrigger asChild>
            <Button variant='outline' size='sm' className='capitalize'>
              {side}
            </Button>
          </TooltipTrigger>
          <TooltipContent side={side}>
            <p>{side} 방향 툴팁</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

function DelayedTooltip() {
  return (
    <Tooltip delayDuration={500}>
      <TooltipTrigger asChild>
        <Button variant='outline'>지연 표시</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>500ms 이후에 표시됩니다</p>
      </TooltipContent>
    </Tooltip>
  );
}

function BasicPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline'>기본 Popover</Button>
      </PopoverTrigger>
      <PopoverContent className='w-64'>
        <div className='space-y-2'>
          <h4 className='font-medium text-sm'>알림 설정</h4>
          <p className='text-xs text-muted-foreground'>
            서버 장애 발생 시 이메일과 Slack으로 알림을 받습니다.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function FormPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline'>폼 Popover</Button>
      </PopoverTrigger>
      <PopoverContent className='w-72'>
        <div className='grid gap-4'>
          <div className='space-y-2'>
            <h4 className='font-medium text-sm'>서버 이름 변경</h4>
            <p className='text-xs text-muted-foreground'>서버의 표시 이름을 변경합니다.</p>
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='server-name'>서버명</Label>
            <Input id='server-name' defaultValue='web-prod-01' className='h-8' />
          </div>
          <Button size='sm' className='w-full'>
            저장
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MenuPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline'>메뉴 Popover</Button>
      </PopoverTrigger>
      <PopoverContent className='w-48 p-1'>
        <div className='flex flex-col'>
          {[
            { label: '상세 보기', icon: Icons.eye },
            { label: '편집', icon: Icons.edit },
            { label: '복제', icon: Icons.clipboardCopy },
            { label: '아카이브', icon: Icons.archive },
            { label: '삭제', icon: Icons.trash }
          ].map((item) => (
            <button
              key={item.label}
              className={cn(
                'flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm',
                'hover:bg-accent hover:text-accent-foreground',
                'transition-colors'
              )}
            >
              <item.icon className='h-4 w-4 shrink-0' />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function AlignedPopovers() {
  return (
    <div className='flex items-center gap-2'>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant='outline' size='sm'>
            시작 정렬
          </Button>
        </PopoverTrigger>
        <PopoverContent align='start' className='w-56'>
          <p className='text-sm'>align=&ldquo;start&rdquo; — 좌측 정렬</p>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant='outline' size='sm'>
            끝 정렬
          </Button>
        </PopoverTrigger>
        <PopoverContent align='end' className='w-56'>
          <p className='text-sm'>align=&ldquo;end&rdquo; — 우측 정렬</p>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function ServerHoverCard() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant='link' className='h-auto p-0'>
          web-prod-01
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className='w-72'>
        <div className='flex items-start gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
            <Icons.serverCog className='h-5 w-5 text-primary' />
          </div>
          <div className='flex-1 space-y-1.5'>
            <h4 className='font-semibold text-sm'>web-prod-01</h4>
            <div className='flex items-center gap-2'>
              <Icons.network className='h-3.5 w-3.5 text-muted-foreground' />
              <span className='font-mono text-xs text-muted-foreground'>10.0.1.24</span>
            </div>
            <Badge variant='secondary' className='mt-1'>
              정상
            </Badge>
            <div className='flex gap-4 pt-1 text-xs text-muted-foreground'>
              <span>CPU 8 Core</span>
              <span>RAM 32 GB</span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

function UserHoverCard() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant='link' className='h-auto p-0'>
          @honggildong
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className='w-72'>
        <div className='flex items-start gap-3'>
          <Avatar className='h-12 w-12'>
            <AvatarFallback className='bg-primary/10 text-primary font-semibold'>
              홍길
            </AvatarFallback>
          </Avatar>
          <div className='flex-1 space-y-1'>
            <div className='flex items-center gap-1.5'>
              <h4 className='font-semibold text-sm'>홍길동</h4>
              <Icons.badgeCheck className='h-4 w-4 text-primary' />
            </div>
            <p className='text-xs text-muted-foreground'>@honggildong</p>
            <p className='text-xs text-muted-foreground pt-0.5'>
              인프라팀 &middot; 시니어 엔지니어
            </p>
            <div className='flex gap-4 pt-1 text-xs'>
              <span className='text-muted-foreground'>
                <span className='font-semibold text-foreground'>128</span> 서버
              </span>
              <span className='text-muted-foreground'>
                <span className='font-semibold text-foreground'>3.2k</span> 작업
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

function LinkPreviewHoverCard() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant='link' className='h-auto p-0'>
          infra-playbook.md
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className='w-80'>
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <Icons.page className='h-4 w-4 text-muted-foreground shrink-0' />
            <h4 className='font-semibold text-sm'>인프라 운영 플레이북</h4>
          </div>
          <p className='text-xs text-muted-foreground leading-relaxed'>
            장애 대응, 배포 프로세스, 모니터링 설정 등 인프라팀 운영에 필요한 표준 운영 절차를
            정리한 문서입니다.
          </p>
          <div className='flex items-center gap-2 pt-1 text-xs text-muted-foreground'>
            <Icons.code className='h-3.5 w-3.5' />
            <span>docs/wiki/infra-playbook.md</span>
            <Icons.externalLink className='h-3.5 w-3.5 ml-auto' />
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
