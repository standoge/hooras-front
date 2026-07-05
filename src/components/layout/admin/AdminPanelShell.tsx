import { AppSidebar } from '@/components/layout/admin/AppSidebar'
import { AdminContent } from '@/components/layout/admin/AdminContent'
import { AdminHeader } from '@/components/layout/admin/AdminHeader'
import { AdminLayoutProvider } from '@/components/layout/admin/AdminLayoutContext'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

interface AdminPanelShellProps {
  children: React.ReactNode
}

export function AdminPanelShell({ children }: AdminPanelShellProps) {
  return (
    <SidebarProvider defaultOpen className="flex min-h-svh w-full">
      <AppSidebar />
      <SidebarInset>
        <AdminLayoutProvider>
          <AdminHeader />
          <AdminContent>{children}</AdminContent>
        </AdminLayoutProvider>
      </SidebarInset>
    </SidebarProvider>
  )
}
