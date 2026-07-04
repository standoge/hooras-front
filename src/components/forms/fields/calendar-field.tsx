import { useId, useMemo, useState } from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { FieldWrapper } from '../field-wrapper'
import { fieldTriggerBase, fieldInputError } from '../field-styles'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarGrid } from '../utils/calendar-grid'
import { parseDateValue } from '../utils/parse-date-value'
import { toDateString, type CalendarDateValue } from '../utils/calendar-date'
import { cn } from '@/lib/utils'

export interface CalendarFieldProps {
  label?: string
  hint?: string
  error?: string
  inline?: boolean
  disabled?: boolean
  value?: string | CalendarDateValue
  defaultValue?: string | CalendarDateValue
  min?: string | CalendarDateValue
  max?: string | CalendarDateValue
  name?: string
  onChange?: (e: { target: { name: string; value: string }; persist: () => void }) => void
}

export function CalendarField({
  label,
  hint,
  error,
  inline = false,
  disabled = false,
  value,
  defaultValue,
  min,
  max,
  name = '',
  onChange,
}: CalendarFieldProps) {
  const generatedId = useId()
  const id = `${name || 'calendar'}-${generatedId}`
  const [open, setOpen] = useState(false)

  const minDate = useMemo(() => parseDateValue(min), [min])
  const maxDate = useMemo(() => parseDateValue(max), [max])
  const initialDate = useMemo(() => parseDateValue(defaultValue), [defaultValue])
  const [internalDate, setInternalDate] = useState<CalendarDateValue | null>(initialDate)

  const currentDate = useMemo(() => {
    if (value !== undefined) {
      return parseDateValue(value)
    }
    return internalDate
  }, [value, internalDate])

  const handleSelectDate = (date: CalendarDateValue) => {
    const isoString = toDateString(date)

    if (value === undefined) {
      setInternalDate(date)
    }

    onChange?.({
      target: { name, value: isoString },
      persist: () => {},
    })
    setOpen(false)
  }

  const triggerLabel = currentDate
    ? `${String(currentDate.day).padStart(2, '0')}/${String(currentDate.month).padStart(2, '0')}/${currentDate.year}`
    : 'Select date...'

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
        <input
          id={id}
          type="hidden"
          name={name}
          value={currentDate ? toDateString(currentDate) : ''}
          disabled={disabled}
        />

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild disabled={disabled}>
            <button type="button" className={cn(fieldTriggerBase, error && fieldInputError)}>
              <span className={cn(currentDate ? 'text-foreground' : 'text-muted-foreground')}>
                {triggerLabel}
              </span>
              <CalendarIcon size={16} className="text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-2">
            <CalendarGrid
              value={currentDate}
              onChange={handleSelectDate}
              min={minDate}
              max={maxDate}
            />
          </PopoverContent>
        </Popover>
      </div>
    </FieldWrapper>
  )
}
