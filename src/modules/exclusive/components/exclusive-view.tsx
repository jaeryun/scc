'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { premiumFeaturesOptions, accessStatsOptions } from '../api/queries';
import { Icons } from '@/components/icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { PremiumFeature } from '../api/types';

function FeatureCard({ feature }: { feature: PremiumFeature }) {
  const Icon = Icons[feature.icon as keyof typeof Icons];

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
        feature.enabled ? 'border-primary/40 bg-primary/5' : 'border-muted bg-muted/10'
      }`}
    >
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
              feature.enabled ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
            }`}
          >
            {Icon && <Icon className='h-5 w-5' />}
          </div>
          <Badge variant={feature.enabled ? 'default' : 'secondary'}>
            {feature.enabled ? '활성화됨' : 'Pro 전용'}
          </Badge>
        </div>
        <CardTitle className='text-base'>{feature.name}</CardTitle>
        <CardDescription>{feature.description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function HeroBanner() {
  return (
    <div className='relative overflow-hidden rounded-xl border bg-card px-6 py-12 text-center'>
      <div className='absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10' />
      <div className='absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl' />
      <div className='relative'>
        <Icons.sparkles className='mx-auto mb-4 h-8 w-8 text-primary' />
        <h2 className='text-2xl font-bold tracking-tight'>프리미엄 기능</h2>
        <p className='text-muted-foreground mt-2'>
          Pro 플랜에서 사용할 수 있는 고급 기능을 확인하세요
        </p>
      </div>
    </div>
  );
}

function AccessStatusCard() {
  const { data: stats } = useSuspenseQuery(accessStatsOptions());
  const progressPercent = Math.round((stats.featuresEnabled / stats.featuresTotal) * 100);

  return (
    <Card>
      <CardContent className='space-y-4 py-6'>
        <div className='flex items-center justify-between'>
          <h3 className='font-semibold'>접근 상태</h3>
          <Badge variant={stats.hasProAccess ? 'default' : 'secondary'}>
            {stats.userRole} 등급
          </Badge>
        </div>
        <div className='space-y-2'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-muted-foreground'>기능 활성화</span>
            <span className='font-medium'>
              {stats.featuresEnabled} / {stats.featuresTotal}
            </span>
          </div>
          <Progress value={progressPercent} />
          <p className='text-muted-foreground text-xs'>
            {progressPercent === 100
              ? '모든 프리미엄 기능이 활성화되어 있습니다'
              : `${stats.featuresTotal - stats.featuresEnabled}개의 프리미엄 기능이 대기 중입니다`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function UpgradeCTA() {
  return (
    <div className='rounded-xl border bg-card p-6 text-center'>
      <h3 className='text-lg font-semibold'>더 많은 기능이 필요하신가요?</h3>
      <p className='text-muted-foreground mt-1 mb-4'>
        Pro 플랜으로 업그레이드하여 모든 프리미엄 기능을 잠금 해제하세요
      </p>
      <Button size='lg' className='relative overflow-hidden'>
        <span className='relative z-10 flex items-center gap-2'>
          <Icons.sparkles className='h-4 w-4' />
          Pro로 업그레이드
        </span>
        <div className='absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent' />
      </Button>
    </div>
  );
}

export function ExclusiveView() {
  const { data: features } = useSuspenseQuery(premiumFeaturesOptions());

  return (
    <div className='space-y-6'>
      <HeroBanner />

      <div className='grid gap-4 md:grid-cols-3'>
        {features.map((feature) => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <div className='md:col-span-2'>
          <AccessStatusCard />
        </div>
        <div>
          <UpgradeCTA />
        </div>
      </div>
    </div>
  );
}
