import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { getAllSpecs, getSpecById } from '@/modules/api-reference/api/registry';
import QuickStartGuide from '@/modules/api-reference/components/quick-start-guide';
import { ScalarLoadingSkeleton } from '@/modules/api-reference/components/scalar-loading';

export async function generateMetadata({
  params
}: {
  params: Promise<{ service: string }>;
}): Promise<Metadata> {
  const { service } = await params;
  const spec = getSpecById(service);
  if (!spec) return { title: 'Not Found' };
  return {
    title: `${spec.title} API Reference`,
    description: spec.description
  };
}

export async function generateStaticParams() {
  return getAllSpecs().map((spec) => ({ service: spec.id }));
}

const DynamicScalarViewer = dynamic(
  () => import('@/modules/api-reference/components/scalar-viewer'),
  { ssr: false, loading: () => <ScalarLoadingSkeleton /> }
);

export default async function ServicePage({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  const spec = getSpecById(service);
  if (!spec) notFound();

  return (
    <PageContainer pageTitle={`${spec.title} API Reference`} pageDescription={spec.description}>
      <QuickStartGuide spec={spec} />
      <DynamicScalarViewer specUrl={spec.specUrl} />
    </PageContainer>
  );
}
