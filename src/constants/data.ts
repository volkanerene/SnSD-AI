import { NavItem } from '@/types';

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

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
    title: 'Contractors',
    url: '/dashboard/contractors',
    icon: 'users',
    shortcut: ['c', 'c'],
    isActive: false,
    items: []
  },
  {
    title: 'Evaluations',
    url: '/dashboard/evaluations',
    icon: 'fileText',
    shortcut: ['e', 'e'],
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
    items: [
      {
        title: 'Users',
        url: '/dashboard/admin/users',
        icon: 'users',
        shortcut: ['a', 'u']
      },
      {
        title: 'Tenants',
        url: '/dashboard/admin/tenants',
        icon: 'building',
        shortcut: ['a', 't']
      }
    ]
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
