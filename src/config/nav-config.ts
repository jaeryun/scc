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
    label: 'IPAM',
    items: [
      {
        title: 'IPAM Dashboard',
        url: '/demo-ipam',
        icon: 'dashboard',
        isActive: false,
        shortcut: ['i', 'i'],
        items: []
      },
      {
        title: 'Subnets',
        url: '/demo-ipam/subnets',
        icon: 'network',
        isActive: false,
        items: []
      },
      {
        title: 'IP Assign/Release',
        url: '/demo-ipam/ip-addresses',
        icon: 'server',
        isActive: false,
        items: []
      }
    ]
  },
  {
    label: '순수 UI',
    items: [
      {
        title: 'Kanban',
        url: '/demo-ui/kanban',
        icon: 'kanban',
        isActive: false,
        shortcut: ['k', 'k'],
        items: []
      },
      {
        title: 'Chat',
        url: '/demo-ui/chat',
        icon: 'chat',
        isActive: false,
        shortcut: ['c', 'c'],
        items: []
      },
      {
        title: 'Forms',
        url: '/demo-ui/forms/basic',
        icon: 'forms',
        isActive: true,
        items: [
          {
            title: 'Basic Form',
            url: '/demo-ui/forms/basic',
            icon: 'forms',
            shortcut: ['f', 'f']
          },
          {
            title: 'Multi-Step Form',
            url: '/demo-ui/forms/multi-step',
            icon: 'forms'
          },
          {
            title: 'Sheet & Dialog',
            url: '/demo-ui/forms/sheet-form',
            icon: 'forms'
          },
          {
            title: 'Advanced Patterns',
            url: '/demo-ui/forms/advanced',
            icon: 'forms'
          }
        ]
      },
      {
        title: 'Icons',
        url: '/demo-ui/icons',
        icon: 'palette',
        isActive: false,
        items: []
      },
      {
        title: 'Notifications',
        url: '/demo-ui/notifications',
        icon: 'notification',
        isActive: false,
        items: []
      },
      {
        title: 'Profile',
        url: '/demo-ui/profile',
        icon: 'teams',
        isActive: false,
        items: []
      }
    ]
  },
  {
    label: 'UI + Logic',
    items: [
      {
        title: 'Overview',
        url: '/demo-logic/overview',
        icon: 'dashboard',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      },
      {
        title: 'Products',
        url: '/demo-logic/products',
        icon: 'product',
        isActive: false,
        shortcut: ['p', 'p'],
        items: []
      },
      {
        title: 'Users',
        url: '/demo-logic/users',
        icon: 'teams',
        isActive: false,
        shortcut: ['u', 'u'],
        items: []
      },
      {
        title: 'Grid Dashboard',
        url: '/demo-logic/grid-dashboard',
        icon: 'dashboard',
        isActive: false,
        items: []
      },
      {
        title: 'Switch Mapping',
        url: '/demo-logic/switch-mapping',
        icon: 'network',
        isActive: false,
        items: []
      },
      {
        title: 'React Query',
        url: '/demo-logic/react-query',
        icon: 'code',
        isActive: false,
        items: []
      },
      {
        title: 'Billing',
        url: '/demo-logic/billing',
        icon: 'billing',
        isActive: false,
        items: []
      },
      {
        title: 'Exclusive',
        url: '/demo-logic/exclusive',
        icon: 'sparkles',
        isActive: false,
        items: []
      },
      {
        title: 'Workspaces',
        url: '/demo-logic/workspaces',
        icon: 'workspace',
        isActive: false,
        items: []
      }
    ]
  },
  {
    label: 'API Reference',
    items: [
      {
        title: 'SemaphoreUI',
        url: '/api-reference/semaphore',
        icon: 'serverBolt',
        isActive: false,
        access: { requireOrg: true },
        items: []
      }
    ]
  }
];
