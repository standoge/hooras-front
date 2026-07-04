import { useId, useState, type ElementType } from 'react'
import { FieldWrapper } from '../field-wrapper'
import {
  fieldOptionDefault,
  fieldOptionSelected,
  fieldTriggerBase,
  fieldInputError,
  fieldInputBase,
} from '../field-styles'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ChevronDown, Check, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ComboboxOption {
  label: string
  value: string | number
  icon?: ElementType
  image?: string
  description?: string
  keywords?: string[]
}

export interface ComboboxFieldProps {
  label?: string
  hint?: string
  error?: string
  inline?: boolean
  disabled?: boolean
  options: ComboboxOption[]
  value?: string | number
  defaultValue?: string | number
  placeholder?: string
  searchPlaceholder?: string
  clearable?: boolean
  name?: string
  onChange?: (e: { target: { name: string; value: string | number }; persist: () => void }) => void
}

export function ComboboxField({
  label,
  hint,
  error,
  inline = false,
  disabled = false,
  options = [],
  value,
  defaultValue,
  placeholder = 'Search and select...',
  searchPlaceholder = 'Filter options...',
  clearable = true,
  name = '',
  onChange,
}: ComboboxFieldProps) {
  const generatedId = useId()
  const id = `${name || 'combobox'}-${generatedId}`

  const [internalVal, setInternalVal] = useState<string | number>(defaultValue ?? '')
  const currentVal = value !== undefined ? value : internalVal
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const selectedOption = options.find((opt) => String(opt.value) === String(currentVal))

  const handleSelect = (val: string | number) => {
    if (value === undefined) {
      setInternalVal(val)
    }
    onChange?.({
      target: { name, value: val },
      persist: () => {},
    })
    setSearchTerm('')
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleSelect('')
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
          value={currentVal}
          disabled={disabled}
          tabIndex={-1}
          className="sr-only"
          onChange={(e) => handleSelect(e.target.value)}
        >
          <option value="">{placeholder}</option>
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
              className={cn(fieldTriggerBase, error && fieldInputError)}
            >
              <div className="mr-2 flex min-w-0 flex-1 items-center gap-2 truncate">
                {selectedOption?.image ? (
                  <img
                    src={selectedOption.image}
                    alt={selectedOption.label}
                    className="h-5 w-5 rounded-full border border-border object-cover"
                  />
                ) : null}
                {selectedOption?.icon ? (
                  <selectedOption.icon size={16} className="text-muted-foreground" />
                ) : null}
                <span className={cn(selectedOption ? 'text-foreground' : 'text-muted-foreground')}>
                  {selectedOption ? selectedOption.label : placeholder}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {clearable && selectedOption ? (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={handleClear}
                    onKeyDown={(e) => e.key === 'Enter' && handleClear(e as unknown as React.MouseEvent)}
                    className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <X size={14} />
                  </span>
                ) : null}
                <ChevronDown size={16} className="text-muted-foreground" />
              </div>
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
                    const isSelected = String(opt.value) === String(currentVal)
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelect(opt.value)}
                        className={cn(
                          'flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-all',
                          isSelected ? fieldOptionSelected : fieldOptionDefault,
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
