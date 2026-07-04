import { type ElementType, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface FieldWrapperProps {
  label?: string
  hint?: string
  error?: string
  inline?: boolean
  icon?: ElementType
  iconPosition?: 'left' | 'right'
  disabled?: boolean
  children: ReactNode
  id: string
}

export function FieldWrapper({
  label,
  hint,
  error,
  inline = false,
  disabled = false,
  children,
  id,
}: FieldWrapperProps) {
  const labelId = `${id}-label`
  const hintId = `${id}-hint`
  const errorId = `${id}-error`

  return (
    <div
      className={cn(
        'group/field flex w-full',
        inline ? 'flex-row items-center gap-4 py-1' : 'flex-col gap-1.5',
        disabled && 'pointer-events-none opacity-60',
      )}
    >
      {label ? (
        <label
          id={labelId}
          htmlFor={id}
          className={cn(
            'select-none text-[length:var(--text-body-sm)] font-medium tracking-wide text-foreground transition-colors group-focus-within/field:text-primary',
            inline ? 'w-[30%] truncate pr-2 text-right' : 'w-full',
            error && 'text-destructive group-focus-within/field:text-destructive',
          )}
        >
          {label}
        </label>
      ) : null}

      <div className={cn('flex flex-1 flex-col gap-1.5', inline ? 'w-[70%]' : 'w-full')}>
        {children}

        {error ? (
          <p
            id={errorId}
            role="alert"
            className="animate-in fade-in-0 slide-in-from-top-2 text-xs font-medium text-destructive"
          >
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="text-xs font-normal text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  )
}
