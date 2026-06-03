import type { PremiumFeature, AccessStats } from './types';

const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    id: 'advanced-analytics',
    name: '고급 분석',
    description:
      '실시간 대시보드와 커스텀 리포트로 데이터를 시각화하세요. AI 기반 인사이트를 제공합니다.',
    icon: 'barChart',
    theme: 'vercel',
    enabled: true
  },
  {
    id: 'priority-support',
    name: '우선 지원',
    description: '전담 지원팀이 24시간 내 응답을 보장합니다. SLA 99.9% 가동 시간을 유지합니다.',
    icon: 'badgeCheck',
    theme: 'supabase',
    enabled: true
  },
  {
    id: 'custom-integration',
    name: '커스텀 연동',
    description: 'API와 웹훅으로 외부 시스템과 연동하세요. Slack, GitHub, Jira 등과 통합됩니다.',
    icon: 'network',
    theme: 'zen',
    enabled: true
  },
  {
    id: 'team-collaboration',
    name: '팀 협업',
    description:
      '무제한 팀 멤버와 실시간 공동 편집 기능을 제공합니다. 역할 기반 접근 제어가 포함됩니다.',
    icon: 'teams',
    theme: 'neobrutualism',
    enabled: false
  },
  {
    id: 'white-label',
    name: '화이트 라벨',
    description: '자체 도메인, 로고, 브랜딩으로 완전한 화이트 라벨 경험을 제공합니다.',
    icon: 'palette',
    theme: 'claude',
    enabled: false
  },
  {
    id: 'audit-log',
    name: '감사 로그',
    description: '모든 사용자 활동과 시스템 변경 사항을 추적합니다. 규정 준수 보고서 자동 생성.',
    icon: 'logs',
    theme: 'mono',
    enabled: false
  }
];

export async function getPremiumFeatures(): Promise<PremiumFeature[]> {
  return PREMIUM_FEATURES;
}

export async function getAccessStats(): Promise<AccessStats> {
  return {
    userRole: 'Pro',
    hasProAccess: true,
    featuresEnabled: 3,
    featuresTotal: 6
  };
}
