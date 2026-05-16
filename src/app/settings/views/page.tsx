import PageContainer from "@/components/layout/page-container";
import ViewSettingsForm from "@/features/view-settings/components/view-settings-form";

export default function SettingsViewsPage() {
  return (
    <PageContainer
      pageTitle="뷰 설정"
      pageDescription="각 뷰의 로고 아이콘을 관리합니다."
    >
      <ViewSettingsForm />
    </PageContainer>
  );
}
