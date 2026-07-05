import { cn } from '@/lib/utils'

/** Single-line control height (40px) */
export const fieldControlHeight = 'h-10'

/** Multi-select trigger minimum height */
export const fieldControlMinHeight = 'min-h-10'

/** Label → control → hint vertical gap (12px / --element-gap) */
export const fieldStackGap = 'gap-[var(--element-gap)]'

const fieldInputShared = cn(
  'w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-[length:var(--text-body-sm)] text-foreground transition-all outline-none duration-200',
  'placeholder:text-muted-foreground',
  'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 focus-visible:bg-card focus-visible:shadow-[0_0_8px_rgba(0,107,255,0.12)]',
  'disabled:cursor-not-allowed disabled:opacity-50',
)

/** Shared input styles for single-line form fields */
export const fieldInputBase = cn(fieldInputShared, fieldControlHeight)

/** Textarea variant — no fixed height */
export const fieldTextareaBase = fieldInputShared

export const fieldInputError =
  'border-destructive focus-visible:border-destructive focus-visible:ring-destructive'

export const fieldTriggerBase = cn(
  'flex w-full cursor-pointer items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-left text-[length:var(--text-body-sm)] text-foreground transition-all outline-none duration-200',
  fieldControlHeight,
  'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 focus-visible:bg-card focus-visible:shadow-[0_0_8px_rgba(0,107,255,0.12)]',
  'disabled:cursor-not-allowed disabled:opacity-50',
)

/** Multi-select trigger — grows with chips */
export const fieldTriggerMultiBase = cn(fieldTriggerBase, fieldControlMinHeight, 'h-auto')

export const fieldOptionSelected = 'bg-primary/10 font-medium text-primary'
export const fieldOptionDefault = 'text-foreground hover:bg-accent hover:text-accent-foreground'

export const fieldIconMuted =
  'text-muted-foreground transition-colors group-focus-within/input:text-primary'
