import { Link } from '@tanstack/react-router'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { filterNavGroups } from '@/components/layout/nav-config'
import { useAuth } from '@/auth/AuthProvider'
import { useEnabledModuleKeys } from '@/api/hooks/useCapabilities'
import { cn } from '@/lib/utils'

export function AppNavbar() {
  const { user } = useAuth()
  const enabledModules = useEnabledModuleKeys()
  const groups = filterNavGroups(user?.roles, enabledModules)

  return (
    <NavigationMenu className="hidden lg:flex">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link to="/" className={navigationMenuTriggerStyle()} activeProps={{ className: 'bg-accent' }}>
              Dashboard
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {groups.map((group) => (
          <NavigationMenuItem key={group.label}>
            <NavigationMenuTrigger>{group.label}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[220px] gap-1 p-2">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <NavigationMenuLink asChild>
                      <Link
                        to={item.to}
                        className={cn(
                          'block rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted',
                        )}
                        activeProps={{ className: 'bg-muted text-primary' }}
                      >
                        {item.label}
                      </Link>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
