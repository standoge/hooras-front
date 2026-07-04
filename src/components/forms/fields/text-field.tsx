import { forwardRef, useId, type ComponentPropsWithRef, type ElementType } from 'react'
import { FieldWrapper } from '../field-wrapper'
import { fieldIconMuted, fieldInputBase, fieldInputError } from '../field-styles'
import { cn } from '@/lib/utils'

export interface TextFieldProps extends Omit<ComponentPropsWithRef<'input'>, 'onChange'> {
  label?: string
  hint?: string
  error?: string
  inline?: boolean
  icon?: ElementType
  iconPosition?: 'left' | 'right'
  disabled?: boolean
  onChange?: (e: { target: { name: string; value: string }; persist: () => void }) => void
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      hint,
      error,
      inline = false,
      icon: Icon,
      iconPosition = 'left',
      disabled = false,
      className,
      id: customId,
      name = '',
      onChange,
      type = 'text',
      ...props
    },
    ref,
  ) => {
    const generatedId = useId()
    const id = customId || generatedId

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        <div className="group/input relative w-full">
          {Icon && iconPosition === 'left' ? (
            <div
              className={cn(
                'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3',
                fieldIconMuted,
              )}
            >
              <Icon size={16} />
            </div>
          ) : null}

          <input
            ref={ref}
            id={id}
            name={name}
            type={type}
            disabled={disabled}
            onChange={handleChange}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            className={cn(
              fieldInputBase,
              error && fieldInputError,
              Icon && iconPosition === 'left' && 'pl-10',
              Icon && iconPosition === 'right' && 'pr-10',
              className,
            )}
            {...props}
          />

          {Icon && iconPosition === 'right' ? (
            <div
              className={cn(
                'pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3',
                fieldIconMuted,
              )}
            >
              <Icon size={16} />
            </div>
          ) : null}
        </div>
      </FieldWrapper>
    )
  },
)

TextField.displayName = 'TextField'
