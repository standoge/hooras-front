import { forwardRef, useId, useState } from 'react'
import { FieldWrapper } from '../field-wrapper'
import { fieldIconMuted, fieldInputBase, fieldInputError } from '../field-styles'
import { cn } from '@/lib/utils'
import { Eye, EyeOff, Lock } from 'lucide-react'

export interface PasswordFieldProps extends Omit<React.ComponentPropsWithRef<'input'>, 'onChange'> {
  label?: string
  hint?: string
  error?: string
  inline?: boolean
  disabled?: boolean
  onChange?: (e: { target: { name: string; value: string }; persist: () => void }) => void
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  (
    {
      label,
      hint,
      error,
      inline = false,
      disabled = false,
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
    const [showPassword, setShowPassword] = useState(false)

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
          <div
            className={cn(
              'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3',
              fieldIconMuted,
            )}
          >
            <Lock size={16} />
          </div>

          <input
            ref={ref}
            id={id}
            name={name}
            type={showPassword ? 'text' : 'password'}
            disabled={disabled}
            onChange={handleChange}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            className={cn(fieldInputBase, 'pl-10 pr-10', error && fieldInputError, className)}
            {...props}
          />

          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </FieldWrapper>
    )
  },
)

PasswordField.displayName = 'PasswordField'
