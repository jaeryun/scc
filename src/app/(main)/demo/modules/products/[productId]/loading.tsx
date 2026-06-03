import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className='flex flex-1 animate-pulse flex-col gap-4 p-6'>
      <div className='bg-muted h-8 w-48 rounded' />
      <div className='bg-muted h-4 w-96 rounded' />
      <div className='bg-muted h-96 w-full rounded-lg' />
    </div>
  );
}
