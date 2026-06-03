import { NavGroup } from '@/types';

/**
 * Navigation configuration with RBAC support
 *
 * IMPORTANT: AppSidebar uses `src/config/views.ts` for sidebar navigation.
 * This file is used for the Cmd+K (kbar) global search and RBAC-filtered nav.
 * Keep both files in sync when adding new top-level routes.
 *
 * RBAC Access Control:
 * Each navigation item can have an `access` property that controls visibility
 * based on permissions, plans, features, roles, and organization context.
 *
 * Examples:
 *
 * 1. Require organization:
 *    access: { requireOrg: true }
 *
 * 2. Require specific permission:
 *    access: { requireOrg: true, permission: 'org:teams:manage' }
 *
 * 3. Require specific plan:
 *    access: { plan: 'pro' }
 *
 * 4. Require specific feature:
 *    access: { feature: 'premium_access' }
 *
 * 5. Require specific role:
 *    access: { role: 'admin' }
 *
 * 6. Multiple conditions (all must be true):
 *    access: { requireOrg: true, permission: 'org:teams:manage', plan: 'pro' }
 *
 * Note: The `visible` function is deprecated but still supported for backward compatibility.
 * Use the `access` property for new items.
 */
export const navGroups: NavGroup[] = [
  {
    label: '데모',
    items: [
      {
        title: '소개',
        url: '/demo',
        icon: 'info',
        isActive: false,
        shortcut: ['l', 'l'],
        items: []
      },
      {
        title: '컴포넌트(UI)',
        url: '/demo/components',
        icon: 'palette',
        isActive: false,
        items: [
          {
            title: '소개',
            url: '/demo/components',
            icon: 'info'
          },
          {
            title: '칸반',
            url: '/demo/components/kanban',
            icon: 'kanban',
            shortcut: ['k', 'k']
          },
          {
            title: '채팅',
            url: '/demo/components/chat',
            icon: 'chat',
            shortcut: ['c', 'c']
          },
          {
            title: '폼',
            url: '/demo/components/forms/basic',
            icon: 'forms',
            isActive: true,
            items: [
              {
                title: '기본 폼',
                url: '/demo/components/forms/basic',
                icon: 'forms',
                shortcut: ['f', 'f']
              },
              {
                title: '다단계 폼',
                url: '/demo/components/forms/multi-step',
                icon: 'forms'
              },
              {
                title: '시트 & 다이얼로그',
                url: '/demo/components/forms/sheet-form',
                icon: 'forms'
              },
              {
                title: '고급 패턴',
                url: '/demo/components/forms/advanced',
                icon: 'forms'
              }
            ]
          },
          {
            title: '아이콘',
            url: '/demo/components/icons',
            icon: 'palette'
          },
          {
            title: '알림',
            url: '/demo/components/notifications',
            icon: 'notification'
          },
          {
            title: '대화상자',
            url: '/demo/components/dialog',
            icon: 'components'
          },
          {
            title: '코드 블록',
            url: '/demo/components/code-block',
            icon: 'code'
          },
          {
            title: '탭 & 아코디언',
            url: '/demo/components/tabs-accordion',
            icon: 'hierarchy'
          },
          {
            title: '테이블',
            url: '/demo/components/table',
            icon: 'listTree'
          },
          {
            title: '드롭다운 & 컨텍스트',
            url: '/demo/components/dropdown',
            icon: 'ellipsis'
          },
          {
            title: '커맨드 팔레트',
            url: '/demo/components/command',
            icon: 'logo'
          },
          {
            title: '차트',
            url: '/demo/components/chart',
            icon: 'barChart'
          },
          {
            title: '프로필',
            url: '/demo/components/profile',
            icon: 'teams'
          },
          {
            title: '오버레이',
            url: '/demo/components/tooltip',
            icon: 'info'
          },
          {
            title: '정적 페이지',
            url: '/demo/components/static-pages',
            icon: 'page',
            isActive: false,
            items: [
              {
                title: '소개',
                url: '/demo/components/static-pages',
                icon: 'info'
              },
              {
                title: '404 Not Found',
                url: '/demo/components/static-pages/not-found',
                icon: 'slash'
              },
              {
                title: '에러 페이지',
                url: '/demo/components/static-pages/error',
                icon: 'warning'
              }
            ]
          }
        ]
      },
      {
        title: '모듈(UI + Data)',
        url: '/demo/modules',
        icon: 'code',
        isActive: false,
        items: [
          {
            title: '소개',
            url: '/demo/modules',
            icon: 'info'
          },
          {
            title: '대시보드',
            url: '/demo/modules/dashboard',
            icon: 'dashboard',
            shortcut: ['d', 'd']
          },
          {
            title: '제품',
            url: '/demo/modules/products',
            icon: 'product',
            shortcut: ['p', 'p']
          },
          {
            title: '사용자',
            url: '/demo/modules/users',
            icon: 'teams',
            shortcut: ['u', 'u']
          },
          {
            title: 'React Query',
            url: '/demo/modules/react-query',
            icon: 'code'
          },
          {
            title: '결제',
            url: '/demo/modules/billing',
            icon: 'billing'
          },
          {
            title: '특별',
            url: '/demo/modules/exclusive',
            icon: 'sparkles'
          },
          {
            title: '워크스페이스',
            url: '/demo/modules/workspaces',
            icon: 'workspace'
          }
        ]
      }
    ]
  },
  {
    label: 'API',
    items: [
      {
        title: 'API Reference',
        url: '/api-reference',
        icon: 'api',
        isActive: false,
        items: []
      }
    ]
  }
];
