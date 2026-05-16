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
        title: 'IP Addresses',
        url: '/demo-ipam/ip-addresses',
        icon: 'server',
        isActive: false,
        items: []
      }
    ]
  },
  {
    label: 'Components',
    items: [
      {
        title: 'Overview',
        url: '/demo-components/overview',
        icon: 'dashboard',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      },
      {
        title: 'Products',
        url: '/demo-components/products',
        icon: 'product',
        shortcut: ['p', 'p'],
        isActive: false,
        items: []
      },
      {
        title: 'Users',
        url: '/demo-components/users',
        icon: 'teams',
        shortcut: ['u', 'u'],
        isActive: false,
        items: []
      },
      {
        title: 'Kanban',
        url: '/demo-components/kanban',
        icon: 'kanban',
        shortcut: ['k', 'k'],
        isActive: false,
        items: []
      },
      {
        title: 'Chat',
        url: '/demo-components/chat',
        icon: 'chat',
        shortcut: ['c', 'c'],
        isActive: false,
        items: []
      }
    ]
  },
  {
    label: 'Elements',
    items: [
      {
        title: 'Forms',
        url: '#',
        icon: 'forms',
        isActive: true,
        items: [
          {
            title: 'Basic Form',
            url: '/demo-components/forms/basic',
            icon: 'forms',
            shortcut: ['f', 'f']
          },
          {
            title: 'Multi-Step Form',
            url: '/demo-components/forms/multi-step',
            icon: 'forms'
          },
          {
            title: 'Sheet & Dialog',
            url: '/demo-components/forms/sheet-form',
            icon: 'forms'
          },
          {
            title: 'Advanced Patterns',
            url: '/demo-components/forms/advanced',
            icon: 'forms'
          }
        ]
      },
      {
        title: 'React Query',
        url: '/demo-components/react-query',
        icon: 'code',
        isActive: false,
        items: []
      },
      {
        title: 'Icons',
        url: '/demo-components/elements/icons',
        icon: 'palette',
        isActive: false,
        items: []
      },
      {
        title: 'Notifications',
        url: '/demo-components/notifications',
        icon: 'notification',
        isActive: false,
        items: []
      }
    ]
  }
];
