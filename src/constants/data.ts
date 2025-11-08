import { NavItem } from '@/types';

const isMarcelEnabled = process.env.NEXT_PUBLIC_ENABLE_MARCEL_GPT === 'true';
const isSafetyBudEnabled = process.env.NEXT_PUBLIC_ENABLE_SAFETY_BUD === 'true';

const showMarcelMenu = isMarcelEnabled || process.env.NODE_ENV !== 'production';
const showSafetyBudMenu =
  isSafetyBudEnabled || process.env.NODE_ENV !== 'production';

//Info: The following data is used for the sidebar navigation and Cmd K bar.
const baseNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    requiredPermission: 'pages.view_dashboard',
    items: []
  },
  {
    title: 'Contractors',
    url: '/dashboard/contractors',
    icon: 'users',
    isActive: false,
    shortcut: ['c', 't'],
    requiredPermission: 'evren_gpt.view_contractors',
    items: []
  },
  {
    title: 'Evaluations',
    url: '/dashboard/evaluations',
    icon: 'fileCheck',
    isActive: false,
    shortcut: ['e', 'v'],
    requiredPermission: 'evren_gpt.view_evaluations',
    items: []
  },
  {
    title: 'Submissions',
    url: '/dashboard/submissions',
    icon: 'fileCheck',
    isActive: false,
    shortcut: ['s', 'u'],
    requiredPermission: 'modules.access_evren_gpt',
    items: []
  },
  {
    title: 'EvrenGPT',
    url: '#',
    icon: 'bot',
    isActive: false,
    requiredPermission: 'modules.access_evren_gpt',
    items: [
      {
        title: 'FRM32',
        url: '/dashboard/evren-gpt/frm32',
        icon: 'fileText',
        shortcut: ['f', '2'],
        requiredPermission: 'evaluations.fill_frm32'
      },
      {
        title: 'FRM33',
        url: '/dashboard/evren-gpt/frm33',
        icon: 'fileText',
        shortcut: ['f', '3'],
        requiredPermission: 'evaluations.fill_frm33'
      },
      {
        title: 'FRM34',
        url: '/dashboard/evren-gpt/frm34',
        icon: 'fileText',
        shortcut: ['f', '4'],
        requiredPermission: 'evaluations.fill_frm34'
      },
      {
        title: 'FRM35',
        url: '/dashboard/evren-gpt/frm35',
        icon: 'fileText',
        shortcut: ['f', '5'],
        requiredPermission: 'evaluations.fill_frm35'
      }
    ]
  },
  {
    title: 'MarcelGPT',
    url: '#',
    icon: 'video',
    isActive: false,
    requiredPermission: 'marcel_gpt.access',
    items: [
      {
        title: 'Video Generator',
        url: '/dashboard/marcel-gpt',
        icon: 'video',
        shortcut: ['m', 'v'],
        requiredPermission: 'marcel_gpt.access'
      },
      {
        title: 'Video Library',
        url: '/dashboard/marcel-gpt/library',
        icon: 'video',
        shortcut: ['m', 'l'],
        requiredPermission: 'marcel_gpt.view_library'
      },
      {
        title: 'Training Builder',
        url: '/dashboard/marcel-gpt/training',
        icon: 'fileText',
        shortcut: ['m', 't'],
        requiredPermission: 'marcel_gpt.view_training'
      },
      {
        title: 'My Videos',
        url: '/dashboard/marcel-gpt/my-videos',
        icon: 'video',
        shortcut: ['m', 'm'],
        requiredPermission: 'marcel_gpt.access'
      }
    ]
  },
  {
    title: 'SafetyBud',
    url: '/dashboard/safety-bud',
    icon: 'shield',
    shortcut: ['s', 'b'],
    isActive: false,
    requiredPermission: 'modules.access_safety_bud',
    items: []
  },
  {
    title: 'Payments',
    url: '/dashboard/payments',
    icon: 'billing',
    shortcut: ['p', 'p'],
    isActive: false,
    requiredPermission: 'pages.view_payments',
    items: []
  },
  {
    title: 'My Evaluations',
    url: '/dashboard/my-evaluations',
    icon: 'fileCheck',
    shortcut: ['m', 'e'],
    isActive: false,
    requiredPermission: 'evaluations.read',
    items: []
  },
  {
    title: 'Administration',
    url: '#',
    icon: 'shield',
    isActive: false,
    adminOnly: true,
    requiredPermission: 'pages.view_admin_panel',
    items: [
      {
        title: 'Users',
        url: '/dashboard/admin/users',
        icon: 'users',
        shortcut: ['a', 'u'],
        requiredPermission: 'pages.view_users'
      },
      {
        title: 'Roles & Permissions',
        url: '/dashboard/admin/roles',
        icon: 'shield',
        shortcut: ['a', 'r'],
        requiredPermission: 'pages.view_roles'
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
        requiredPermission: 'pages.view_tenants'
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

export const navItems: NavItem[] = baseNavItems.filter((item) => {
  if (item.title === 'MarcelGPT' && !showMarcelMenu) {
    return false;
  }
  if (item.title === 'SafetyBud' && !showSafetyBudMenu) {
    return false;
  }
  return true;
});

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
