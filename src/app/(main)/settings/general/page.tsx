import PageContainer from '@/components/layout/page-container';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '설정 - 일반',
  description: '일반적인 애플리케이션 설정을 관리합니다.'
};

export default function SettingsGeneralPage() {
  return (
    <PageContainer pageTitle='일반 설정' pageDescription='일반적인 애플리케이션 설정을 관리합니다.'>
      <div className='text-muted-foreground flex flex-1 items-center justify-center rounded-lg border border-dashed p-8'>
        <p>준비 중입니다.</p>
      </div>
    </PageContainer>
  );
}
