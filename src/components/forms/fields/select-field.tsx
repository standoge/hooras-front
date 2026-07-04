import { useId, type ElementType } from 'react'
import { FieldWrapper } from '../field-wrapper'
import { fieldTriggerBase, fieldInputError } from '../field-styles'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface SelectOption {
  label: string
  value: string | number
  icon?: ElementType
  image?: string
}

export interface SelectFieldProps {
  label?: string
  hint?: string
  error?: string
  inline?: boolean
  disabled?: boolean
  options: SelectOption[]
  value?: string | number
  defaultValue?: string | number
  name?: string
  placeholder?: string
  onChange?: (e: { target: { name: string; value: string | number }; persist: () => void }) => void
}

export function SelectField({
  label,
  hint,
  error,
  inline = false,
  disabled = false,
  options = [],
  value,
  defaultValue,
  name = '',
  placeholder = 'Select an option',
  onChange,
}: SelectFieldProps) {
  const generatedId = useId()
  const id = `${name || 'select'}-${generatedId}`

  const isControlled = value !== undefined
  const stringValue = isControlled ? String(value) : undefined
  const stringDefault = !isControlled && defaultValue !== undefined ? String(defaultValue) : undefined

  const selectedOption = options.find((opt) => String(opt.value) === String(value ?? defaultValue))

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
      <Select
        value={stringValue}
        defaultValue={stringDefault}
        disabled={disabled}
        onValueChange={handleValueChange}
      >
        <SelectTrigger
          id={id}
          name={name}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(fieldTriggerBase, error && fieldInputError)}
        >
          <SelectValue placeholder={placeholder}>
            {selectedOption ? (
              <span className="flex items-center gap-2 truncate">
                {selectedOption.image ? (
                  <img
                    src={selectedOption.image}
                    alt={selectedOption.label}
                    className="h-5 w-5 rounded-full border border-border object-cover"
                  />
                ) : null}
                {selectedOption.icon ? (
                  <selectedOption.icon size={16} className="text-muted-foreground" />
                ) : null}
                <span>{selectedOption.label}</span>
              </span>
            ) : null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.length === 0 ? (
            <div className="p-2 text-center text-xs text-muted-foreground">No options available</div>
          ) : (
            options.map((opt) => (
              <SelectItem key={opt.value} value={String(opt.value)}>
                <span className="flex items-center gap-2">
                  {opt.image ? (
                    <img
                      src={opt.image}
                      alt={opt.label}
                      className="h-5 w-5 rounded-full border border-border object-cover"
                    />
                  ) : null}
                  {opt.icon ? <opt.icon size={16} className="text-muted-foreground" /> : null}
                  <span>{opt.label}</span>
                </span>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </FieldWrapper>
  )
}
