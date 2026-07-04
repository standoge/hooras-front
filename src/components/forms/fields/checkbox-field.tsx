import { useId, type ElementType } from 'react'
import { FieldWrapper } from '../field-wrapper'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

export interface CheckboxFieldProps {
  label?: string
  hint?: string
  error?: string
  inline?: boolean
  disabled?: boolean
  checked?: boolean
  defaultChecked?: boolean
  name?: string
  icon?: ElementType
  iconPosition?: 'left' | 'right'
  onChange?: (e: { target: { name: string; value: boolean }; persist: () => void }) => void
}

export function CheckboxField({
  label,
  hint,
  error,
  inline = false,
  disabled = false,
  checked,
  defaultChecked,
  name = '',
  icon: Icon,
  iconPosition = 'left',
  onChange,
}: CheckboxFieldProps) {
  const generatedId = useId()
  const id = `${name || 'checkbox'}-${generatedId}`

  const isControlled = checked !== undefined

  const handleCheckedChange = (nextVal: boolean) => {
    onChange?.({
      target: { name, value: nextVal },
      persist: () => {},
    })
  }

  return (
    <FieldWrapper id={id} hint={hint} error={error} inline={inline} disabled={disabled}>
      <label
        htmlFor={id}
        className={cn(
          'inline-flex cursor-pointer select-none items-start gap-3',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <Checkbox
          id={id}
          name={name}
          checked={isControlled ? checked : undefined}
          defaultChecked={!isControlled ? defaultChecked : undefined}
          disabled={disabled}
          onCheckedChange={handleCheckedChange}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn('mt-0.5', error && 'border-destructive')}
        />

        {label || Icon ? (
          <div className="flex items-center gap-2 text-sm font-medium leading-tight tracking-wide text-foreground">
            {Icon && iconPosition === 'left' ? (
              <Icon size={16} className="text-muted-foreground" />
            ) : null}
            {label ? <span>{label}</span> : null}
            {Icon && iconPosition === 'right' ? (
              <Icon size={16} className="text-muted-foreground" />
            ) : null}
          </div>
        ) : null}
      </label>
    </FieldWrapper>
  )
}
