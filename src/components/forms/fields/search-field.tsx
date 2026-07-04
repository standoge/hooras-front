import { forwardRef, useId, useImperativeHandle, useRef } from 'react'
import { TextField, type TextFieldProps } from './text-field'
import { Loader2, Search, X } from 'lucide-react'

export interface SearchFieldProps extends Omit<TextFieldProps, 'type'> {
  loading?: boolean
  clearable?: boolean
  onClear?: () => void
}

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  (
    {
      loading = false,
      clearable = true,
      onClear,
      icon: customIcon,
      onChange,
      value,
      name,
      id: customId,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId()
    const id = customId || generatedId

    const inputRef = useRef<HTMLInputElement>(null)
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

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

    const IconToRender = loading
      ? () => <Loader2 size={16} className="animate-spin text-primary" />
      : customIcon || Search

    const hasValue = value !== undefined && value !== null && String(value).length > 0

    return (
      <div className="relative w-full">
        <TextField
          ref={inputRef}
          id={id}
          name={name}
          value={value}
          type="search"
          icon={IconToRender}
          iconPosition="left"
          onChange={onChange}
          className="pr-10"
          {...props}
        />

        {clearable && hasValue && !loading ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Clear search"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>
    )
  },
)

SearchField.displayName = 'SearchField'
