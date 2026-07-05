import { createFileRoute } from '@tanstack/react-router'
import { SetupWizardPage } from '@/pages/setup/SetupWizardPage'

export const Route = createFileRoute('/setup')({
  component: SetupWizardPage,
})
