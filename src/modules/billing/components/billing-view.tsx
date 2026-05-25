'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { plansQueryOptions, subscriptionQueryOptions, invoicesQueryOptions } from '../api/queries';
import type { Plan, Invoice } from '../api/types';

function statusVariant(status: string) {
  switch (status) {
    case 'active':
    case 'paid':
      return 'default' as const;
    case 'cancelled':
      return 'secondary' as const;
    case 'expired':
    case 'overdue':
      return 'destructive' as const;
    case 'pending':
      return 'outline' as const;
    default:
      return 'secondary' as const;
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'active':
      return '활성';
    case 'cancelled':
      return '취소됨';
    case 'expired':
      return '만료됨';
    case 'paid':
      return '결제완료';
    case 'pending':
      return '대기중';
    case 'overdue':
      return '연체';
    default:
      return status;
  }
}

function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(amount);
}

function CurrentPlanCard() {
  const { data: subscription, isLoading } = useQuery(subscriptionQueryOptions());
  const { data: plans } = useQuery(plansQueryOptions());

  const currentPlan = plans?.find((p) => p.id === subscription?.planId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>현재 요금제</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='bg-muted h-5 w-32 animate-pulse rounded' />
          <div className='bg-muted h-4 w-40 animate-pulse rounded' />
          <div className='bg-muted h-4 w-48 animate-pulse rounded' />
        </CardContent>
      </Card>
    );
  }

  if (!subscription) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>현재 요금제</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='flex items-center gap-2'>
          <span className='text-xl font-bold'>{currentPlan?.name ?? subscription.planId}</span>
          <Badge variant={statusVariant(subscription.status)}>
            {statusLabel(subscription.status)}
          </Badge>
        </div>
        <p className='text-muted-foreground text-sm'>
          갱신일: {formatDate(subscription.currentPeriodEnd)}
        </p>
        {currentPlan && (
          <p className='text-muted-foreground text-sm'>
            {currentPlan.price === 0 ? '무료' : `월 ${formatCurrency(currentPlan.price)}`}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function AvailablePlans() {
  const { data: plans, isLoading } = useQuery(plansQueryOptions());

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>요금제</h3>
        <div className='grid gap-4 md:grid-cols-3'>
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className='space-y-3 pt-6'>
                <div className='bg-muted h-5 w-20 animate-pulse rounded' />
                <div className='bg-muted h-8 w-24 animate-pulse rounded' />
                <div className='space-y-2'>
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className='bg-muted h-3 w-full animate-pulse rounded' />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!plans) return null;

  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold'>요금제</h3>
      <div className='grid gap-4 md:grid-cols-3'>
        {plans.map((plan: Plan) => (
          <Card key={plan.id} className={plan.popular ? 'border-primary' : ''}>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle>{plan.name}</CardTitle>
                {plan.popular && <Badge>인기</Badge>}
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-2xl font-bold'>
                {plan.price === 0 ? '무료' : formatCurrency(plan.price)}
                {plan.price > 0 && (
                  <span className='text-muted-foreground text-sm font-normal'>/월</span>
                )}
              </p>
              <ul className='space-y-2'>
                {plan.features.map((feature) => (
                  <li key={feature} className='text-muted-foreground text-sm'>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className='w-full'
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() =>
                  toast.success(`${plan.name} 요금제가 선택되었습니다.`, {
                    description: '실제 결제는 아직 준비 중입니다.'
                  })
                }
              >
                {plan.price === 0 ? '시작하기' : '구독하기'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PaymentHistory() {
  const { data: invoices, isLoading } = useQuery(invoicesQueryOptions());

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>결제 내역</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='flex items-center justify-between'>
              <div className='bg-muted h-4 w-32 animate-pulse rounded' />
              <div className='bg-muted h-4 w-20 animate-pulse rounded' />
              <div className='bg-muted h-4 w-16 animate-pulse rounded' />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!invoices) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>결제 내역</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-0'>
          {invoices.map((invoice: Invoice) => (
            <div
              key={invoice.id}
              className='flex items-center justify-between border-b py-3 last:border-0'
            >
              <span className='text-sm'>{formatDate(invoice.date)}</span>
              <span className='text-sm font-medium'>{formatCurrency(invoice.amount)}</span>
              <Badge variant={statusVariant(invoice.status)}>{statusLabel(invoice.status)}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function BillingView() {
  return (
    <div className='space-y-6'>
      <CurrentPlanCard />
      <AvailablePlans />
      <PaymentHistory />
    </div>
  );
}
