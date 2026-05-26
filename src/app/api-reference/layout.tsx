import Link from 'next/link';
import { Icons } from '@/components/icons';
import { ThemeModeToggle } from '@/components/themes/theme-mode-toggle';
import '@/styles/scalar-overrides.css';

export default function ApiReferenceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex min-h-screen flex-col'>
      <header className='sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md'>
        <div className='flex items-center gap-2'>
          <Link
            href='/home'
            className='inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
          >
            <Icons.arrowLeft className='h-4 w-4' />
            SCC로 돌아가기
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
