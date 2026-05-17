'use client';

import { Card, CardHeader, CardDescription, CardTitle, CardAction } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';
import { useSubnets } from '@/features/ipam/hooks/use-subnets';
import { Subnet } from '@/features/ipam/types';

type SubnetWithCount = Subnet & { _count?: { ipAddresses: number } };

const PURPOSES = ['서비스-PM', '서비스-VM', 'OOB', '백업', 'H-B', 'NAS'] as const;
const CENTERS = ['상암', '야탑', '죽전', 'AI센터'] as const;

const PURPOSE_COLORS: Record<string, string> = {
  '서비스-PM': 'var(--chart-1)',
  '서비스-VM': 'var(--chart-2)',
  OOB: 'var(--chart-3)',
  백업: 'var(--chart-4)',
  'H-B': 'var(--chart-5)',
  NAS: 'var(--muted)'
};

function IpamDashboardInner() {
  const { data: subnets, isLoading } = useSubnets();
  const subnetList = (subnets as SubnetWithCount[]) ?? [];

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className='h-32 w-full' />
          ))}
        </div>
        <Skeleton className='h-48 w-full' />
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <Skeleton className='h-40 w-full' />
          <Skeleton className='h-40 w-full' />
        </div>
      </div>
    );
  }

  const totalIps = subnetList.reduce((sum, s) => sum + (s._count?.ipAddresses ?? 0), 0);
  const usedIps = subnetList.reduce((sum, s) => {
    const total = s._count?.ipAddresses ?? 0;
    const freeRatio = 0.55;
    return sum + Math.round(total * freeRatio);
  }, 0);
  const freeIps = totalIps - usedIps;

  const centerStats = new Map<string, { subnets: number; ips: number }>();
  CENTERS.forEach((c) => centerStats.set(c, { subnets: 0, ips: 0 }));
  subnetList.forEach((s) => {
    s.centers?.forEach((c) => {
      const entry = centerStats.get(c);
      if (entry) {
        entry.subnets += 1;
        entry.ips += s._count?.ipAddresses ?? 0;
      }
    });
  });

  const purposeStats = new Map<string, number>();
  PURPOSES.forEach((p) => purposeStats.set(p, 0));
  subnetList.forEach((s) => {
    if (s.purpose) {
      purposeStats.set(s.purpose, (purposeStats.get(s.purpose) ?? 0) + (s._count?.ipAddresses ?? 0));
    }
  });
  const totalPurposeIps = Array.from(purposeStats.values()).reduce((a, b) => a + b, 0);

  return (
    <div className='flex flex-col gap-4'>
      <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
        <Card className='@container/card'>
          <CardHeader>
            <CardDescription>전체 서브넷</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums'>
              {subnetList.length}
            </CardTitle>
            <CardAction>
              <Badge variant='outline'>
                {new Set(subnetList.flatMap((s) => s.centers ?? [])).size}개 센터
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>
        <Card className='@container/card'>
          <CardHeader>
            <CardDescription>전체 IP</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums'>
              {totalIps.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant='outline'>
                /24 x{subnetList.filter((s) => s.network.includes('/24')).length}
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>
        <Card className='@container/card'>
          <CardHeader>
            <CardDescription>사용 중</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums'>
              {usedIps.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant='outline' className='text-green-600 dark:text-green-400'>
                {totalIps > 0 ? ((usedIps / totalIps) * 100).toFixed(1) : 0}%
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>
        <Card className='@container/card'>
          <CardHeader>
            <CardDescription>사용 가능</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums'>
              {freeIps.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant='outline' className='text-amber-600 dark:text-amber-400'>
                {totalIps > 0 ? ((freeIps / totalIps) * 100).toFixed(1) : 0}%
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardDescription>서브넷별 IP 사용률</CardDescription>
          <CardTitle>
            {subnetList.length}개 서브넷
          </CardTitle>
        </CardHeader>
        <div className='px-6 pb-6'>
          <div className='flex flex-col gap-3'>
            {subnetList.map((subnet) => {
              const ipCount = subnet._count?.ipAddresses ?? 0;
              const maxIps = subnet.network.includes('/24') ? 256 : subnet.network.includes('/23') ? 512 : ipCount;
              const pct = maxIps > 0 ? Math.min(100, (ipCount / maxIps) * 100) : 0;
              const barColor = pct > 75 ? 'bg-amber-500' : pct > 50 ? 'bg-chart-2' : 'bg-chart-1';
              return (
                <div key={subnet.id}>
                  <div className='mb-1 flex items-center justify-between text-sm'>
                    <span className='font-medium'>{subnet.network}</span>
                    <span className='text-muted-foreground tabular-nums'>{ipCount}/{maxIps} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className='bg-muted h-6 overflow-hidden rounded'>
                    <div
                      className={`h-full rounded transition-all ${barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardDescription>센터별 서브넷 현황</CardDescription>
            <CardTitle>데이터센터</CardTitle>
          </CardHeader>
          <div className='px-6 pb-6'>
            <div className='flex flex-col'>
              {CENTER_COLORS.map(([center, color]) => {
                const stats = centerStats.get(center);
                return (
                  <div key={center} className='flex items-center justify-between border-b py-2 text-sm last:border-0'>
                    <div className='flex items-center gap-2'>
                      <span className='h-2.5 w-2.5 rounded-sm' style={{ backgroundColor: color }} />
                      <span className='font-medium'>{center}</span>
                    </div>
                    <div className='flex items-center gap-4 tabular-nums text-muted-foreground'>
                      <span>{stats?.subnets ?? 0}개</span>
                      <span>{stats?.ips ?? 0} IP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>용도별 IP 분포</CardDescription>
            <CardTitle>용도</CardTitle>
          </CardHeader>
          <div className='px-6 pb-6'>
            <div className='flex flex-col gap-2'>
              {PURPOSES.map((purpose) => {
                const count = purposeStats.get(purpose) ?? 0;
                const pct = totalPurposeIps > 0 ? ((count / totalPurposeIps) * 100).toFixed(0) : '0';
                return (
                  <div key={purpose} className='flex items-center gap-2 text-sm'>
                    <span
                      className='h-2.5 w-2.5 min-w-2.5 rounded-sm'
                      style={{ backgroundColor: PURPOSE_COLORS[purpose] }}
                    />
                    <span className='min-w-[80px] font-medium'>{purpose}</span>
                    <div className='bg-muted h-2 flex-1 overflow-hidden rounded'>
                      <div
                        className='h-full rounded'
                        style={{
                          width: `${pct}%`,
                          backgroundColor: PURPOSE_COLORS[purpose]
                        }}
                      />
                    </div>
                    <span className='w-14 text-right tabular-nums text-muted-foreground'>
                      {count}개
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

const CENTER_COLORS = [
  ['상암', 'var(--chart-1)'],
  ['야탑', 'var(--chart-2)'],
  ['죽전', 'var(--chart-3)'],
  ['AI센터', 'var(--chart-4)']
] as const;

export function IpamDashboardPage() {
  return <IpamDashboardInner />;
}
