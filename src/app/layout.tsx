import Providers from '@/components/layout/providers';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { Toaster } from '@/components/ui/sonner';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { fontVariables } from '@/components/themes/font.config';
import { DEFAULT_THEME, THEMES } from '@/components/themes/theme.config';
import ThemeProvider from '@/components/themes/theme-provider';
import { InfoSidebar } from '@/components/layout/info-sidebar';
import { InfobarProvider } from '@/components/ui/infobar';
import KBar from '@/components/kbar';
import { cn } from '@/lib/utils';
import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import '../styles/globals.css';

const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b'
};

export const metadata: Metadata = {
  title: '인프라팀 웹 서비스 Core',
  description: 'AI 기반 개발을 위한 일관된 웹 애플리케이션 프레임워크'
};

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get('active_theme')?.value;
  const isValidTheme = THEMES.some((t) => t.value === activeThemeValue);
  const themeToApply = isValidTheme ? activeThemeValue! : DEFAULT_THEME;
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';

  return (
    <html lang='ko' suppressHydrationWarning data-theme={themeToApply}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `
          }}
        />
      </head>
      <body
        className={cn(
          'bg-background overflow-x-hidden overscroll-none font-sans antialiased',
          fontVariables
        )}
      >
        <a
          href='#main-content'
          className='sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md'
        >
          주 콘텐츠로 건너뛰기
        </a>
        <NextTopLoader color='var(--primary)' showSpinner={false} />
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
          enableColorScheme
        >
          <Providers activeThemeValue={themeToApply}>
            <KBar>
              <SidebarProvider defaultOpen={defaultOpen}>
                <AppSidebar />
                <SidebarInset id='main-content'>
                  <Header />
                  <InfobarProvider defaultOpen={false}>
                    <div className='flex-1'>
                      <NuqsAdapter>{children}</NuqsAdapter>
                    </div>
                    <InfoSidebar side='right' />
                  </InfobarProvider>
                </SidebarInset>
              </SidebarProvider>
            </KBar>
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
