import type { Profile, ROLE_LEVELS } from '@/types/api';

/**
 * Role-based access control utilities
 */

export const ROLES = {
  SNSD_ADMIN: 0,
  COMPANY_ADMIN: 1,
  HSE_MANAGER: 2,
  HSE_SPECIALIST: 3,
  CONTRACTOR: 4
} as const;

export type RoleLevel = (typeof ROLES)[keyof typeof ROLES];

/**
 * Check if user has permission based on role level
 * Lower numbers = higher permissions
 */
export function hasPermission(
  userRoleId: number,
  requiredLevel: RoleLevel
): boolean {
  return userRoleId <= requiredLevel;
}

/**
 * Check if user is admin (SNSD Admin or Company Admin)
 */
export function isAdmin(userRoleId: number): boolean {
  return userRoleId <= ROLES.COMPANY_ADMIN;
}

/**
 * Check if user is SNSD Admin (platform admin)
 */
export function isSNSDAdmin(userRoleId: number): boolean {
  return userRoleId === ROLES.SNSD_ADMIN;
}

/**
 * Check if user is Company Admin
 */
export function isCompanyAdmin(userRoleId: number): boolean {
  return userRoleId === ROLES.COMPANY_ADMIN;
}

/**
 * Check if user is HSE Manager or above
 */
export function isHSEManager(userRoleId: number): boolean {
  return userRoleId <= ROLES.HSE_MANAGER;
}

/**
 * Check if user is contractor
 */
export function isContractor(userRoleId: number): boolean {
  return userRoleId === ROLES.CONTRACTOR;
}

/**
 * Get role name by ID
 */
export function getRoleName(roleId: number): string {
  const roleNames: Record<number, string> = {
    0: 'SNSD Admin',
    1: 'Company Admin',
    2: 'HSE Manager',
    3: 'HSE Specialist',
    4: 'Contractor'
  };
  return roleNames[roleId] || 'Unknown Role';
}

/**
 * Get permissions for role
 */
export function getRolePermissions(roleId: number): string[] {
  const permissions: Record<number, string[]> = {
    0: [
      'manage_all_tenants',
      'manage_all_users',
      'view_all_data',
      'manage_system_settings',
      'manage_billing'
    ],
    1: [
      'manage_tenant',
      'manage_users',
      'manage_contractors',
      'view_reports',
      'manage_evaluations',
      'manage_payments'
    ],
    2: [
      'manage_contractors',
      'create_evaluations',
      'review_evaluations',
      'view_reports',
      'manage_team'
    ],
    3: [
      'view_contractors',
      'create_evaluations',
      'update_evaluations',
      'view_reports'
    ],
    4: ['view_own_evaluations', 'submit_documents', 'view_own_profile']
  };
  return permissions[roleId] || [];
}

/**
 * Check if user has specific permission
 */
export function hasSpecificPermission(
  userRoleId: number,
  permission: string
): boolean {
  const permissions = getRolePermissions(userRoleId);
  return permissions.includes(permission);
}

/**
 * Get accessible routes based on role
 */
export function getAccessibleRoutes(roleId: number): string[] {
  const baseRoutes = ['/dashboard', '/dashboard/profile'];

  const roleRoutes: Record<number, string[]> = {
    0: [
      ...baseRoutes,
      '/dashboard/contractors',
      '/dashboard/evaluations',
      '/dashboard/payments',
      '/dashboard/tenants',
      '/dashboard/users',
      '/dashboard/settings',
      '/dashboard/reports'
    ],
    1: [
      ...baseRoutes,
      '/dashboard/contractors',
      '/dashboard/evaluations',
      '/dashboard/payments',
      '/dashboard/users',
      '/dashboard/settings',
      '/dashboard/reports'
    ],
    2: [
      ...baseRoutes,
      '/dashboard/contractors',
      '/dashboard/evaluations',
      '/dashboard/reports',
      '/dashboard/team'
    ],
    3: [
      ...baseRoutes,
      '/dashboard/contractors',
      '/dashboard/evaluations',
      '/dashboard/reports'
    ],
    4: [...baseRoutes, '/dashboard/my-evaluations', '/dashboard/documents']
  };

  return roleRoutes[roleId] || baseRoutes;
}

/**
 * Check if user can access route
 */
export function canAccessRoute(userRoleId: number, route: string): boolean {
  const accessibleRoutes = getAccessibleRoutes(userRoleId);
  return accessibleRoutes.some((r) => route.startsWith(r));
}

/**
 * Get dashboard redirect based on role
 */
export function getDashboardRoute(roleId: number): string {
  const dashboardRoutes: Record<number, string> = {
    0: '/dashboard/overview', // SNSD Admin
    1: '/dashboard/overview', // Company Admin
    2: '/dashboard/evaluations', // HSE Manager
    3: '/dashboard/evaluations', // HSE Specialist
    4: '/dashboard/my-evaluations' // Contractor
  };
  return dashboardRoutes[roleId] || '/dashboard';
}
