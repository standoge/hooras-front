import { cn } from '@/lib/utils'

const projectStatusStyles: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  pending_review: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  published: 'bg-primary/10 text-primary',
  accepting_applications: 'bg-primary/15 text-primary',
  in_execution: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  closed: 'bg-muted text-muted-foreground',
  archived: 'bg-muted text-muted-foreground',
  rejected: 'bg-destructive/15 text-destructive',
  cancelled: 'bg-muted text-muted-foreground',
  suspended: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
}

const applicationStatusStyles: Record<string, string> = {
  submitted: 'bg-primary/10 text-primary',
  approved: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  rejected: 'bg-destructive/15 text-destructive',
  cancelled: 'bg-muted text-muted-foreground',
  waitlisted: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
}

const approvalStatusStyles: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  approved: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  rejected: 'bg-destructive/15 text-destructive',
  missing: 'bg-muted text-muted-foreground',
}

const lifecycleStatusStyles: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  inactive: 'bg-muted text-muted-foreground',
}

function getDotColor(status: string): string {
  switch (status) {
    case 'approved':
    case 'in_execution':
      return 'bg-emerald-500 dark:bg-emerald-400'
    case 'pending':
    case 'pending_review':
    case 'waitlisted':
    case 'suspended':
      return 'bg-amber-500 dark:bg-amber-400 animate-pulse'
    case 'published':
    case 'accepting_applications':
    case 'submitted':
      return 'bg-primary'
    case 'rejected':
      return 'bg-destructive'
    case 'active':
      return 'bg-emerald-500 dark:bg-emerald-400'
    case 'inactive':
    case 'missing':
      return 'bg-muted-foreground'
    default:
      return 'bg-muted-foreground'
  }
}

function formatLabel(value: string) {
  return value.replace(/_/g, ' ')
}

interface StatusBadgeProps {
  status: string
  kind?: 'project' | 'application' | 'approval' | 'lifecycle' | 'generic'
  className?: string
}

export function StatusBadge({ status, kind = 'generic', className }: StatusBadgeProps) {
  const styleMap =
    kind === 'project'
      ? projectStatusStyles
      : kind === 'application'
        ? applicationStatusStyles
        : kind === 'approval'
          ? approvalStatusStyles
          : kind === 'lifecycle'
            ? lifecycleStatusStyles
            : {}

  const dotColor = getDotColor(status)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-current/10 px-2.5 py-0.5 text-xs font-semibold capitalize tracking-wide transition-all duration-200',
        styleMap[status] ?? 'bg-muted text-muted-foreground',
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotColor)} />
      {formatLabel(status)}
    </span>
  )
}
