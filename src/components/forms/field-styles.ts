import { cn } from '@/lib/utils'

/** Single-line control height (40px) */
export const fieldControlHeight = 'h-10'

/** Multi-select trigger minimum height */
export const fieldControlMinHeight = 'min-h-10'

/** Label → control → hint vertical gap (12px / --element-gap) */
export const fieldStackGap = 'gap-[var(--element-gap)]'

const fieldInputShared = cn(
  'w-full rounded-lg border border-border bg-muted px-3 py-2 text-[length:var(--text-body-sm)] text-foreground transition-all outline-none',
  'placeholder:text-muted-foreground',
  'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  'disabled:cursor-not-allowed disabled:opacity-50',
)

/** Shared input styles for single-line form fields */
export const fieldInputBase = cn(fieldInputShared, fieldControlHeight)

/** Textarea variant — no fixed height */
export const fieldTextareaBase = fieldInputShared

export const fieldInputError =
  'border-destructive focus-visible:border-destructive focus-visible:ring-destructive'

export const fieldTriggerBase = cn(
  'flex w-full cursor-pointer items-center justify-between rounded-lg border border-border bg-muted px-3 py-2 text-left text-[length:var(--text-body-sm)] text-foreground transition-all outline-none',
  fieldControlHeight,
  'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  'disabled:cursor-not-allowed disabled:opacity-50',
)

/** Multi-select trigger — grows with chips */
export const fieldTriggerMultiBase = cn(fieldTriggerBase, fieldControlMinHeight, 'h-auto')

export const fieldOptionSelected = 'bg-primary/10 font-medium text-primary'
export const fieldOptionDefault = 'text-foreground hover:bg-accent hover:text-accent-foreground'

export const fieldIconMuted =
  'text-muted-foreground transition-colors group-focus-within/input:text-primary'
