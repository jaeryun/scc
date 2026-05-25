import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const sections = [
  {
    title: '디바이스',
    description: '서버, 스위치, 스토리지 등 모든 물리 장비의 인벤토리',
    href: '/dcim/devices'
  },
  {
    title: 'IPAM',
    description: '프리픽스, IP 주소 할당/반납, 호스트명 검색',
    href: '/dcim/ipam'
  }
];

export default function DcimPage() {
  return (
    <PageContainer pageTitle='DCIM' pageDescription='Data Center Infrastructure Management'>
      <div className='grid gap-6'>
        <div className='rounded-lg border bg-card p-6'>
          <h2 className='text-lg font-semibold mb-2'>NetBox Source of Truth</h2>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            이 시스템의 모든 DCIM 데이터는 <strong>NetBox Community v4.6.1</strong>을 Source of
            Truth로 사용합니다. Device, Interface, Cable, IPAM 데이터는 NetBox에만 저장되며, SCC는
            이를 조회/조작하는 대시보드 역할을 합니다. SCC 자체 DB에는 UI 설정과 캐시만 존재합니다.
          </p>
        </div>

        <Separator />

        <div className='grid gap-4 sm:grid-cols-2'>
          {sections.map((s) => (
            <Link key={s.href} href={s.href}>
              <Card className='h-full transition-colors hover:bg-muted/50 cursor-pointer'>
                <CardHeader>
                  <CardTitle className='text-base'>{s.title}</CardTitle>
                  <CardDescription>{s.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        <Separator />

        <div className='rounded-lg border bg-card p-6'>
          <h2 className='text-lg font-semibold mb-2'>제공 기능</h2>
          <ul className='text-sm text-muted-foreground space-y-1 list-disc list-inside leading-relaxed'>
            <li>Device 목록 조회, 필터링(Role/Site/Status), 정렬, 생성/수정/삭제</li>
            <li>Device별 Interface 및 Cable 연결 정보 확인</li>
            <li>Prefix 목록 및 IP 주소 할당 현황</li>
            <li>IP 자동 할당 및 반납</li>
            <li>L2 캐시(Prisma)를 통한 빠른 조회, NetBox 장애 시 만료 캐시 폴백</li>
          </ul>
        </div>
      </div>
    </PageContainer>
  );
}
