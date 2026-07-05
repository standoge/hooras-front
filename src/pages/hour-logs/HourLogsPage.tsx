import { useState } from 'react'
import { useAuth } from '@/auth/AuthProvider'
import { isStudent, canManageProjects, usesStudentApi } from '@/auth/roles'
import {
  useHourLogs,
  useCreateHourLog,
  useApproveHourLog,
  useRejectHourLog,
  useAssignments,
  type StudentAssignment,
} from '@/api/hooks'
import { getEvidenceUploadUrl, parseEvidenceUploadResponse } from '@/api/files'
import { getStoredToken } from '@/api/client'
import type { ApprovalStatus } from '@/api/types'
import {
  SelectField,
  CalendarField,
  TimeField,
  NumberField,
  UploadField,
  type UploadFieldItem,
} from '@/components/forms'
import { Editor } from '@/components/editor'
import { QueryState, ConfirmDialog } from '@/components/feedback'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/layout/StatusBadge'
import { Button } from '@/components/ui/button'
import { toastMutationError, toastMutationSuccess } from '@/lib/mutations'
import { Calendar, Clock, Check, X } from 'lucide-react'

const STATUS_OPTIONS: { label: string; value: ApprovalStatus | '' }[] = [
  { label: 'All statuses', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
]

const CATEGORY_OPTIONS = [
  { label: 'Community', value: 'community' },
  { label: 'Environmental', value: 'environmental' },
  { label: 'Disciplinary', value: 'disciplinary' },
  { label: 'Research', value: 'research' },
  { label: 'Administrative', value: 'administrative' },
  { label: 'Other', value: 'other' },
]

export function HourLogsPage() {
  const { user } = useAuth()
  const student = isStudent(user?.roles)
  const studentScope = usesStudentApi(user?.roles)
  const canReview = canManageProjects(user?.roles)

  const [status, setStatus] = useState<ApprovalStatus | ''>('')
  const hourLogsQuery = useHourLogs(status ? { status } : undefined, { studentScope })
  const assignmentsQuery = useAssignments(undefined, { studentScope })
  const createMutation = useCreateHourLog({ studentScope })
  const approveMutation = useApproveHourLog()
  const rejectMutation = useRejectHourLog()

  const [showForm, setShowForm] = useState(false)
  const [assignmentId, setAssignmentId] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [durationHours, setDurationHours] = useState(1)
  const [category, setCategory] = useState('community')
  const [description, setDescription] = useState('')
  const [evidence, setEvidence] = useState<UploadFieldItem[]>([])

  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const assignmentOptions =
    assignmentsQuery.data?.map((a) => {
      const assignment = a as StudentAssignment
      const projectLabel = studentScope && assignment.project?.title
        ? assignment.project.title
        : assignment.projectId
      const label = studentScope ? projectLabel : `${assignment.studentRef} — ${assignment.projectId}`
      return { label, value: assignment.id }
    }) ?? []

  const evidenceUploadHeaders: Record<string, string> | undefined = (() => {
    const token = getStoredToken()
    return token ? { Authorization: `Bearer ${token}` } : undefined
  })()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createMutation.mutateAsync({
        assignmentId,
        date,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        durationHours,
        category: category as 'community',
        description,
        evidenceIds: evidence
          .filter((f) => f.status === 'done')
          .map((f) => f.remoteUrl ?? f.id)
          .filter(Boolean),
      })
      toastMutationSuccess('Hour log submitted')
      setShowForm(false)
    } catch (error) {
      toastMutationError(error)
    }
  }

  const handleApprove = async (hourLogId: string) => {
    try {
      await approveMutation.mutateAsync(hourLogId)
      toastMutationSuccess('Hour log approved')
    } catch (error) {
      toastMutationError(error)
    }
  }

  const handleReject = async () => {
    if (!rejectId) return
    try {
      await rejectMutation.mutateAsync({ hourLogId: rejectId, reason: rejectReason })
      toastMutationSuccess('Hour log rejected')
      setRejectId(null)
      setRejectReason('')
    } catch (error) {
      toastMutationError(error)
    }
  }

  return (
    <div className="mx-auto max-w-[var(--page-max-width)] px-4 py-10 sm:px-10 page-entrance">
      <PageHeader
        title="Hour Logs"
        description="Submit and review social hours activity."
        actions={
          student ? (
            <Button onClick={() => setShowForm((v) => !v)} className="gradient-btn rounded-xl">
              {showForm ? 'Hide Form' : 'Submit Hours'}
            </Button>
          ) : undefined
        }
      />

      <div className="mb-8 max-w-xs bg-card border border-border p-4 rounded-2xl shadow-[var(--shadow-sm)]">
        <SelectField
          label="Filter by Status"
          name="status"
          value={status}
          options={STATUS_OPTIONS}
          onChange={(e) => setStatus(e.target.value as ApprovalStatus | '')}
        />
      </div>

      {showForm && student ? (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-sm)] animate-fade-in-up"
        >
          <div className="border-b border-border pb-4 mb-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Submit Hour Log
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Provide the date, category, duration, and supporting evidence for your activity.
            </p>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Assignment"
              name="assignmentId"
              value={assignmentId}
              options={assignmentOptions}
              onChange={(e) => setAssignmentId(String(e.target.value))}
            />
            <CalendarField
              label="Date"
              name="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <TimeField
              label="Start time"
              name="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <TimeField
              label="End time"
              name="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
            <NumberField
              label="Duration (hours)"
              name="durationHours"
              value={durationHours}
              min={0.5}
              step={0.5}
              onChange={(e) => setDurationHours(e.target.value)}
            />
            <SelectField
              label="Category"
              name="category"
              value={category}
              options={CATEGORY_OPTIONS}
              onChange={(e) => setCategory(String(e.target.value))}
            />
          </div>
          <div className="mt-4">
            <Editor
              label="Description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <UploadField
              label="Evidence"
              name="evidence"
              value={evidence}
              multiple
              uploadUrl={studentScope ? getEvidenceUploadUrl() : undefined}
              uploadHeaders={studentScope ? evidenceUploadHeaders : undefined}
              mapUploadResponse={(response) => ({
                remoteUrl: parseEvidenceUploadResponse(response),
              })}
              onChange={(e) => setEvidence(e.target.value)}
            />
          </div>
          <Button type="submit" className="mt-6 gradient-btn font-semibold rounded-xl h-10 px-6" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Submitting…' : 'Submit Hour Log'}
          </Button>
        </form>
      ) : null}

      <QueryState
        isLoading={hourLogsQuery.isLoading}
        isError={hourLogsQuery.isError}
        error={hourLogsQuery.error}
        isEmpty={!hourLogsQuery.data?.length}
        onRetry={() => void hourLogsQuery.refetch()}
        emptyTitle="No hour logs found"
      >
        <div className="relative border-l border-border pl-6 ml-3 space-y-6">
          {hourLogsQuery.data?.map((log) => {
            const isApproved = log.status === 'approved'
            const isPending = log.status === 'pending'
            const isRejected = log.status === 'rejected'

            let dotColor = 'bg-muted-foreground'
            let ringColor = 'ring-muted/20'
            if (isApproved) {
              dotColor = 'bg-emerald-500'
              ringColor = 'ring-emerald-500/20'
            } else if (isPending) {
              dotColor = 'bg-amber-500'
              ringColor = 'ring-amber-500/20'
            } else if (isRejected) {
              dotColor = 'bg-destructive'
              ringColor = 'ring-destructive/20'
            }

            return (
              <article
                key={log.id}
                className="relative group rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-sm-2)] hover:-translate-y-0.5 transition-all duration-300 page-entrance"
              >
                {/* Timeline node */}
                <div className={`absolute -left-[31px] top-7 h-4.5 w-4.5 rounded-full border-4 border-background ${dotColor} ring-4 ${ringColor} transition-transform duration-300 group-hover:scale-110`} />

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1 text-sm font-bold text-foreground">
                        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                        {log.date}
                      </div>
                      <StatusBadge status={log.status} kind="approval" />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Clock className="h-4 w-4 text-primary shrink-0" />
                        {log.durationHours} hours
                      </span>
                      <span className="inline-flex items-center rounded-full bg-muted/60 border border-border px-2.5 py-0.5 text-xs text-foreground capitalize">
                        {log.category}
                      </span>
                    </div>

                    {/* Show description if exists */}
                    {log.description ? (
                      <p className="text-sm text-muted-foreground mt-3 bg-muted/20 border-l-2 border-border pl-3 py-1 rounded-r-lg italic line-clamp-3">
                        {log.description}
                      </p>
                    ) : null}
                  </div>

                  {canReview && log.status === 'pending' ? (
                    <div className="flex gap-2 shrink-0 mt-2 sm:mt-0">
                      <Button
                        size="sm"
                        className="gradient-btn h-9 rounded-lg"
                        onClick={() => void handleApprove(log.id)}
                        disabled={approveMutation.isPending}
                      >
                        <Check className="mr-1 h-4 w-4" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-9 rounded-lg hover:text-destructive hover:bg-destructive/5"
                        onClick={() => setRejectId(log.id)}
                        disabled={rejectMutation.isPending}
                      >
                        <X className="mr-1 h-4 w-4" /> Reject
                      </Button>
                    </div>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      </QueryState>

      <ConfirmDialog
        open={Boolean(rejectId)}
        onOpenChange={(open) => {
          if (!open) {
            setRejectId(null)
            setRejectReason('')
          }
        }}
        title="Reject hour log"
        confirmLabel="Reject"
        variant="destructive"
        isLoading={rejectMutation.isPending}
        onConfirm={handleReject}
      >
        <Editor
          label="Reason"
          name="reason"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </ConfirmDialog>
    </div>
  )
}
