import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'Auth : Sign In'
};

export default function Page() {
  return (
    <PageContainer pageTitle='Sign In' pageDescription='Sign in to your account'>
      <div className='rounded-lg border border-dashed p-8 text-center'>
        <h2 className='text-xl font-semibold'>Sign In</h2>
        <p className='text-muted-foreground mt-2'>Authentication is currently disabled.</p>
      </div>
    </PageContainer>
  );
}
