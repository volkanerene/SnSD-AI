// Role-based access control utilities

/**
 * Role-based access control utilities
 */

export const ROLES = {
  SNSD_ADMIN: 1,
  COMPANY_ADMIN: 2,
  HSE_SPECIALIST: 3,
  CONTRACTOR_ADMIN: 4,
  SUPERVISOR: 5,
  WORKER: 6
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
 * Check if user is HSE Specialist or above
 */
export function isHSESpecialist(userRoleId: number): boolean {
  return userRoleId <= ROLES.HSE_SPECIALIST;
}

/**
 * Check if user is contractor admin
 */
export function isContractorAdmin(userRoleId: number): boolean {
  return userRoleId === ROLES.CONTRACTOR_ADMIN;
}

/**
 * Get role name by ID
 */
export function getRoleName(roleId: number): string {
  const roleNames: Record<number, string> = {
    1: 'SNSD Admin',
    2: 'Company Admin',
    3: 'HSE Specialist',
    4: 'Contractor Admin',
    5: 'Supervisor',
    6: 'Worker'
  };
  return roleNames[roleId] || 'Unknown Role';
}

/**
 * Get permissions for role
 */
export function getRolePermissions(roleId: number): string[] {
  const permissions: Record<number, string[]> = {
    1: [
      'manage_all_tenants',
      'manage_all_users',
      'view_all_data',
      'manage_system_settings',
      'manage_billing'
    ],
    2: [
      'manage_tenant',
      'manage_users',
      'manage_contractors',
      'view_reports',
      'manage_evaluations',
      'manage_payments'
    ],
    3: [
      'view_contractors',
      'create_evaluations',
      'update_evaluations',
      'view_reports',
      'manage_evaluations'
    ],
    4: [
      'view_own_company',
      'view_own_evaluations',
      'submit_documents',
      'update_own_profile'
    ],
    5: [
      'view_site_contractors',
      'update_evaluations',
      'view_site_reports',
      'update_own_profile'
    ],
    6: ['view_own_documents', 'view_own_evaluations', 'view_own_profile']
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
  const baseRoutes = ['/dashboard/profile', '/dashboard/settings'];

  const roleRoutes: Record<number, string[]> = {
    1: [
      // SNSD Admin - Full access
      ...baseRoutes,
      '/dashboard/admin/users',
      '/dashboard/admin/roles',
      '/dashboard/admin/invitations',
      '/dashboard/admin/tenants',
      '/dashboard/admin/subscription',
      '/dashboard/evren-gpt',
      '/dashboard/evren-gpt/contractors',
      '/dashboard/evren-gpt/evaluations',
      '/dashboard/marcel-gpt',
      '/dashboard/safety-bud',
      '/dashboard/payments',
      '/dashboard/team',
      '/dashboard/reports'
    ],
    2: [
      // Company Admin - Tenant-level access
      ...baseRoutes,
      '/dashboard/admin/users', // Can manage users in their tenant
      '/dashboard/admin/roles',
      '/dashboard/admin/invitations',
      '/dashboard/evren-gpt',
      '/dashboard/evren-gpt/contractors',
      '/dashboard/evren-gpt/evaluations',
      '/dashboard/marcel-gpt',
      '/dashboard/safety-bud',
      '/dashboard/payments',
      '/dashboard/team',
      '/dashboard/reports'
    ],
    3: [
      // HSE Specialist - Evaluation management
      ...baseRoutes,
      '/dashboard/evren-gpt/contractors',
      '/dashboard/evren-gpt/evaluations',
      '/dashboard/marcel-gpt',
      '/dashboard/safety-bud',
      '/dashboard/reports'
    ],
    4: [
      // Contractor Admin - Own company only
      ...baseRoutes,
      '/dashboard/my-evaluations',
      '/dashboard/documents'
    ],
    5: [
      // Supervisor - Site management
      ...baseRoutes,
      '/dashboard/evren-gpt/contractors',
      '/dashboard/evren-gpt/evaluations',
      '/dashboard/safety-bud',
      '/dashboard/reports'
    ],
    6: [
      // Worker - Read-only
      ...baseRoutes,
      '/dashboard/my-evaluations',
      '/dashboard/documents'
    ]
  };

  return roleRoutes[roleId] || baseRoutes;
}

/**
 * Check if user can access route
 */
export function canAccessRoute(userRoleId: number, route: string): boolean {
  // Everyone can access /dashboard root
  if (route === '/dashboard') return true;

  const accessibleRoutes = getAccessibleRoutes(userRoleId);
  return accessibleRoutes.some((r) => route.startsWith(r));
}

/**
 * Get dashboard redirect based on role
 */
export function getDashboardRoute(roleId: number): string {
  const dashboardRoutes: Record<number, string> = {
    1: '/dashboard', // SNSD Admin
    2: '/dashboard', // Company Admin
    3: '/dashboard/evren-gpt/evaluations/frm32', // HSE Specialist
    4: '/dashboard/my-evaluations', // Contractor Admin
    5: '/dashboard/evren-gpt/evaluations/frm32', // Supervisor
    6: '/dashboard/my-evaluations' // Worker
  };
  return dashboardRoutes[roleId] || '/dashboard';
}
