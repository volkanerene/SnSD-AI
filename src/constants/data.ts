import { NavItem } from '@/types';

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: []
  },
  {
    title: 'EvrenGPT',
    url: '#',
    icon: 'bot',
    isActive: false,
    items: [
      {
        title: 'Contractors',
        url: '/dashboard/evren-gpt/contractors',
        icon: 'users',
        shortcut: ['e', 'c']
      },
      {
        title: 'Evaluations',
        url: '#',
        icon: 'fileText',
        items: [
          {
            title: 'FRM32 Evaluations',
            url: '/dashboard/evren-gpt/evaluations/frm32'
          },
          {
            title: 'FRM33 Evaluations',
            url: '/dashboard/evren-gpt/evaluations/frm33'
          },
          {
            title: 'FRM34 Evaluations',
            url: '/dashboard/evren-gpt/evaluations/frm34'
          },
          {
            title: 'FRM35 Evaluations',
            url: '/dashboard/evren-gpt/evaluations/frm35'
          }
        ]
      }
    ]
  },
  {
    title: 'MarcelGPT',
    url: '/dashboard/marcel-gpt',
    icon: 'bot',
    shortcut: ['m', 'g'],
    isActive: false,
    items: []
  },
  {
    title: 'SafetyBud',
    url: '/dashboard/safety-bud',
    icon: 'shield',
    shortcut: ['s', 'b'],
    isActive: false,
    items: []
  },
  {
    title: 'Payments',
    url: '/dashboard/payments',
    icon: 'billing',
    shortcut: ['p', 'p'],
    isActive: false,
    items: []
  },
  {
    title: 'My Evaluations',
    url: '/dashboard/my-evaluations',
    icon: 'fileCheck',
    shortcut: ['m', 'e'],
    isActive: false,
    items: []
  },
  {
    title: 'Administration',
    url: '#',
    icon: 'shield',
    isActive: false,
    adminOnly: true,
    requiredPermission: 'users.read', // At least one admin permission
    items: [
      {
        title: 'Users',
        url: '/dashboard/admin/users',
        icon: 'users',
        shortcut: ['a', 'u'],
        requiredPermission: 'users.read'
      },
      {
        title: 'Roles & Permissions',
        url: '/dashboard/admin/roles',
        icon: 'shield',
        shortcut: ['a', 'r'],
        requiredPermission: 'roles.read'
      },
      {
        title: 'Invitations',
        url: '/dashboard/admin/invitations',
        icon: 'mail',
        shortcut: ['a', 'i'],
        requiredPermission: 'users.invite'
      },
      {
        title: 'Tenants',
        url: '/dashboard/admin/tenants',
        icon: 'building',
        shortcut: ['a', 't'],
        requiredPermission: 'tenants.read'
      },
      {
        title: 'Subscription',
        url: '/dashboard/admin/subscription',
        icon: 'creditCard',
        shortcut: ['a', 's'],
        requiredPermission: 'tenants.read'
      }
    ]
  },
  {
    title: 'Team',
    url: '/dashboard/team',
    icon: 'users',
    shortcut: ['t', 't'],
    isActive: false,
    requiredPermission: 'tenants.users.manage',
    items: []
  },
  {
    title: 'Account',
    url: '#',
    icon: 'user',
    isActive: true,
    items: [
      {
        title: 'Profile',
        url: '/dashboard/profile',
        icon: 'userPen',
        shortcut: ['p', 'r']
      },
      {
        title: 'Settings',
        url: '/dashboard/settings',
        icon: 'settings',
        shortcut: ['s', 's']
      }
    ]
  }
];

export interface SaleUser {
  id: number;
  name: string;
  email: string;
  amount: string;
  image: string;
  initials: string;
}

export const recentSalesData: SaleUser[] = [
  {
    id: 1,
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    image: 'https://api.slingacademy.com/public/sample-users/1.png',
    initials: 'OM'
  },
  {
    id: 2,
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/2.png',
    initials: 'JL'
  },
  {
    id: 3,
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
    image: 'https://api.slingacademy.com/public/sample-users/3.png',
    initials: 'IN'
  },
  {
    id: 4,
    name: 'William Kim',
    email: 'will@email.com',
    amount: '+$99.00',
    image: 'https://api.slingacademy.com/public/sample-users/4.png',
    initials: 'WK'
  },
  {
    id: 5,
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/5.png',
    initials: 'SD'
  }
];
