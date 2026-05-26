import Link from 'next/link';
import { Icons } from '@/components/icons';
import { ThemeModeToggle } from '@/components/themes/theme-mode-toggle';
import '@/styles/scalar-overrides.css';

export default function ApiReferenceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex min-h-screen flex-col'>
      <header className='sticky top-0 z-50 flex h-11 items-center justify-between border-b border-white/10 bg-[#111111] px-4'>
        <div className='flex items-center gap-2'>
          <Link
            href='/home'
            className='inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white'
          >
            <Icons.arrowLeft className='h-3.5 w-3.5' />
            SCC
          </Link>
        </div>
        <div className='flex items-center gap-2'>
          <ThemeModeToggle />
        </div>
      </header>
      <main className='flex-1'>{children}</main>
    </div>
  );
}
