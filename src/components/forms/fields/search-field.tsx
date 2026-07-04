import { forwardRef, useId, useImperativeHandle, useRef } from 'react'
import { FieldWrapper } from '../field-wrapper'
import { fieldIconMuted, fieldInputBase, fieldInputError } from '../field-styles'
import { Loader2, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TextFieldProps } from './text-field'

export interface SearchFieldProps extends Omit<TextFieldProps, 'type'> {
  loading?: boolean
  clearable?: boolean
  onClear?: () => void
}

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  (
    {
      label,
      hint,
      error,
      inline = false,
      loading = false,
      clearable = true,
      onClear,
      icon: customIcon,
      disabled = false,
      className,
      onChange,
      value,
      name = '',
      id: customId,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId()
    const id = customId || generatedId

    const inputRef = useRef<HTMLInputElement>(null)
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.({
        target: {
          name: e.target.name || name,
          value: e.target.value,
        },
        persist: () => {},
      })
    }

    const handleClear = () => {
      if (inputRef.current) {
        inputRef.current.value = ''
        onChange?.({
          target: { name: name || '', value: '' },
          persist: () => {},
        })
        onClear?.()
        setTimeout(() => inputRef.current?.focus(), 0)
      }
    }

    const hasValue = value !== undefined && value !== null && String(value).length > 0
    const showClear = clearable && hasValue && !loading
    const LeftIcon = customIcon ?? Search

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
            {loading ? (
              <Loader2 size={16} className="animate-spin text-primary" />
            ) : (
              <LeftIcon size={16} />
            )}
          </div>

          <input
            ref={inputRef}
            id={id}
            name={name}
            type="search"
            value={value}
            disabled={disabled}
            onChange={handleChange}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            className={cn(
              fieldInputBase,
              'pl-10',
              showClear && 'pr-10',
              error && fieldInputError,
              className,
            )}
            {...props}
          />

          {showClear ? (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition-colors hover:text-foreground"
              title="Clear search"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>
      </FieldWrapper>
    )
  },
)

SearchField.displayName = 'SearchField'
