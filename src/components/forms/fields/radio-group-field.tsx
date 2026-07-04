import { useId, type ElementType } from 'react'
import { FieldWrapper } from '../field-wrapper'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

export interface RadioOption {
  label: string
  value: string | number
}

export interface RadioGroupFieldProps {
  label?: string
  hint?: string
  error?: string
  options: RadioOption[]
  value?: string | number
  defaultValue?: string | number
  inline?: boolean
  disabled?: boolean
  name?: string
  icon?: ElementType
  onChange?: (e: { target: { name: string; value: string | number }; persist: () => void }) => void
}

export function RadioGroupField({
  label,
  hint,
  error,
  options = [],
  value,
  defaultValue,
  inline = false,
  disabled = false,
  name = '',
  icon: Icon,
  onChange,
}: RadioGroupFieldProps) {
  const generatedId = useId()
  const id = `${name || 'radiogroup'}-${generatedId}`

  const isControlled = value !== undefined

  const handleValueChange = (val: string) => {
    const opt = options.find((o) => String(o.value) === val)
    const resolved = opt ? opt.value : val
    onChange?.({
      target: { name, value: resolved },
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
      <RadioGroup
        id={id}
        name={name}
        value={isControlled ? String(value) : undefined}
        defaultValue={!isControlled && defaultValue !== undefined ? String(defaultValue) : undefined}
        disabled={disabled}
        onValueChange={handleValueChange}
        className={cn('w-full gap-4', inline ? 'flex flex-row flex-wrap items-center' : 'flex flex-col')}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      >
        {options.map((opt) => {
          const optId = `${id}-${opt.value}`

          return (
            <div key={opt.value} className="flex items-center gap-3">
              <RadioGroupItem value={String(opt.value)} id={optId} />
              <Label
                htmlFor={optId}
                className="flex cursor-pointer items-center gap-2 text-sm font-medium tracking-wide text-foreground"
              >
                {Icon ? <Icon size={16} className="text-muted-foreground" /> : null}
                <span>{opt.label}</span>
              </Label>
            </div>
          )
        })}
      </RadioGroup>
    </FieldWrapper>
  )
}
