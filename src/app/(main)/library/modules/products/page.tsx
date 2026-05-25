import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import ProductListingPage from '@/modules/products/components/product-listing';
import { searchParamsCache } from '@/lib/searchparams';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import { SearchParams } from 'nuqs/server';
import { productInfoContent } from '@/config/infoconfig';

export const metadata = {
  title: 'Dashboard: 상품'
};

type pageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: pageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      pageTitle='상품'
      pageDescription='상품 관리 (React Query + nuqs 테이블 패턴)'
      infoContent={productInfoContent}
      pageHeaderAction={
        <Link
          href='/library/modules/products/new'
          className={cn(buttonVariants(), 'text-xs md:text-sm')}
        >
          <Icons.add className='mr-2 h-4 w-4' /> 새 상품 추가
        </Link>
      }
    >
      <ProductListingPage />
    </PageContainer>
  );
}
