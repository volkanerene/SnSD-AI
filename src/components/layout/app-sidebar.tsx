'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { navItems } from '@/constants/data';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { usePermissionContext } from '@/contexts/PermissionContext';
import { canAccessRoute } from '@/lib/auth-utils';
import {
  IconBell,
  IconChevronRight,
  IconChevronsDown,
  IconCreditCard,
  IconLogout,
  IconPhotoUp,
  IconUserCircle
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { Icons } from '../icons';
import { OrgSwitcher } from '../org-switcher';
import { toast } from 'sonner';
export const company = {
  name: 'Acme Inc',
  logo: IconPhotoUp,
  plan: 'Enterprise'
};

const tenants = [
  { id: '1', name: 'Acme Inc' },
  { id: '2', name: 'Beta Corp' },
  { id: '3', name: 'Gamma Ltd' }
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { isOpen } = useMediaQuery();
  const { user, signOutAsync } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const { hasPermission, isLoading: permissionsLoading } =
    usePermissionContext();
  const router = useRouter();

  const handleSwitchTenant = (_tenantId: string) => {
    // Tenant switching functionality would be implemented here
  };

  const handleSignOut = async () => {
    try {
      await signOutAsync();
      toast.success('Signed out successfully');
      router.push('/auth/sign-in');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
    }
  };

  const activeTenant = tenants[0];

  // Filter nav items based on user permissions
  const filteredNavItems = React.useMemo(() => {
    // Show loading state - don't show any items while loading
    if (profileLoading || permissionsLoading) {
      return [];
    }

    // If profile or permissions not loaded yet, return empty
    if (!profile?.role_id) {
      return [];
    }

    const result = navItems
      .map((item) => {
        // Filter sub-items if they exist
        if (item.items && item.items.length > 0) {
          const filteredSubItems = item.items
            .map((subItem) => {
              // Check if subItem has nested items
              if (subItem.items && subItem.items.length > 0) {
                const filteredNestedItems = subItem.items.filter(
                  (nestedItem) => {
                    if (nestedItem.requiredPermission) {
                      return hasPermission(nestedItem.requiredPermission);
                    }
                    return canAccessRoute(profile.role_id!, nestedItem.url);
                  }
                );

                if (filteredNestedItems.length === 0) {
                  return null;
                }

                return { ...subItem, items: filteredNestedItems };
              }

              // Check permission if requiredPermission is specified
              if (subItem.requiredPermission) {
                return hasPermission(subItem.requiredPermission)
                  ? subItem
                  : null;
              }
              // Fallback to role-based access - always allow base routes like profile/settings
              if (
                subItem.url === '/dashboard/profile' ||
                subItem.url === '/dashboard/settings'
              ) {
                return subItem;
              }
              return canAccessRoute(profile.role_id!, subItem.url)
                ? subItem
                : null;
            })
            .filter(
              (subItem): subItem is NonNullable<typeof subItem> =>
                subItem !== null
            );

          // If no sub-items are accessible, hide the parent
          if (filteredSubItems.length === 0 && item.url === '#') {
            return null;
          }

          return { ...item, items: filteredSubItems };
        }

        return item;
      })
      .filter((item): item is NonNullable<typeof item> => {
        if (!item) return false;

        // Account section should be visible to all users
        if (item.title === 'Account') {
          return true;
        }

        // Check permission if requiredPermission is specified
        if (item.requiredPermission) {
          const hasAccess = hasPermission(item.requiredPermission);
          if (!hasAccess) return false;
        }

        // Hide admin-only items for non-admins (role_id > 2)
        if (item.adminOnly && profile.role_id > 2) {
          return false;
        }

        // If item has no URL or is a placeholder, keep it if it has accessible sub-items
        if (!item.url || item.url === '#') {
          return !!(item.items && item.items.length > 0);
        }

        // Fallback to role-based access check
        return canAccessRoute(profile.role_id, item.url);
      });

    return result;
  }, [profile, profileLoading, permissionsLoading, hasPermission]);

  React.useEffect(() => {
    // Side effects based on sidebar state changes
  }, [isOpen]);

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <OrgSwitcher
          tenants={tenants}
          defaultTenant={activeTenant}
          onTenantSwitch={handleSwitchTenant}
        />
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarMenu>
            {filteredNavItems.map((item) => {
              const IconComp =
                item.icon && Icons[item.icon] ? Icons[item.icon] : Icons.logo;
              return item?.items && item?.items?.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className='group/collapsible'
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={pathname === item.url}
                      >
                        {IconComp ? <IconComp /> : null}
                        <span>{item.title}</span>
                        <IconChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) =>
                          subItem.items && subItem.items.length > 0 ? (
                            <Collapsible
                              key={subItem.title}
                              asChild
                              defaultOpen={false}
                              className='group/nested-collapsible'
                            >
                              <SidebarMenuSubItem>
                                <CollapsibleTrigger asChild>
                                  <SidebarMenuSubButton>
                                    <span>{subItem.title}</span>
                                    <IconChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/nested-collapsible:rotate-90' />
                                  </SidebarMenuSubButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <SidebarMenuSub>
                                    {subItem.items?.map((nestedItem) => (
                                      <SidebarMenuSubItem
                                        key={nestedItem.title}
                                      >
                                        <SidebarMenuSubButton
                                          asChild
                                          isActive={pathname === nestedItem.url}
                                        >
                                          <Link href={nestedItem.url}>
                                            <span>{nestedItem.title}</span>
                                          </Link>
                                        </SidebarMenuSubButton>
                                      </SidebarMenuSubItem>
                                    ))}
                                  </SidebarMenuSub>
                                </CollapsibleContent>
                              </SidebarMenuSubItem>
                            </Collapsible>
                          ) : (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === subItem.url}
                              >
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        )}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      {IconComp ? <IconComp /> : null}
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
                  {user && (
                    <>
                      <Avatar className='h-8 w-8 rounded-lg'>
                        <AvatarFallback className='rounded-lg'>
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className='grid flex-1 text-left text-sm leading-tight'>
                        <span className='truncate font-semibold'>
                          {profile?.full_name || 'User'}
                        </span>
                        <span className='text-muted-foreground truncate text-xs'>
                          {user.email}
                        </span>
                      </div>
                    </>
                  )}
                  <IconChevronsDown className='ml-auto size-4' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                side='bottom'
                align='end'
                sideOffset={4}
              >
                <DropdownMenuLabel className='p-0 font-normal'>
                  <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                    {user && (
                      <>
                        <Avatar className='h-8 w-8 rounded-lg'>
                          <AvatarFallback className='rounded-lg'>
                            {user.email?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className='grid flex-1 text-left text-sm leading-tight'>
                          <span className='truncate font-semibold'>
                            {profile?.full_name || 'User'}
                          </span>
                          <span className='text-muted-foreground truncate text-xs'>
                            {user.email}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => router.push('/dashboard/profile')}
                  >
                    <IconUserCircle className='mr-2 h-4 w-4' />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <IconCreditCard className='mr-2 h-4 w-4' />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <IconBell className='mr-2 h-4 w-4' />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <IconLogout className='mr-2 h-4 w-4' />
                  Log out
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
