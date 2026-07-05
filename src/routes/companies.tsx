import { createFileRoute } from '@tanstack/react-router'
import { RequireAuth } from '@/auth/RequireAuth'
import { RequireRole } from '@/auth/RequireRole'
import { CompaniesPage } from '@/pages/companies/CompaniesPage'

export const Route = createFileRoute('/companies')({
  component: () => (
    <RequireAuth>
      <RequireRole roles={['coordinator', 'admin']}>
        <CompaniesPage />
      </RequireRole>
    </RequireAuth>
  ),
})
