import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Building, MapPin, Plus, Search } from 'lucide-react'
import { useAuth } from '@/auth/AuthProvider'
import { canManageProjects, isStudent } from '@/auth/roles'
import { useProjects, type ProjectFilters } from '@/api/hooks'
import type { ProjectStatus, ProjectSourceType } from '@/api/types'
import { SelectField } from '@/components/forms'
import { QueryState } from '@/components/feedback'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/layout/StatusBadge'
import { Button } from '@/components/ui/button'

const STUDENT_VISIBLE_STATUSES: ProjectStatus[] = [
  'published',
  'accepting_applications',
  'in_execution',
]

const STATUS_OPTIONS: { label: string; value: ProjectStatus | '' }[] = [
  { label: 'All statuses', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Accepting applications', value: 'accepting_applications' },
  { label: 'In execution', value: 'in_execution' },
  { label: 'Closed', value: 'closed' },
  { label: 'Archived', value: 'archived' },
]

const SOURCE_OPTIONS: { label: string; value: ProjectSourceType | '' }[] = [
  { label: 'All sources', value: '' },
  { label: 'College created', value: 'college_created' },
  { label: 'Scraped', value: 'scraped' },
]

export function ProjectsPage() {
  const { user } = useAuth()
  const student = isStudent(user?.roles)
  const canManage = canManageProjects(user?.roles)

  const [status, setStatus] = useState<ProjectStatus | ''>('')
  const [sourceType, setSourceType] = useState<ProjectSourceType | ''>('')
  const [category, setCategory] = useState('')

  const filters: ProjectFilters = {
    ...(status ? { status } : {}),
    ...(sourceType ? { sourceType } : {}),
    ...(category ? { category } : {}),
  }

  const projectsQuery = useProjects(filters)

  const visibleProjects = useMemo(() => {
    const items = projectsQuery.data ?? []
    if (!student) return items
    return items.filter((project) => STUDENT_VISIBLE_STATUSES.includes(project.status))
  }, [projectsQuery.data, student])

  return (
    <div className="mx-auto max-w-[var(--page-max-width)] px-4 py-10 sm:px-10 page-entrance">
      <PageHeader
        title="Projects"
        description="Browse and manage social hours projects."
        actions={
          canManage ? (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline">
                <Link to="/projects/job-search">
                  <Search className="mr-2 h-4 w-4" />
                  Find jobs
                </Link>
              </Button>
              <Button asChild className="gradient-btn">
                <Link to="/projects/new">
                  <Plus className="mr-2 h-4 w-4" /> New project
                </Link>
              </Button>
            </div>
          ) : undefined
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3 bg-card/40 backdrop-blur border border-border p-4 rounded-3xl shadow-[var(--shadow-sm)]">
        {!student ? (
          <SelectField
            label="Status"
            name="status"
            value={status}
            options={STATUS_OPTIONS}
            onChange={(e) => setStatus(e.target.value as ProjectStatus | '')}
          />
        ) : null}
        <SelectField
          label="Source"
          name="sourceType"
          value={sourceType}
          options={SOURCE_OPTIONS}
          onChange={(e) => setSourceType(e.target.value as ProjectSourceType | '')}
        />
        <SelectField
          label="Category"
          name="category"
          value={category}
          options={[{ label: 'All categories', value: '' }]}
          placeholder="Category filter"
          onChange={(e) => setCategory(String(e.target.value))}
        />
      </div>

      <QueryState
        isLoading={projectsQuery.isLoading}
        isError={projectsQuery.isError}
        error={projectsQuery.error}
        isEmpty={!visibleProjects.length}
        onRetry={() => void projectsQuery.refetch()}
        emptyTitle="No projects found"
        emptyDescription="Try adjusting your filters or check back later."
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.map((project) => (
            <article
              key={project.id}
              className="group flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-sm)] hover:-translate-y-1.5 hover:shadow-[var(--shadow-sm-2)] transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary to-coral-magenta opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full capitalize">
                    {project.sourceType.replace(/_/g, ' ')}
                  </span>
                  <StatusBadge status={project.status} kind="project" />
                </div>
                
                <h2 className="text-lg font-bold leading-snug text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2">
                  {project.title}
                </h2>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="h-4 w-4 shrink-0 opacity-70" />
                    <span className="truncate">{project.organizationName}</span>
                  </div>
                  {project.location ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0 opacity-70" />
                      <span className="truncate">{project.location}</span>
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.categories.map((cat) => (
                    <span
                      key={cat}
                      className="rounded-full bg-muted/60 border border-border px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 flex justify-end">
                <Button asChild variant="secondary" size="sm" className="w-full hover:bg-muted active:scale-95 transition-all duration-200">
                  <Link to="/projects/$projectId" params={{ projectId: project.id }}>
                    View details
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </QueryState>
    </div>
  )
}
