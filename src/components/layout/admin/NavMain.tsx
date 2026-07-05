import { Link, useRouterState } from '@tanstack/react-router'
import {
  DASHBOARD_NAV_ITEM,
  filterNavGroups,
  type NavGroup,
} from '@/components/layout/nav-config'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useAuth } from '@/auth/AuthProvider'
import { useEnabledModuleKeys } from '@/api/hooks/useCapabilities'

function NavGroupSection({
  group,
  isActive,
}: {
  group: NavGroup
  isActive: (to: string) => boolean
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {group.items.map((item) => (
            <SidebarMenuItem key={item.to}>
              <SidebarMenuButton asChild isActive={isActive(item.to)} tooltip={item.label}>
                <Link to={item.to}>
                  {item.icon ? <item.icon /> : null}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function NavMain() {
  const { user } = useAuth()
  const enabledModules = useEnabledModuleKeys()
  const groups = filterNavGroups(user?.roles, enabledModules)
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const isActive = (to: string) => {
    if (to === '/') return pathname === '/'
    return pathname === to || pathname.startsWith(`${to}/`)
  }

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Platform</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive(DASHBOARD_NAV_ITEM.to)}
                tooltip={DASHBOARD_NAV_ITEM.label}
              >
                <Link to={DASHBOARD_NAV_ITEM.to}>
                  {DASHBOARD_NAV_ITEM.icon ? <DASHBOARD_NAV_ITEM.icon /> : null}
                  <span>{DASHBOARD_NAV_ITEM.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {groups.map((group) => (
        <NavGroupSection key={group.label} group={group} isActive={isActive} />
      ))}
    </>
  )
}
