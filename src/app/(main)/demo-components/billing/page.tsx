import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'Dashboard : Billing'
};

export default function Page() {
  return (
    <PageContainer pageTitle='Billing' pageDescription='Manage your subscription'>
      <div className='rounded-lg border border-dashed p-8 text-center'>
        <h2 className='text-xl font-semibold'>Billing</h2>
        <p className='text-muted-foreground mt-2'>Billing features are currently disabled.</p>
      </div>
    </PageContainer>
  );
}
