import type { Metadata } from 'next';
import PageContainer from '@/components/layout/page-container';
import { SwitchPortView } from './switch-port-view';

export const metadata: Metadata = {
  title: 'Switch Port Mapping',
  description: '네트워크 스위치 포트-호스트 매핑 현황'
};

export default function SwitchMappingPage() {
  return (
    <PageContainer
      pageTitle='Switch Port Mapping'
      pageDescription='IB / SAN / UTP 스위치 포트 연결 현황'
    >
      <SwitchPortView />
    </PageContainer>
  );
}
