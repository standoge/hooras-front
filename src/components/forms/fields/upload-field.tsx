import { useId, useRef, useState } from 'react'
import { FieldWrapper } from '../field-wrapper'
import { UploadCloud, File, X, Check, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface UploadFieldItem {
  id: string
  file?: File
  name: string
  size?: number
  type?: string
  previewUrl?: string
  remoteUrl?: string
  status: 'pending' | 'uploading' | 'done' | 'error'
  progress?: number
  error?: string
}

export interface UploadFieldProps {
  label?: string
  hint?: string
  error?: string
  inline?: boolean
  disabled?: boolean
  value?: UploadFieldItem[]
  defaultValue?: UploadFieldItem[]
  uploadUrl?: string
  uploadMethod?: 'POST' | 'PUT' | 'PATCH'
  uploadFieldName?: string
  uploadHeaders?: Record<string, string>
  uploadData?: Record<string, unknown>
  mapUploadResponse?: (response: unknown) => { remoteUrl: string }
  multiple?: boolean
  maxFiles?: number
  previewStrategy?: 'auto' | 'image-only' | 'none'
  removable?: boolean
  name?: string
  onChange?: (e: {
    target: {
      name: string
      value: UploadFieldItem[]
      files: File[]
      uploaded: boolean
    }
    persist: () => void
  }) => void
}

export function UploadField({
  label,
  hint,
  error,
  inline = false,
  disabled = false,
  value,
  defaultValue = [],
  uploadUrl,
  uploadMethod = 'POST',
  uploadFieldName = 'file',
  uploadHeaders = {},
  uploadData = {},
  mapUploadResponse,
  multiple = false,
  maxFiles,
  previewStrategy = 'auto',
  removable = true,
  name = '',
  onChange,
}: UploadFieldProps) {
  const generatedId = useId()
  const id = `${name || 'upload'}-${generatedId}`

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const [internalVal, setInternalVal] = useState<UploadFieldItem[]>(defaultValue)
  const currentVal = value !== undefined ? value : internalVal

  const triggerChange = (newItems: UploadFieldItem[]) => {
    if (value === undefined) {
      setInternalVal(newItems)
    }

    const files = newItems.map((item) => item.file).filter(Boolean) as File[]
    const allUploaded = newItems.every((item) => item.status === 'done')

    onChange?.({
      target: {
        name,
        value: newItems,
        files,
        uploaded: allUploaded,
      },
      persist: () => {},
    })
  }

  const uploadFile = (item: UploadFieldItem, itemsList: UploadFieldItem[]) => {
    if (!uploadUrl || !item.file) return

    const xhr = new XMLHttpRequest()
    const formData = new FormData()
    formData.append(uploadFieldName, item.file)

    Object.entries(uploadData).forEach(([key, val]) => {
      formData.append(key, String(val))
    })

    xhr.open(uploadMethod, uploadUrl, true)

    Object.entries(uploadHeaders).forEach(([key, val]) => {
      xhr.setRequestHeader(key, val)
    })

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100)

        const updatedList = itemsList.map((it) => {
          if (it.id === item.id) {
            return { ...it, status: 'uploading' as const, progress: percent }
          }
          return it
        })
        triggerChange(updatedList)
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        let remoteUrl = ''
        try {
          const response = JSON.parse(xhr.responseText) as Record<string, unknown>
          if (mapUploadResponse) {
            remoteUrl = mapUploadResponse(response).remoteUrl
          } else {
            const data = response.data as Record<string, unknown> | undefined
            remoteUrl =
              (response.url as string) ||
              (response.secure_url as string) ||
              (response.storageRef as string) ||
              (response.id as string) ||
              (data?.url as string) ||
              ''
          }
        } catch (e) {
          console.warn('Failed to parse upload response JSON', e)
        }

        const updatedList = itemsList.map((it) => {
          if (it.id === item.id) {
            return { ...it, status: 'done' as const, progress: 100, remoteUrl }
          }
          return it
        })
        triggerChange(updatedList)
      } else {
        let errorMessage = `Upload failed (${xhr.status})`
        try {
          const response = JSON.parse(xhr.responseText) as Record<string, unknown>
          const nested = response.error as Record<string, unknown> | undefined
          if (typeof nested?.message === 'string') {
            errorMessage = nested.message
          } else if (typeof response.message === 'string') {
            errorMessage = response.message
          }
        } catch {
          if (xhr.statusText) {
            errorMessage = `Upload failed: ${xhr.statusText}`
          }
        }

        const updatedList = itemsList.map((it) => {
          if (it.id === item.id) {
            return { ...it, status: 'error' as const, error: errorMessage }
          }
          return it
        })
        triggerChange(updatedList)
      }
    }

    xhr.onerror = () => {
      const updatedList = itemsList.map((it) => {
        if (it.id === item.id) {
          return { ...it, status: 'error' as const, error: 'Network error occurred' }
        }
        return it
      })
      triggerChange(updatedList)
    }

    xhr.send(formData)
  }

  const handleFilesAdded = (filesList: FileList) => {
    if (disabled) return

    const newItems: UploadFieldItem[] = []
    const limit = maxFiles !== undefined ? maxFiles : Infinity
    const currentCount = currentVal.length

    const availableSlots = limit - currentCount
    if (availableSlots <= 0) return

    const filesToProcess = Array.from(filesList).slice(0, multiple ? availableSlots : 1)

    filesToProcess.forEach((file) => {
      let previewUrl = ''
      const isImage = file.type.startsWith('image/')

      if (isImage && (previewStrategy === 'auto' || previewStrategy === 'image-only')) {
        previewUrl = URL.createObjectURL(file)
      }

      const item: UploadFieldItem = {
        id: Math.random().toString(36).substring(2, 9),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl,
        status: uploadUrl ? 'pending' : 'done',
        progress: 0,
      }

      newItems.push(item)
    })

    const updatedList = multiple ? [...currentVal, ...newItems] : newItems
    triggerChange(updatedList)

    if (uploadUrl) {
      newItems.forEach((item) => {
        uploadFile(item, updatedList)
      })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (disabled) return
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    if (e.dataTransfer.files) {
      handleFilesAdded(e.dataTransfer.files)
    }
  }

  const handleRemove = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation()
    if (!removable || disabled) return
    const updatedList = currentVal.filter((item) => item.id !== itemId)
    triggerChange(updatedList)
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  return (
    <FieldWrapper
      id={id}
      label={label}
      hint={hint}
      error={error}
      inline={inline}
      disabled={disabled}
    >
      <div className="flex w-full flex-col gap-3">
        <input
          ref={fileInputRef}
          id={id}
          type="file"
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files) {
              handleFilesAdded(e.target.files)
            }
          }}
          className="sr-only"
        />

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={cn(
            'flex w-full cursor-pointer select-none flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 p-6 transition-all duration-300 ease-in-out',
            isDragging && 'scale-[0.99] border-primary bg-primary/10',
            disabled && 'cursor-not-allowed border-border bg-transparent opacity-50',
          )}
        >
          <UploadCloud
            size={36}
            className={cn(
              'text-muted-foreground transition-colors duration-300',
              isDragging && 'text-primary',
            )}
          />
          <span className="mt-3 text-sm font-semibold tracking-wide text-foreground">
            {isDragging ? 'Drop your files here' : 'Drag and drop your files here'}
          </span>
          <span className="mt-1 text-xs text-muted-foreground">
            or <span className="font-medium text-primary hover:underline">browse files</span> on your
            computer
          </span>
        </div>

        {currentVal.length > 0 ? (
          <div className="flex flex-col gap-2">
            {currentVal.map((item) => (
              <div
                key={item.id}
                className="flex w-full animate-in items-center gap-3 rounded-lg border border-border bg-muted p-2 fade-in-0 slide-in-from-top-2"
              >
                {item.previewUrl ? (
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="h-10 w-10 rounded-lg border border-border object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-accent text-muted-foreground">
                    <File size={20} />
                  </div>
                )}

                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-xs font-semibold text-foreground">{item.name}</span>
                  <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                    {formatFileSize(item.size)}
                  </span>

                  {item.status === 'uploading' ? (
                    <div className="mt-1.5 flex w-full items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-accent">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-150"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <span className="font-mono text-[9px] font-bold text-primary">
                        {item.progress}%
                      </span>
                    </div>
                  ) : null}

                  {item.status === 'error' ? (
                    <span className="mt-1 flex items-center gap-1 text-[10px] font-medium text-destructive">
                      <AlertCircle size={10} />
                      {item.error || 'Failed to upload'}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-shrink-0 items-center gap-1">
                  {item.status === 'uploading' ? (
                    <Loader2 size={14} className="animate-spin text-primary" />
                  ) : null}
                  {item.status === 'done' ? (
                    <div className="rounded border border-emerald-500/40 bg-emerald-500/10 p-0.5 text-emerald-500">
                      <Check size={12} className="stroke-[3px]" />
                    </div>
                  ) : null}
                  {item.status === 'error' ? (
                    <div className="rounded border border-destructive/40 bg-rose-500/10 p-0.5 font-bold text-destructive">
                      <X size={12} className="stroke-[3px]" />
                    </div>
                  ) : null}

                  {removable ? (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={(e) => handleRemove(e, item.id)}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
                      title="Remove file"
                      aria-label="Remove file"
                    >
                      <X size={14} />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </FieldWrapper>
  )
}
