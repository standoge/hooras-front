import { forwardRef, useId, type ComponentPropsWithRef } from 'react'
import { FieldWrapper } from '../field-wrapper'
import { fieldInputError, fieldTextareaBase } from '../field-styles'
import { cn } from '@/lib/utils'

export interface TextareaFieldProps extends Omit<ComponentPropsWithRef<'textarea'>, 'onChange'> {
  label?: string
  hint?: string
  error?: string
  inline?: boolean
  disabled?: boolean
  rows?: number
  onChange?: (e: { target: { name: string; value: string }; persist: () => void }) => void
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  (
    {
      label,
      hint,
      error,
      inline = false,
      disabled = false,
      rows = 4,
      className,
      id: customId,
      name = '',
      onChange,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId()
    const id = customId || generatedId

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.({
        target: {
          name: e.target.name || name,
          value: e.target.value,
        },
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
        <textarea
          ref={ref}
          id={id}
          name={name}
          rows={rows}
          disabled={disabled}
          onChange={handleChange}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(fieldTextareaBase, 'resize-y', error && fieldInputError, className)}
          {...props}
        />
      </FieldWrapper>
    )
  },
)

TextareaField.displayName = 'TextareaField'
