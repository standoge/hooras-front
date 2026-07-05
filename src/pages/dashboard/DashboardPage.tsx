import { Link } from '@tanstack/react-router'
import { useAuth } from '@/auth/AuthProvider'
import { isStudent, canViewReports } from '@/auth/roles'
import { useStudentProfile, useProgressReport, useProjectReport } from '@/api/hooks'
import { QueryState } from '@/components/feedback'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/layout/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  Clock,
  Award,
  Users,
  UserCheck,
  CheckCircle2,
  Hourglass,
  FolderKanban,
  ClipboardList,
  BookOpen,
  TrendingUp,
} from 'lucide-react'

function MetricCard({
  label,
  value,
  icon: Icon,
  description,
  colorClass = 'text-primary bg-primary/10',
}: {
  label: string
  value?: number | string
  icon?: React.ComponentType<{ className?: string }>
  description?: string
  colorClass?: string
}) {
  return (
    <div className="group rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-sm)] hover:-translate-y-1 hover:shadow-[var(--shadow-sm-2)] transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value ?? '—'}</p>
          {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-2xl ${colorClass} shrink-0 transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const studentView = isStudent(user?.roles)
  const reportsView = canViewReports(user?.roles)

  const profileQuery = useStudentProfile(studentView)
  const progressQuery = useProgressReport(reportsView)
  const projectReportQuery = useProjectReport(reportsView)

  const description = studentView
    ? 'Your social hours workspace overview.'
    : reportsView
      ? 'Platform progress and project metrics.'
      : 'Use the navigation menu to access your workspace.'

  // Progress circle computations for students
  const completed = profileQuery.data?.completedHours ?? 0
  const required = profileQuery.data?.eligibility?.requiredHours ?? 0
  const percent = required > 0 ? Math.min(Math.round((completed / required) * 100), 100) : 0
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percent / 100) * circumference

  return (
    <div className="mx-auto max-w-[var(--page-max-width)] px-4 py-10 sm:px-10 page-entrance">
      <PageHeader
        title={`Welcome${user?.displayName ? `, ${user.displayName}` : ''}`}
        description={description}
      />

      {studentView ? (
        <QueryState
          isLoading={profileQuery.isLoading}
          isError={profileQuery.isError}
          error={profileQuery.error}
          onRetry={() => void profileQuery.refetch()}
        >
          <div className="grid gap-6 md:grid-cols-4">
            {/* SVG Progress Circle Panel */}
            <div className="flex flex-col justify-center rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-sm)] md:col-span-2">
              <div className="flex w-full items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground text-sm">Your Progress</h3>
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full animate-pulse-slow">
                  {percent}% Completed
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-6 w-full justify-around py-2">
                <div className="relative h-28 w-28 shrink-0">
                  <svg className="h-full w-full -rotate-90">
                    <circle
                      cx="56"
                      cy="56"
                      r={radius}
                      className="stroke-muted fill-none"
                      strokeWidth="8"
                    />
                    <circle
                      cx="56"
                      cy="56"
                      r={radius}
                      className="stroke-primary fill-none transition-all duration-1000 ease-out"
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-foreground">{completed}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">of {required}h</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-primary shrink-0" />
                    <span className="text-sm text-muted-foreground">Completed: <strong className="text-foreground">{completed}h</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-muted shrink-0" />
                    <span className="text-sm text-muted-foreground">Remaining: <strong className="text-foreground">{profileQuery.data?.remainingHours ?? 0}h</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-amber-500 shrink-0 animate-pulse" />
                    <span className="text-sm text-muted-foreground">Required: <strong className="text-foreground">{required}h</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="space-y-4 md:col-span-2 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-1 sm:space-y-0 md:space-y-4">
              <MetricCard
                label="Remaining hours"
                value={profileQuery.data?.remainingHours}
                icon={Clock}
                colorClass="text-emerald-500 bg-emerald-500/10"
              />
              <div className="group rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-sm)] hover:-translate-y-1 hover:shadow-[var(--shadow-sm-2)] transition-all duration-300 flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Eligibility & Status</p>
                  <div className="mt-3">
                    <StatusBadge
                      status={profileQuery.data?.eligibility?.status ?? 'missing_data'}
                      kind="generic"
                    />
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 shrink-0 transition-transform duration-300 group-hover:scale-110">
                  <Award className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-center md:justify-start">
            <Button asChild variant="secondary" className="hover:bg-muted active:scale-95 transition-all duration-200">
              <Link to="/profile">View full profile</Link>
            </Button>
          </div>
        </QueryState>
      ) : null}

      {reportsView ? (
        <div className="space-y-8">
          <QueryState
            isLoading={progressQuery.isLoading}
            isError={progressQuery.isError}
            error={progressQuery.error}
            onRetry={() => void progressQuery.refetch()}
          >
            <section>
              <h2 className="mb-4 text-lg font-bold flex items-center gap-2 text-foreground">
                <TrendingUp className="h-5 w-5 text-primary" />
                Progress Report
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <MetricCard label="Total students" value={progressQuery.data?.totalStudents} icon={Users} colorClass="text-primary bg-primary/10" />
                <MetricCard label="Eligible students" value={progressQuery.data?.eligibleStudents} icon={UserCheck} colorClass="text-emerald-500 bg-emerald-500/10" />
                <MetricCard label="Active assignments" value={progressQuery.data?.activeAssignments} icon={BookOpen} colorClass="text-blue-500 bg-blue-500/10" />
                <MetricCard label="Completed assignments" value={progressQuery.data?.completedAssignments} icon={CheckCircle2} colorClass="text-emerald-500 bg-emerald-500/10" />
                <MetricCard label="Approved hours" value={progressQuery.data?.approvedHours} icon={Clock} colorClass="text-primary bg-primary/10" />
                <MetricCard label="Pending hour logs" value={progressQuery.data?.pendingHourLogs} icon={Hourglass} colorClass="text-amber-500 bg-amber-500/10" />
              </div>
            </section>
          </QueryState>

          <QueryState
            isLoading={projectReportQuery.isLoading}
            isError={projectReportQuery.isError}
            error={projectReportQuery.error}
            onRetry={() => void projectReportQuery.refetch()}
          >
            <section>
              <h2 className="mb-4 text-lg font-bold flex items-center gap-2 text-foreground">
                <FolderKanban className="h-5 w-5 text-primary" />
                Projects Overview
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard label="Total projects" value={projectReportQuery.data?.totalProjects} icon={FolderKanban} colorClass="text-primary bg-primary/10" />
                <MetricCard label="Published projects" value={projectReportQuery.data?.publishedProjects} icon={ClipboardList} colorClass="text-emerald-500 bg-emerald-500/10" />
                <MetricCard label="Scraped pending review" value={projectReportQuery.data?.scrapedPendingReview} icon={Hourglass} colorClass="text-amber-500 bg-amber-500/10" />
                <MetricCard label="Applications" value={projectReportQuery.data?.applications} icon={Users} colorClass="text-blue-500 bg-blue-500/10" />
              </div>
            </section>
          </QueryState>
        </div>
      ) : null}

      {!studentView && !reportsView ? (
        <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-[var(--shadow-sm)] max-w-xl mx-auto mt-10">
          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground font-medium">Use the navigation menu to access your workspace.</p>
        </div>
      ) : null}
    </div>
  )
}
