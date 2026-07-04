import { useId } from 'react'
import { FieldWrapper } from '../field-wrapper'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

export interface SwitchFieldProps {
  label?: string
  hint?: string
  error?: string
  checked?: boolean
  defaultChecked?: boolean
  inline?: boolean
  disabled?: boolean
  name?: string
  onChange?: (e: { target: { name: string; value: boolean }; persist: () => void }) => void
}

export function SwitchField({
  label,
  hint,
  error,
  checked,
  defaultChecked,
  inline = false,
  disabled = false,
  name = '',
  onChange,
}: SwitchFieldProps) {
  const generatedId = useId()
  const id = `${name || 'switch'}-${generatedId}`

  const isControlled = checked !== undefined

  const handleCheckedChange = (nextVal: boolean) => {
    onChange?.({
      target: { name, value: nextVal },
      persist: () => {},
    })
  }

  return (
    <FieldWrapper id={id} hint={hint} error={error} inline={inline} disabled={disabled}>
      <div
        className={cn(
          'flex w-full items-center justify-between',
          !inline && 'rounded-lg border border-border bg-muted/50 p-3',
        )}
      >
        {label ? (
          <label
            htmlFor={id}
            className="cursor-pointer select-none text-sm font-medium tracking-wide text-foreground"
          >
            {label}
          </label>
        ) : null}

        <Switch
          id={id}
          name={name}
          checked={isControlled ? checked : undefined}
          defaultChecked={!isControlled ? defaultChecked : undefined}
          disabled={disabled}
          onCheckedChange={handleCheckedChange}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        />
      </div>
    </FieldWrapper>
  )
}
