import type { Plan, Subscription, Invoice } from './types';

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 0,
    features: ['기본 대시보드', '최대 5명의 팀 멤버', '1GB 저장소', '이메일 지원'],
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29000,
    features: [
      '고급 분석 대시보드',
      '최대 20명의 팀 멤버',
      '10GB 저장소',
      '우선 이메일 지원',
      'API 액세스'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99000,
    features: [
      '전체 기능 대시보드',
      '무제한 팀 멤버',
      '100GB 저장소',
      '전화 및 이메일 지원',
      'API 액세스',
      'SSO 인증',
      '전담 계정 관리자'
    ],
    popular: false
  }
];

const subscription: Subscription = {
  id: 'sub_01',
  planId: 'pro',
  status: 'active',
  currentPeriodEnd: '2026-06-25T00:00:00Z'
};

const invoices: Invoice[] = [
  { id: 'inv_001', amount: 29000, date: '2026-05-01', status: 'paid' },
  { id: 'inv_002', amount: 29000, date: '2026-04-01', status: 'paid' },
  { id: 'inv_003', amount: 29000, date: '2026-03-01', status: 'paid' },
  { id: 'inv_004', amount: 29000, date: '2026-02-01', status: 'paid' },
  { id: 'inv_005', amount: 29000, date: '2026-01-01', status: 'pending' }
];

export async function getPlans(): Promise<Plan[]> {
  return plans;
}

export async function getSubscription(): Promise<Subscription> {
  return subscription;
}

export async function getInvoices(): Promise<Invoice[]> {
  return invoices;
}
