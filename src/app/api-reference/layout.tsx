import Link from 'next/link';
import '@/styles/scalar-overrides.css';

export default function ApiReferenceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex min-h-screen flex-col'>
      <div className='sticky top-0 z-50 flex items-center gap-2 border-b bg-background px-4 py-2'>
        <Link
          href='/home'
          className='flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='m15 18-6-6 6-6' />
          </svg>
          대시보드로
        </Link>
        <span className='text-sm font-medium'>API Reference</span>
      </div>
      <main className='flex-1'>{children}</main>
    </div>
  );
}
