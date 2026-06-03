'use client';

import { Suspense } from 'react';
import { useProductById } from '@/modules/products/hooks/use-products';
import type { Product } from '../api/types';
import { notFound } from 'next/navigation';
import ProductForm from './product-form';

type TProductViewPageProps = {
  productId: string;
};

export default function ProductViewPage({ productId }: TProductViewPageProps) {
  if (productId === 'new') {
    return <ProductForm initialData={null} pageTitle='Create New Product' />;
  }

  return (
    <Suspense fallback={<ProductFormSkeleton />}>
      <EditProductView productId={Number(productId)} />
    </Suspense>
  );
}

function EditProductView({ productId }: { productId: number }) {
  const { data } = useProductById(productId);

  if (!data?.success || !data?.product) {
    notFound();
  }

  return <ProductForm initialData={data.product as Product} pageTitle='Edit Product' />;
}

function ProductFormSkeleton() {
  return (
    <div className='flex flex-1 animate-pulse flex-col gap-4'>
      <div className='bg-muted h-10 w-48 rounded' />
      <div className='bg-muted h-48 w-full rounded' />
      <div className='bg-muted h-8 w-24 rounded' />
    </div>
  );
}
