'use client';

import { useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

export function TabsAccordionDemos() {
  return (
    <div className='flex flex-col gap-8'>
      <Card>
        <CardHeader>
          <CardTitle>Tabs</CardTitle>
          <CardDescription>
            shadcn/ui Tabs 컴포넌트로 콘텐츠를 탭으로 구분하여 표시합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-6'>
            <div>
              <h3 className='mb-2 text-sm font-medium'>기본 탭</h3>
              <Tabs defaultValue='server'>
                <TabsList>
                  <TabsTrigger value='server'>서버 정보</TabsTrigger>
                  <TabsTrigger value='network'>네트워크</TabsTrigger>
                  <TabsTrigger value='logs'>로그</TabsTrigger>
                </TabsList>
                <TabsContent value='server' className='mt-4'>
                  <div className='rounded-lg border p-4'>
                    <div className='grid grid-cols-2 gap-3 text-sm'>
                      <div>
                        <span className='text-muted-foreground'>호스트명</span>
                        <p className='font-medium'>prod-web-01</p>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>IP 주소</span>
                        <p className='font-medium'>10.0.1.42</p>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>CPU</span>
                        <p className='font-medium'>Intel Xeon E5-2680 v4 @ 2.40GHz</p>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>메모리</span>
                        <p className='font-medium'>64GB DDR4 ECC</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value='network' className='mt-4'>
                  <div className='rounded-lg border p-4'>
                    <div className='grid grid-cols-2 gap-3 text-sm'>
                      <div>
                        <span className='text-muted-foreground'>IP 주소</span>
                        <p className='font-medium'>10.0.1.42/24</p>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>게이트웨이</span>
                        <p className='font-medium'>10.0.1.1</p>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>DNS</span>
                        <p className='font-medium'>8.8.8.8, 8.8.4.4</p>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>인터페이스</span>
                        <p className='font-medium'>eth0 (10Gbps)</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value='logs' className='mt-4'>
                  <div className='flex flex-col gap-2 rounded-lg border p-4 text-sm'>
                    <div className='flex gap-3'>
                      <span className='shrink-0 text-muted-foreground'>14:32:01</span>
                      <span>nginx 재시작 완료</span>
                    </div>
                    <div className='flex gap-3'>
                      <span className='shrink-0 text-muted-foreground'>14:28:15</span>
                      <span>디스크 사용량 85% — 정리 스크립트 실행</span>
                    </div>
                    <div className='flex gap-3'>
                      <span className='shrink-0 text-muted-foreground'>14:15:00</span>
                      <span>SSL 인증서 갱신 성공 (만료: 2026-08-15)</span>
                    </div>
                    <div className='flex gap-3'>
                      <span className='shrink-0 text-muted-foreground'>13:58:42</span>
                      <span>커널 보안 패치 적용 — 재부팅 예정</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div>
              <h3 className='mb-2 text-sm font-medium'>아이콘이 있는 탭</h3>
              <Tabs defaultValue='server'>
                <TabsList>
                  <TabsTrigger value='server'>
                    <Icons.server className='size-4' />
                    서버 정보
                  </TabsTrigger>
                  <TabsTrigger value='network'>
                    <Icons.network className='size-4' />
                    네트워크
                  </TabsTrigger>
                  <TabsTrigger value='logs'>
                    <Icons.logs className='size-4' />
                    로그
                  </TabsTrigger>
                </TabsList>
                <TabsContent value='server' className='mt-4'>
                  <div className='rounded-lg border p-4 text-sm text-muted-foreground'>
                    아이콘과 함께 탭 트리거를 렌더링하여 시각적 구분을 강화할 수 있습니다.
                  </div>
                </TabsContent>
                <TabsContent value='network' className='mt-4'>
                  <div className='rounded-lg border p-4 text-sm text-muted-foreground'>
                    네트워크 탭에는{' '}
                    <code className='rounded bg-muted px-1 py-0.5 text-xs'>Icons.network</code>{' '}
                    아이콘이 사용되었습니다.
                  </div>
                </TabsContent>
                <TabsContent value='logs' className='mt-4'>
                  <div className='rounded-lg border p-4 text-sm text-muted-foreground'>
                    로그 탭에는{' '}
                    <code className='rounded bg-muted px-1 py-0.5 text-xs'>Icons.logs</code>{' '}
                    아이콘이 사용되었습니다.
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div>
              <h3 className='mb-2 text-sm font-medium'>세로 탭</h3>
              <Tabs defaultValue='server' orientation='vertical' className='flex gap-4'>
                <TabsList className='h-auto flex-col'>
                  <TabsTrigger value='server' className='justify-start'>
                    <Icons.server className='size-4' />
                    서버 정보
                  </TabsTrigger>
                  <TabsTrigger value='network' className='justify-start'>
                    <Icons.network className='size-4' />
                    네트워크
                  </TabsTrigger>
                  <TabsTrigger value='logs' className='justify-start'>
                    <Icons.logs className='size-4' />
                    로그
                  </TabsTrigger>
                </TabsList>
                <div className='flex-1'>
                  <TabsContent value='server' className='mt-0'>
                    <div className='rounded-lg border p-4 text-sm text-muted-foreground'>
                      세로 방향 탭은 사이드 내비게이션이나 설정 패널에서 유용합니다.
                    </div>
                  </TabsContent>
                  <TabsContent value='network' className='mt-0'>
                    <div className='rounded-lg border p-4 text-sm text-muted-foreground'>
                      orientation=&quot;vertical&quot; 속성으로 세로 레이아웃을 적용합니다.
                    </div>
                  </TabsContent>
                  <TabsContent value='logs' className='mt-0'>
                    <div className='rounded-lg border p-4 text-sm text-muted-foreground'>
                      TabsList에 flex-col 클래스를 추가하여 세로 정렬합니다.
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accordion</CardTitle>
          <CardDescription>
            shadcn/ui Accordion 컴포넌트로 접고 펼칠 수 있는 콘텐츠 패널을 구현합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-6'>
            <div>
              <h3 className='mb-2 text-sm font-medium'>FAQ 스타일</h3>
              <Accordion type='single' collapsible className='w-full'>
                <AccordionItem value='faq-1'>
                  <AccordionTrigger>서비스 점검 시간은?</AccordionTrigger>
                  <AccordionContent>
                    정기 점검은 매월 둘째 주 일요일 02:00 ~ 06:00 (KST)에 진행됩니다. 긴급 점검이
                    필요한 경우 사전 공지를 통해 안내드립니다.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value='faq-2'>
                  <AccordionTrigger>장애 발생 시 대응 절차는?</AccordionTrigger>
                  <AccordionContent>
                    장애 발생 시 1차로 모니터링 시스템 알림이 전파되며, 당직자가 초기 대응을
                    시작합니다. 심각도에 따라 온콜 엔지니어가 에스컬레이션되어 대응팀이 구성됩니다.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value='faq-3'>
                  <AccordionTrigger>서버 스펙 변경은 어떻게?</AccordionTrigger>
                  <AccordionContent>
                    서버 스펙 변경은 변경 관리 프로세스를 통해 승인 후 진행됩니다. 변경 요청 티켓을
                    생성하고 인프라팀 검토를 거쳐 반영됩니다.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div>
              <h3 className='mb-2 text-sm font-medium'>인프라 설정</h3>
              <Accordion type='single' collapsible defaultValue='infra-1' className='w-full'>
                <AccordionItem value='infra-1'>
                  <AccordionTrigger>네트워크 설정</AccordionTrigger>
                  <AccordionContent>
                    <div className='flex flex-col gap-2 text-sm'>
                      <div className='flex justify-between rounded-md bg-muted px-3 py-2'>
                        <span className='text-muted-foreground'>VLAN ID</span>
                        <span className='font-medium'>100</span>
                      </div>
                      <div className='flex justify-between rounded-md bg-muted px-3 py-2'>
                        <span className='text-muted-foreground'>서브넷</span>
                        <span className='font-medium'>10.0.0.0/16</span>
                      </div>
                      <div className='flex justify-between rounded-md bg-muted px-3 py-2'>
                        <span className='text-muted-foreground'>MTU</span>
                        <span className='font-medium'>1500</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value='infra-2'>
                  <AccordionTrigger>보안 정책</AccordionTrigger>
                  <AccordionContent>
                    <div className='flex flex-col gap-2 text-sm'>
                      <div className='flex items-center gap-2 rounded-md bg-muted px-3 py-2'>
                        <Icons.shield className='size-4 text-muted-foreground shrink-0' />
                        <span>방화벽 인바운드: SSH(22), HTTPS(443)만 허용</span>
                      </div>
                      <div className='flex items-center gap-2 rounded-md bg-muted px-3 py-2'>
                        <Icons.shield className='size-4 text-muted-foreground shrink-0' />
                        <span>Fail2Ban 활성화: 5회 실패 시 30분 차단</span>
                      </div>
                      <div className='flex items-center gap-2 rounded-md bg-muted px-3 py-2'>
                        <Icons.shield className='size-4 text-muted-foreground shrink-0' />
                        <span>로그 감사: 모든 접근 기록을 중앙 로그 서버로 전송</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value='infra-3'>
                  <AccordionTrigger>백업 설정</AccordionTrigger>
                  <AccordionContent>
                    <div className='flex flex-col gap-2 text-sm'>
                      <div className='flex justify-between rounded-md bg-muted px-3 py-2'>
                        <span className='text-muted-foreground'>주기</span>
                        <span className='font-medium'>매일 03:00 (KST)</span>
                      </div>
                      <div className='flex justify-between rounded-md bg-muted px-3 py-2'>
                        <span className='text-muted-foreground'>보관 기간</span>
                        <span className='font-medium'>30일</span>
                      </div>
                      <div className='flex justify-between rounded-md bg-muted px-3 py-2'>
                        <span className='text-muted-foreground'>대상</span>
                        <span className='font-medium'>/data, /etc, 데이터베이스 덤프</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Collapsible</CardTitle>
          <CardDescription>
            shadcn/ui Collapsible 컴포넌트로 접을 수 있는 콘텐츠 영역을 만듭니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-6'>
            <CollapsibleDemo />
            <CollapsibleWithChevron />
            <NestedCollapsible />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CollapsibleDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <h3 className='mb-2 text-sm font-medium'>기본 Collapsible</h3>
      <Collapsible open={open} onOpenChange={setOpen} className='w-full'>
        <div className='flex items-center justify-between rounded-lg border px-4 py-3'>
          <div>
            <p className='text-sm font-medium'>서버 상태 상세</p>
            <p className='text-xs text-muted-foreground'>
              prod-web-01 — 마지막 점검: 2026-05-25 14:30
            </p>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant='ghost' size='sm'>
              {open ? '접기' : '상세 정보 보기'}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className='mt-2 rounded-lg border p-4'>
          <div className='grid grid-cols-2 gap-3 text-sm'>
            <div>
              <span className='text-muted-foreground'>CPU 사용률</span>
              <p className='font-medium'>42%</p>
            </div>
            <div>
              <span className='text-muted-foreground'>메모리 사용률</span>
              <p className='font-medium'>68%</p>
            </div>
            <div>
              <span className='text-muted-foreground'>디스크 I/O</span>
              <p className='font-medium'>124 MB/s</p>
            </div>
            <div>
              <span className='text-muted-foreground'>업타임</span>
              <p className='font-medium'>47일 3시간</p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function CollapsibleWithChevron() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <h3 className='mb-2 text-sm font-medium'>Chevron 아이콘 회전</h3>
      <Collapsible open={open} onOpenChange={setOpen} className='w-full'>
        <CollapsibleTrigger asChild>
          <Button variant='outline' className='w-full justify-between'>
            <span className='text-sm'>네트워크 인터페이스 목록</span>
            <Icons.chevronDown
              className={cn(
                'size-4 shrink-0 transition-transform duration-200',
                open && 'rotate-180'
              )}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className='mt-2 rounded-lg border p-4'>
          <div className='flex flex-col gap-2 text-sm'>
            <div className='flex items-center justify-between rounded-md bg-muted px-3 py-2'>
              <span className='font-medium'>eth0</span>
              <span className='text-muted-foreground'>10.0.1.42/24 — UP</span>
            </div>
            <div className='flex items-center justify-between rounded-md bg-muted px-3 py-2'>
              <span className='font-medium'>eth1</span>
              <span className='text-muted-foreground'>192.168.0.10/24 — UP</span>
            </div>
            <div className='flex items-center justify-between rounded-md bg-muted px-3 py-2'>
              <span className='font-medium'>lo</span>
              <span className='text-muted-foreground'>127.0.0.1/8 — UP</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function NestedCollapsible() {
  return (
    <div>
      <h3 className='mb-2 text-sm font-medium'>중첩 Collapsible</h3>
      <Collapsible className='rounded-lg border'>
        <div className='px-4 py-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Icons.folder className='size-4 text-muted-foreground shrink-0' />
              <span className='text-sm font-medium'>인프라 설정</span>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant='ghost' size='icon' className='size-8'>
                <Icons.chevronDown className='size-4' />
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
        <CollapsibleContent>
          <div className='border-t px-4 py-3'>
            <div className='flex flex-col gap-2'>
              <InfoItem label='네트워크' icon={Icons.network}>
                <div className='flex flex-col gap-2 pl-6'>
                  <NestedInfoItem label='VLAN 설정'>
                    VLAN 100, 200 — 트렁크 포트: eth0
                  </NestedInfoItem>
                  <NestedInfoItem label='라우팅'>
                    기본 게이트웨이: 10.0.1.1, OSPF 활성화
                  </NestedInfoItem>
                </div>
              </InfoItem>
              <InfoItem label='보안' icon={Icons.shield}>
                <div className='flex flex-col gap-2 pl-6'>
                  <NestedInfoItem label='방화벽'>
                    iptables 기반 — 인바운드 22, 443만 허용
                  </NestedInfoItem>
                  <NestedInfoItem label='접근 제어'>
                    RBAC 기반 — 인프라팀, 개발팀 권한 분리
                  </NestedInfoItem>
                </div>
              </InfoItem>
              <InfoItem label='모니터링' icon={Icons.activity}>
                <div className='flex flex-col gap-2 pl-6'>
                  <NestedInfoItem label='메트릭'>
                    Prometheus + Grafana — 15초 간격 수집
                  </NestedInfoItem>
                  <NestedInfoItem label='알림'>
                    Slack, 이메일 연동 — 심각도 기반 에스컬레이션
                  </NestedInfoItem>
                </div>
              </InfoItem>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function InfoItem({
  label,
  icon: Icon,
  children
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Collapsible>
      <div className='rounded-md'>
        <div className='flex items-center justify-between px-3 py-2'>
          <div className='flex items-center gap-2'>
            <Icon className='size-4 text-muted-foreground shrink-0' />
            <span className='text-sm'>{label}</span>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant='ghost' size='icon' className='size-7'>
              <Icons.chevronDown className='size-3.5' />
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>
      <CollapsibleContent>
        <div className='px-3 pb-2'>{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function NestedInfoItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='rounded bg-muted px-3 py-2 text-sm'>
      <span className='text-muted-foreground'>{label}</span>
      <p className='font-medium'>{children}</p>
    </div>
  );
}
