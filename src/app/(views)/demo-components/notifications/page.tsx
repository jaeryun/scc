import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'Dashboard: Notifications'
};

export default function Page() {
  return (
    <PageContainer pageTitle="알림" pageDescription="알림 센터 UI 데모">
      <div className="rounded-lg border border-dashed p-8 text-center">
        <h2 className="text-xl font-semibold">알림 데모</h2>
        <p className="text-muted-foreground mt-2">
          이 페이지는 UI 패턴 참고용 데모입니다.
        </p>
      </div>
    </PageContainer>
  );
}
