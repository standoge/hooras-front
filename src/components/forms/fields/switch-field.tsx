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
  value?: boolean
  defaultValue?: boolean
  inline?: boolean
  disabled?: boolean
  name?: string
  onChange?: (e: {
    target: { name: string; value: boolean; checked: boolean; type: 'checkbox' }
    persist: () => void
  }) => void
}

export function SwitchField({
  label,
  hint,
  error,
  checked,
  defaultChecked,
  value,
  defaultValue,
  inline = false,
  disabled = false,
  name = '',
  onChange,
}: SwitchFieldProps) {
  const generatedId = useId()
  const id = `${name || 'switch'}-${generatedId}`

  const isControlled = checked !== undefined || value !== undefined
  const isChecked = checked !== undefined ? checked : value
  const initialChecked = defaultChecked !== undefined ? defaultChecked : defaultValue

  const handleCheckedChange = (nextVal: boolean) => {
    onChange?.({
      target: { name, value: nextVal, checked: nextVal, type: 'checkbox' },
      persist: () => {},
    })
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
      <div
        className={cn(
          'flex w-full items-center',
          inline ? 'justify-end' : 'h-10',
        )}
      >
        <Switch
          id={id}
          name={name}
          checked={isControlled ? isChecked : undefined}
          defaultChecked={!isControlled ? initialChecked : undefined}
          disabled={disabled}
          onCheckedChange={handleCheckedChange}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        />
      </div>
    </FieldWrapper>
  )
}
