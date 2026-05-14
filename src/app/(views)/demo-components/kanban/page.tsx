import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'Dashboard : Kanban view'
};

export default function Page() {
  return (
    <PageContainer pageTitle="Kanban 보드" pageDescription="드래그 앤 드롭 보드 UI 데모">
      <div className="rounded-lg border border-dashed p-8 text-center">
        <h2 className="text-xl font-semibold">Kanban 보드 데모</h2>
        <p className="text-muted-foreground mt-2">
          이 페이지는 UI 패턴 참고용 데모입니다.
        </p>
      </div>
    </PageContainer>
  );
}
