'use client';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useCurrentView } from '@/hooks/use-current-view';
import { views } from '@/config/views';
import { Icons } from '../icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const mockUser = {
  imageUrl: '',
  id: 'daniel.yun',
  primary_team: '인프라팀',
  secondary_team: '데이터센터팀',
  role: 'admin'
};

export default function AppSidebar({
  viewIconMap = new Map(),
}: {
  viewIconMap?: Map<string, string>;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const view = useCurrentView();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // If no view detected, default to first view
  const effectiveView = view ?? views[0];
  const navItems = effectiveView.navItems;

  // Get the current view's icon (DB override or default from views.ts)
  const currentViewIcon = viewIconMap.get(effectiveView.id) || effectiveView.icon;
  const CurrentViewIconComponent = currentViewIcon
    ? (Icons[currentViewIcon as keyof typeof Icons] as React.ComponentType<{ className?: string }>)
    : null;

  // Prevent hydration mismatch by not rendering dynamic content until mounted
  if (!mounted) {
    return (
      <Sidebar collapsible='icon' role='navigation' aria-label='Main navigation'>
        <SidebarHeader className='group-data-[collapsible=icon]:pt-4'>
          <div className='flex w-full items-center gap-2 rounded-md px-2 py-2'>
            <div className='flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
              <Icons.settings className='size-4' />
            </div>
            <div className='grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden'>
              <span className='truncate font-semibold'>SE Command Center</span>
              <span className='truncate text-xs text-muted-foreground'>Loading...</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className='overflow-x-hidden'>
          <div className='p-4'>
            <div className='bg-muted h-4 w-32 animate-pulse rounded' />
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible='icon' role='navigation' aria-label='Main navigation'>
      <SidebarHeader className='group-data-[collapsible=icon]:pt-4'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className='flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0'
              aria-label='뷰 전환'
            >
              <div className='flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                {CurrentViewIconComponent && <CurrentViewIconComponent className='size-4' />}
              </div>
              <div className='grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden'>
                <span className='truncate font-semibold' suppressHydrationWarning>SE Command Center</span>
                <span className='truncate text-xs text-muted-foreground' suppressHydrationWarning>
                  {effectiveView.label}
                </span>
              </div>
              <Icons.chevronsUpDown className='ml-auto size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden' />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-56 rounded-lg'
            side='bottom'
            align='start'
            sideOffset={4}
          >
            <DropdownMenuLabel className='px-2 py-1.5 text-sm font-medium text-muted-foreground'>
              뷰 전환
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {views.map((viewItem) => {
                const itemIconKey = viewIconMap.get(viewItem.id) || viewItem.icon;
                const ItemIcon = itemIconKey
                  ? (Icons[itemIconKey as keyof typeof Icons] as React.ComponentType<{ className?: string }>)
                  : null;
                const isActive = viewItem.id === effectiveView.id;
                return (
                  <DropdownMenuItem
                    key={viewItem.id}
                    className='cursor-pointer'
                    onClick={() => router.push(`/${viewItem.id}`)}
                  >
                    {ItemIcon && (
                      <ItemIcon className='mr-2 h-4 w-4 text-muted-foreground' />
                    )}
                    <span>{viewItem.label}</span>
                    {isActive && (
                      <Icons.check className='ml-auto h-4 w-4 text-primary' />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup className='py-0'>
          <SidebarMenu>
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon ? (Icons[item.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>) : null;
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                    <Link href={item.href}>
                      {Icon && <Icon className="size-4" />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                >
                  <Avatar className='h-8 w-8 rounded-lg'>
                    <AvatarImage src={mockUser.imageUrl} alt={mockUser.id} />
                    <AvatarFallback className='rounded-lg'>
                      {mockUser.id.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-semibold'>{mockUser.id}</span>
                    <span className='truncate text-xs'>{mockUser.primary_team} &gt; {mockUser.secondary_team} · {mockUser.role}</span>
                  </div>
                  <Icons.chevronsDown className='ml-auto size-4' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                side='bottom'
                align='end'
                sideOffset={4}
              >
                <DropdownMenuLabel className='p-0 font-normal'>
                  <div className='px-1 py-1.5'>
                    <div className='flex items-center gap-2'>
                      <Avatar className='h-8 w-8 rounded-lg'>
                        <AvatarImage src={mockUser.imageUrl} alt={mockUser.id} />
                        <AvatarFallback className='rounded-lg'>
                          {mockUser.id.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className='grid flex-1 text-left text-sm leading-tight'>
                        <span className='truncate font-semibold'>{mockUser.id}</span>
                        <span className='truncate text-xs'>{mockUser.primary_team} &gt; {mockUser.secondary_team} · {mockUser.role}</span>
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => router.push('/')}>
                    <Icons.dashboard className='mr-2 h-4 w-4' />
                    Home
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Icons.logout className='mr-2 h-4 w-4' />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
