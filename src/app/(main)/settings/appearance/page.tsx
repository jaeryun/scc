import PageContainer from '@/components/layout/page-container';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '설정 - 외형',
  description: '테마 및 외형 설정을 관리합니다.'
};

export default function SettingsAppearancePage() {
  return (
    <PageContainer pageTitle='외형 설정' pageDescription='테마 및 외형 설정을 관리합니다.'>
      <div className='text-muted-foreground flex flex-1 items-center justify-center rounded-lg border border-dashed p-8'>
        <p>준비 중입니다.</p>
      </div>
    </PageContainer>
  );
}
