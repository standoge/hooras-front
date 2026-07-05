import { useState } from 'react'
import { useAuth } from '@/auth/AuthProvider'
import { canManageProjects, usesStudentApi } from '@/auth/roles'
import {
  useDocumentRequirements,
  useDocuments,
  useCreateDocumentRequirement,
  useUpdateDocumentRequirement,
  useRegisterDocumentUpload,
  useApproveDocument,
  useRejectDocument,
} from '@/api/hooks'
import { fetchAuthenticatedFile } from '@/api/files'
import { getStoredToken } from '@/api/client'
import { SelectField, TextField, SwitchField, UploadField, type UploadFieldItem } from '@/components/forms'
import { QueryState, ConfirmDialog } from '@/components/feedback'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/layout/StatusBadge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Editor } from '@/components/editor'
import { toastMutationError, toastMutationSuccess } from '@/lib/mutations'
import { DocumentRequirementCard } from '@/pages/documents/DocumentRequirementCard'

async function openAuthenticatedFile(storageRef: string) {
  try {
    const blob = await fetchAuthenticatedFile(storageRef)
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank', 'noopener,noreferrer')
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch (error) {
    toastMutationError(error, 'Unable to open file.')
  }
}

export function DocumentsPage() {
  const { user } = useAuth()
  const canManage = canManageProjects(user?.roles)
  const studentScope = usesStudentApi(user?.roles)

  const requirementsQuery = useDocumentRequirements({ studentScope })
  const documentsQuery = useDocuments(undefined, { studentScope })
  const createRequirementMutation = useCreateDocumentRequirement()
  const updateRequirementMutation = useUpdateDocumentRequirement()
  const registerUploadMutation = useRegisterDocumentUpload()
  const approveMutation = useApproveDocument()
  const rejectMutation = useRejectDocument()

  const [reqKey, setReqKey] = useState('')
  const [reqLabel, setReqLabel] = useState('')
  const [reqRequired, setReqRequired] = useState(true)
  const [reqFileTypes, setReqFileTypes] = useState('pdf,docx')

  const [uploadRequirementId, setUploadRequirementId] = useState('')
  const [ownerRef, setOwnerRef] = useState(user?.studentRef ?? '')
  const [uploadFiles, setUploadFiles] = useState<UploadFieldItem[]>([])

  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [togglingRequirementId, setTogglingRequirementId] = useState<string | null>(null)

  const uploadHeaders: Record<string, string> | undefined = (() => {
    const token = getStoredToken()
    return token ? { Authorization: `Bearer ${token}` } : undefined
  })()

  const handleCreateRequirement = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createRequirementMutation.mutateAsync({
        key: reqKey,
        label: reqLabel,
        required: reqRequired,
        allowedFileTypes: reqFileTypes.split(',').map((t) => t.trim()),
      })
      toastMutationSuccess('Requirement created')
      setReqKey('')
      setReqLabel('')
    } catch (error) {
      toastMutationError(error)
    }
  }

  const handleRegisterUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    const file = uploadFiles[0]
    if (!file) return
    try {
      await registerUploadMutation.mutateAsync({
        documentRequirementId: uploadRequirementId,
        ownerRef,
        fileName: file.name,
        storageRef: file.remoteUrl ?? file.id,
      })
      toastMutationSuccess('Upload registered')
      setUploadFiles([])
    } catch (error) {
      toastMutationError(error)
    }
  }

  const handleApprove = async (documentId: string) => {
    try {
      await approveMutation.mutateAsync(documentId)
      toastMutationSuccess('Document approved')
    } catch (error) {
      toastMutationError(error)
    }
  }

  const handleReject = async () => {
    if (!rejectId) return
    try {
      await rejectMutation.mutateAsync({ documentId: rejectId, reason: rejectReason })
      toastMutationSuccess('Document rejected')
      setRejectId(null)
      setRejectReason('')
    } catch (error) {
      toastMutationError(error)
    }
  }

  const handleToggleActive = async (id: string, active: boolean) => {
    setTogglingRequirementId(id)
    try {
      await updateRequirementMutation.mutateAsync({ id, active })
      toastMutationSuccess(active ? 'Requirement activated' : 'Requirement deactivated')
    } catch (error) {
      toastMutationError(error)
    } finally {
      setTogglingRequirementId(null)
    }
  }

  const sortedRequirements = [...(requirementsQuery.data ?? [])].sort((a, b) => {
    const aActive = a.active !== false ? 1 : 0
    const bActive = b.active !== false ? 1 : 0
    if (aActive !== bActive) return bActive - aActive
    return a.label.localeCompare(b.label)
  })

  const requirementOptions =
    requirementsQuery.data?.map((req) => ({ label: req.label, value: req.id })) ?? []

  return (
    <div className="mx-auto max-w-[var(--page-max-width)] px-4 py-10 sm:px-10">
      <PageHeader
        title="Documents"
        description={
          studentScope
            ? 'Upload required documents and track review status.'
            : 'Manage requirements and document uploads.'
        }
      />

      <Tabs defaultValue="requirements">
        <TabsList className="mb-6">
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="uploads">Uploads</TabsTrigger>
        </TabsList>

        <TabsContent value="requirements" className="space-y-6">
          {canManage ? (
            <form
              onSubmit={handleCreateRequirement}
              className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-sm)]"
            >
              <h2 className="mb-4 text-lg font-semibold text-foreground">Create requirement</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Key" name="key" value={reqKey} onChange={(e) => setReqKey(e.target.value)} />
                <TextField label="Label" name="label" value={reqLabel} onChange={(e) => setReqLabel(e.target.value)} />
                <TextField
                  label="Allowed file types"
                  name="fileTypes"
                  value={reqFileTypes}
                  onChange={(e) => setReqFileTypes(e.target.value)}
                  hint="Comma-separated, e.g. pdf,docx"
                />
                <SwitchField
                  label="Required"
                  name="required"
                  checked={reqRequired}
                  onChange={(e) => setReqRequired(e.target.value)}
                />
              </div>
              <Button type="submit" className="mt-4" disabled={createRequirementMutation.isPending}>
                Create
              </Button>
            </form>
          ) : null}

          <QueryState
            isLoading={requirementsQuery.isLoading}
            isError={requirementsQuery.isError}
            error={requirementsQuery.error}
            isEmpty={!requirementsQuery.data?.length}
            onRetry={() => void requirementsQuery.refetch()}
            emptyTitle="No requirements defined"
          >
            <div className="space-y-4">
              {sortedRequirements.map((req) => (
                <DocumentRequirementCard
                  key={req.id}
                  requirement={req}
                  canManage={canManage}
                  studentScope={studentScope}
                  uploadHeaders={uploadHeaders}
                  onUploadComplete={() => {
                    void requirementsQuery.refetch()
                    void documentsQuery.refetch()
                  }}
                  onToggleActive={(id, active) => void handleToggleActive(id, active)}
                  isToggling={togglingRequirementId === req.id}
                />
              ))}
            </div>
          </QueryState>
        </TabsContent>

        <TabsContent value="uploads" className="space-y-6">
          {!studentScope ? (
            <form
              onSubmit={handleRegisterUpload}
              className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-sm)]"
            >
              <h2 className="mb-4 text-lg font-semibold text-foreground">Register upload</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Owner reference"
                  name="ownerRef"
                  value={ownerRef}
                  onChange={(e) => setOwnerRef(e.target.value)}
                />
                <SelectField
                  label="Requirement"
                  name="documentRequirementId"
                  value={uploadRequirementId}
                  options={[{ label: 'Select requirement', value: '' }, ...requirementOptions]}
                  onChange={(e) => setUploadRequirementId(String(e.target.value))}
                />
              </div>
              <div className="mt-4">
                <UploadField
                  label="File"
                  name="upload"
                  value={uploadFiles}
                  maxFiles={1}
                  onChange={(e) => setUploadFiles(e.target.value)}
                />
              </div>
              <Button type="submit" className="mt-4" disabled={registerUploadMutation.isPending}>
                Register
              </Button>
            </form>
          ) : null}

          <QueryState
            isLoading={documentsQuery.isLoading}
            isError={documentsQuery.isError}
            error={documentsQuery.error}
            isEmpty={!documentsQuery.data?.length}
            onRetry={() => void documentsQuery.refetch()}
            emptyTitle="No uploads yet"
          >
            <div className="space-y-4">
              {documentsQuery.data?.map((doc) => (
                <article
                  key={doc.id}
                  className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-sm)]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-foreground">{doc.fileName}</h2>
                        <StatusBadge status={doc.status} kind="approval" />
                      </div>
                      {!studentScope ? (
                        <p className="mt-1 text-sm text-muted-foreground">Owner: {doc.ownerRef}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {doc.storageRef ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => void openAuthenticatedFile(doc.storageRef)}
                        >
                          View file
                        </Button>
                      ) : null}
                      {canManage && doc.status === 'pending' ? (
                        <>
                          <Button size="sm" onClick={() => void handleApprove(doc.id)}>
                            Approve
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => setRejectId(doc.id)}>
                            Reject
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </QueryState>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={Boolean(rejectId)}
        onOpenChange={(open) => {
          if (!open) {
            setRejectId(null)
            setRejectReason('')
          }
        }}
        title="Reject document"
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
