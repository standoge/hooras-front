import { Link, useRouterState } from '@tanstack/react-router'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  DASHBOARD_NAV_ITEM,
  filterNavGroups,
  flattenNavItems,
} from '@/components/layout/nav-config'
import { useAuth } from '@/auth/AuthProvider'
import type { UserRole } from '@/api/types'

function getPageLabel(pathname: string, userRoles: UserRole[] | undefined) {
  const groups = filterNavGroups(userRoles)
  const items = [DASHBOARD_NAV_ITEM, ...flattenNavItems(groups)]

  const match = items.find((item) => {
    if (item.to === '/') return pathname === '/'
    return pathname === item.to || pathname.startsWith(`${item.to}/`)
  })

  return match?.label ?? 'Dashboard'
}

export function AdminHeader() {
  const { user } = useAuth()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const pageLabel = getPageLabel(pathname, user?.roles)

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink asChild>
                <Link to="/">Hooras</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{pageLabel}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}
