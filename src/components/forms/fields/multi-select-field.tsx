import { useId, useState, type ElementType } from 'react'
import { FieldWrapper } from '../field-wrapper'
import {
  fieldOptionDefault,
  fieldOptionSelected,
  fieldTriggerMultiBase,
  fieldInputError,
  fieldInputBase,
} from '../field-styles'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ChevronDown, Check, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MultiSelectOption {
  label: string
  value: string | number
  icon?: ElementType
  image?: string
  description?: string
  keywords?: string[]
}

export interface MultiSelectFieldProps {
  label?: string
  hint?: string
  error?: string
  inline?: boolean
  disabled?: boolean
  options: MultiSelectOption[]
  value?: (string | number)[]
  defaultValue?: (string | number)[]
  placeholder?: string
  searchPlaceholder?: string
  maxSelections?: number
  name?: string
  onChange?: (e: { target: { name: string; value: (string | number)[] }; persist: () => void }) => void
}

export function MultiSelectField({
  label,
  hint,
  error,
  inline = false,
  disabled = false,
  options = [],
  value,
  defaultValue = [],
  placeholder = 'Select multiple...',
  searchPlaceholder = 'Filter options...',
  maxSelections,
  name = '',
  onChange,
}: MultiSelectFieldProps) {
  const generatedId = useId()
  const id = `${name || 'multiselect'}-${generatedId}`

  const [internalVal, setInternalVal] = useState<(string | number)[]>(defaultValue)
  const currentVal = value !== undefined ? value : internalVal
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const handleSelectOption = (optVal: string | number) => {
    let newVal: (string | number)[]

    if (currentVal.includes(optVal)) {
      newVal = currentVal.filter((v) => v !== optVal)
    } else {
      if (maxSelections !== undefined && currentVal.length >= maxSelections) {
        return
      }
      newVal = [...currentVal, optVal]
    }

    if (value === undefined) {
      setInternalVal(newVal)
    }
    onChange?.({
      target: { name, value: newVal },
      persist: () => {},
    })
  }

  const handleRemoveChip = (e: React.MouseEvent, optVal: string | number) => {
    e.stopPropagation()
    handleSelectOption(optVal)
  }

  const filteredOptions = options.filter((opt) => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) return true

    const matchLabel = opt.label.toLowerCase().includes(term)
    const matchDesc = opt.description?.toLowerCase().includes(term) || false
    const matchVal = String(opt.value).toLowerCase().includes(term)
    const matchKeywords = opt.keywords?.some((k) => k.toLowerCase().includes(term)) || false

    return matchLabel || matchDesc || matchVal || matchKeywords
  })

  const selectedOptions = options.filter((opt) => currentVal.includes(opt.value))
  const atLimit = maxSelections !== undefined && currentVal.length >= maxSelections

  return (
    <FieldWrapper
      id={id}
      label={label}
      hint={hint}
      error={error}
      inline={inline}
      disabled={disabled}
    >
      <div className="relative w-full">
        <select
          id={id}
          name={name}
          multiple
          value={currentVal.map(String)}
          disabled={disabled}
          tabIndex={-1}
          className="sr-only"
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map((o) => o.value)
            if (value === undefined) {
              setInternalVal(selected)
            }
            onChange?.({
              target: { name, value: selected },
              persist: () => {},
            })
          }}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild disabled={disabled}>
            <button
              type="button"
              className={cn(fieldTriggerMultiBase, error && fieldInputError)}
            >
              <div className="mr-2 flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                {selectedOptions.length === 0 ? (
                  <span className="pl-1 text-muted-foreground">{placeholder}</span>
                ) : (
                  selectedOptions.map((opt) => (
                    <span
                      key={opt.value}
                      className="inline-flex items-center gap-1 rounded border border-border bg-accent px-2 py-0.5 text-xs text-foreground transition-all hover:border-border"
                    >
                      {opt.image ? (
                        <img
                          src={opt.image}
                          alt={opt.label}
                          className="mr-0.5 h-3.5 w-3.5 rounded-full object-cover"
                        />
                      ) : null}
                      {opt.icon ? <opt.icon size={10} className="text-muted-foreground" /> : null}
                      <span className="max-w-[120px] truncate">{opt.label}</span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => handleRemoveChip(e, opt.value)}
                        className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
                      >
                        <X size={10} />
                      </span>
                    </span>
                  ))
                )}
              </div>
              <ChevronDown size={16} className="flex-shrink-0 self-center text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-[var(--radix-popover-trigger-width)] p-3"
          >
            <div className="flex max-h-[300px] flex-col gap-2 overflow-hidden">
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-2.5 text-muted-foreground" />
                <input
                  type="text"
                  autoFocus
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn(fieldInputBase, 'py-1.5 pl-8 text-xs')}
                />
              </div>

              <div className="scrollbar-thin flex flex-1 flex-col gap-0.5 overflow-y-auto">
                {filteredOptions.length === 0 ? (
                  <div className="p-2 text-center text-xs text-muted-foreground">
                    No options match search
                  </div>
                ) : (
                  filteredOptions.map((opt) => {
                    const isSelected = currentVal.includes(opt.value)
                    const isOptionDisabled = !isSelected && atLimit

                    return (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={isOptionDisabled}
                        onClick={() => handleSelectOption(opt.value)}
                        className={cn(
                          'flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-all',
                          isSelected ? fieldOptionSelected : fieldOptionDefault,
                          isOptionDisabled && 'cursor-not-allowed opacity-40 hover:bg-transparent',
                        )}
                      >
                        {opt.image ? (
                          <img
                            src={opt.image}
                            alt={opt.label}
                            className="mt-0.5 h-5 w-5 rounded-full border border-border object-cover"
                          />
                        ) : null}
                        {opt.icon ? (
                          <opt.icon size={16} className="mt-0.5 text-muted-foreground" />
                        ) : null}
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate">{opt.label}</span>
                          {opt.description ? (
                            <span className="mt-0.5 truncate text-[10px] text-muted-foreground">
                              {opt.description}
                            </span>
                          ) : null}
                        </div>
                        {isSelected ? (
                          <Check size={14} className="self-center text-primary" />
                        ) : null}
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </FieldWrapper>
  )
}
