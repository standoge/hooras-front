import type { DocumentRequirement } from '@/api/types'
import type { MyDocumentRequirement } from '@/api/hooks/use-documents'
import { getDocumentUploadUrl } from '@/api/files'
import { UploadField } from '@/components/forms'
import { StatusBadge } from '@/components/layout/StatusBadge'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { FileText } from 'lucide-react'

type RequirementCardData = DocumentRequirement | MyDocumentRequirement

function isStudentRequirement(
  requirement: RequirementCardData,
): requirement is MyDocumentRequirement {
  return 'uploadStatus' in requirement
}

interface DocumentRequirementCardProps {
  requirement: RequirementCardData
  canManage: boolean
  studentScope: boolean
  uploadHeaders?: Record<string, string>
  onUploadComplete?: () => void
  onToggleActive?: (id: string, active: boolean) => void
  isToggling?: boolean
}

export function DocumentRequirementCard({
  requirement,
  canManage,
  studentScope,
  uploadHeaders,
  onUploadComplete,
  onToggleActive,
  isToggling = false,
}: DocumentRequirementCardProps) {
  const isActive = requirement.active !== false
  const uploadStatus = isStudentRequirement(requirement) ? requirement.uploadStatus : undefined

  return (
    <article
      className={cn(
        'group rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm-2)]',
        !isActive && canManage && 'opacity-60',
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-start gap-2">
            <div className="flex min-w-0 flex-1 items-start gap-2">
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-foreground">{requirement.label}</h3>
                  {canManage ? (
                    <StatusBadge
                      status={isActive ? 'active' : 'inactive'}
                      kind="lifecycle"
                    />
                  ) : null}
                  {requirement.required ? (
                    <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      Required
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      Optional
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{requirement.key}</p>
              </div>
            </div>
          </div>

          {requirement.description ? (
            <p className="text-sm text-muted-foreground">{requirement.description}</p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {requirement.allowedFileTypes.map((type) => (
              <span
                key={type}
                className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-foreground"
              >
                {type}
              </span>
            ))}
          </div>

          {uploadStatus ? (
            <StatusBadge
              status={uploadStatus}
              kind="approval"
            />
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-3 sm:items-end">
          {canManage ? (
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3">
              <label
                htmlFor={`active-${requirement.id}`}
                className="text-sm font-medium text-foreground"
              >
                Active
              </label>
              <Switch
                id={`active-${requirement.id}`}
                checked={isActive}
                disabled={isToggling}
                onCheckedChange={(checked) => onToggleActive?.(requirement.id, checked)}
              />
            </div>
          ) : null}

          {studentScope ? (
            <div className="min-w-[240px]">
              <UploadField
                label={`Upload for ${requirement.label}`}
                name={`upload-${requirement.id}`}
                maxFiles={1}
                uploadUrl={getDocumentUploadUrl(requirement.id)}
                uploadHeaders={uploadHeaders}
                onChange={() => onUploadComplete?.()}
              />
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}
