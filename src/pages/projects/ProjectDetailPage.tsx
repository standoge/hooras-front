import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useAuth } from '@/auth/AuthProvider'
import { canManageProjects, isStudent } from '@/auth/roles'
import {
  useProject,
  useProjectApplications,
  usePublishProject,
  useArchiveProject,
  useCreateApplication,
} from '@/api/hooks'
import { QueryState } from '@/components/feedback'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/layout/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PreviewEditor, Editor } from '@/components/editor'
import { toastMutationError, toastMutationSuccess } from '@/lib/mutations'

interface ProjectDetailPageProps {
  projectId: string
}

import { MapPin, FileText, Users } from 'lucide-react'

export function ProjectDetailPage({ projectId }: ProjectDetailPageProps) {
  const { user } = useAuth()
  const student = isStudent(user?.roles)
  const canManage = canManageProjects(user?.roles)

  const projectQuery = useProject(projectId)
  const applicationsQuery = useProjectApplications(projectId, canManage)
  const publishMutation = usePublishProject()
  const archiveMutation = useArchiveProject()
  const applyMutation = useCreateApplication(projectId)

  const [applyOpen, setApplyOpen] = useState(false)
  const [motivation, setMotivation] = useState('')

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync(projectId)
      toastMutationSuccess('Project published')
    } catch (error) {
      toastMutationError(error)
    }
  }

  const handleArchive = async () => {
    try {
      await archiveMutation.mutateAsync(projectId)
      toastMutationSuccess('Project archived')
    } catch (error) {
      toastMutationError(error)
    }
  }

  const handleApply = async () => {
    try {
      await applyMutation.mutateAsync({ motivation })
      toastMutationSuccess('Application submitted')
      setApplyOpen(false)
      setMotivation('')
    } catch (error) {
      toastMutationError(error, 'Unable to submit application.')
    }
  }

  return (
    <div className="mx-auto max-w-[var(--page-max-width)] px-4 py-10 sm:px-10 page-entrance">
      <QueryState
        isLoading={projectQuery.isLoading}
        isError={projectQuery.isError}
        error={projectQuery.error}
        onRetry={() => void projectQuery.refetch()}
      >
        {projectQuery.data ? (
          <>
            <PageHeader
              title={projectQuery.data.title}
              description={projectQuery.data.organizationName}
              className="mb-8"
            />

            <div className="grid gap-6 lg:grid-cols-3 items-start">
              {/* Left Main Panel */}
              <div className="lg:col-span-2 space-y-6">
                <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-[var(--shadow-sm)]">
                  <h2 className="mb-4 text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                    <FileText className="h-5 w-5 text-primary" />
                    Description
                  </h2>
                  <div className="prose dark:prose-invert max-w-none mt-4">
                    <PreviewEditor content={projectQuery.data.description} />
                  </div>
                </section>

                {canManage ? (
                  <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-[var(--shadow-sm)]">
                    <h2 className="mb-4 text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                      <Users className="h-5 w-5 text-primary" />
                      Applications
                    </h2>
                    <QueryState
                      isLoading={applicationsQuery.isLoading}
                      isError={applicationsQuery.isError}
                      error={applicationsQuery.error}
                      isEmpty={!applicationsQuery.data?.length}
                      emptyTitle="No applications yet"
                      onRetry={() => void applicationsQuery.refetch()}
                    >
                      <ul className="space-y-3 mt-4">
                        {applicationsQuery.data?.map((application) => (
                          <li
                            key={application.id}
                            className="flex items-center justify-between rounded-2xl border border-border bg-muted/30 px-4 py-3 hover:bg-muted/50 transition-colors duration-200"
                          >
                            <div>
                              <p className="font-semibold text-foreground text-sm">{application.studentRef}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {new Date(application.createdAt).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                            <StatusBadge status={application.status} kind="application" />
                          </li>
                        ))}
                      </ul>
                    </QueryState>
                  </section>
                ) : null}
              </div>

              {/* Right Sidebar Panel */}
              <div className="space-y-6">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-sm)] space-y-6">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Status & Metadata
                    </h3>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <StatusBadge status={projectQuery.data.status} kind="project" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Source</span>
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full capitalize">
                          {projectQuery.data.sourceType.replace(/_/g, ' ')}
                        </span>
                      </div>
                      {projectQuery.data.location ? (
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-muted-foreground shrink-0">Location</span>
                          <span className="text-sm text-foreground font-medium truncate flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            {projectQuery.data.location}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {projectQuery.data.categories && projectQuery.data.categories.length > 0 ? (
                    <div className="pt-4 border-t border-border/50">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Categories
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {projectQuery.data.categories.map((cat) => (
                          <span
                            key={cat}
                            className="rounded-full bg-muted border border-border px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Sidebar Action Buttons */}
                  <div className="pt-6 border-t border-border/50 flex flex-col gap-3">
                    {student ? (
                      <Button onClick={() => setApplyOpen(true)} className="w-full gradient-btn font-semibold rounded-xl h-11">
                        Apply to Project
                      </Button>
                    ) : null}
                    {canManage ? (
                      <>
                        <Button asChild variant="secondary" className="w-full font-semibold rounded-xl h-11 hover:bg-muted transition-colors">
                          <Link to="/projects/$projectId/edit" params={{ projectId }}>
                            Edit Details
                          </Link>
                        </Button>
                        {projectQuery.data.status !== 'published' ? (
                          <Button
                            variant="secondary"
                            className="w-full font-semibold rounded-xl h-11 hover:bg-muted transition-colors"
                            onClick={handlePublish}
                            disabled={publishMutation.isPending}
                          >
                            {publishMutation.isPending ? 'Publishing…' : 'Publish Project'}
                          </Button>
                        ) : null}
                        {projectQuery.data.status !== 'archived' ? (
                          <Button
                            variant="secondary"
                            className="w-full font-semibold rounded-xl h-11 hover:text-destructive hover:bg-destructive/5 transition-colors"
                            onClick={handleArchive}
                            disabled={archiveMutation.isPending}
                          >
                            {archiveMutation.isPending ? 'Archiving…' : 'Archive Project'}
                          </Button>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </QueryState>

      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="max-w-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle>Apply to project</DialogTitle>
          </DialogHeader>
          <Editor
            label="Motivation"
            name="motivation"
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            placeholder="Explain why you want to join this project…"
          />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setApplyOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={applyMutation.isPending}>
              {applyMutation.isPending ? 'Submitting…' : 'Submit application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
