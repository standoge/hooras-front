import { useEffect, useId, useMemo, useState } from 'react'
import { Calendar as CalendarIcon, Clock } from 'lucide-react'
import { FieldWrapper } from '../field-wrapper'
import { fieldTriggerBase, fieldInputError } from '../field-styles'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarGrid } from '../utils/calendar-grid'
import { TimePickerColumns } from '../utils/time-picker-columns'
import { parseDateValue } from '../utils/parse-date-value'
import { toDateString, type CalendarDateValue } from '../utils/calendar-date'
import { cn } from '@/lib/utils'

export interface DatetimeFieldProps {
  label?: string
  hint?: string
  error?: string
  inline?: boolean
  disabled?: boolean
  use24Hour?: boolean
  showSeconds?: boolean
  min?: string | CalendarDateValue
  max?: string | CalendarDateValue
  value?: string
  defaultValue?: string
  name?: string
  onChange?: (e: { target: { name: string; value: string }; persist: () => void }) => void
}

export function DatetimeField({
  label,
  hint,
  error,
  inline = false,
  disabled = false,
  use24Hour = true,
  showSeconds = false,
  min,
  max,
  value,
  defaultValue = '',
  name = '',
  onChange,
}: DatetimeFieldProps) {
  const generatedId = useId()
  const id = `${name || 'datetime'}-${generatedId}`
  const [open, setOpen] = useState(false)

  const minDate = useMemo(() => parseDateValue(min), [min])
  const maxDate = useMemo(() => parseDateValue(max), [max])

  const extractDateTime = (valStr: string) => {
    const dt = valStr ? new Date(valStr) : new Date()
    const valid = valStr ? !Number.isNaN(dt.getTime()) : false

    const dateVal = valid
      ? { year: dt.getFullYear(), month: dt.getMonth() + 1, day: dt.getDate() }
      : null

    const timeVal = valid
      ? { hours: dt.getHours(), minutes: dt.getMinutes(), seconds: dt.getSeconds() }
      : { hours: 0, minutes: 0, seconds: 0 }

    return { date: dateVal, time: timeVal }
  }

  const initialVal = useMemo(() => extractDateTime(defaultValue), [defaultValue])

  const [selectedDate, setSelectedDate] = useState<CalendarDateValue | null>(initialVal.date)
  const [selectedTime, setSelectedTime] = useState(initialVal.time)

  useEffect(() => {
    if (value !== undefined) {
      const parsed = extractDateTime(value)
      setSelectedDate(parsed.date)
      setSelectedTime(parsed.time)
    }
  }, [value])

  const triggerChange = (
    date: CalendarDateValue | null,
    time: { hours: number; minutes: number; seconds: number },
  ) => {
    if (!date) return

    const pad = (n: number) => String(n).padStart(2, '0')
    const dateStr = toDateString(date)
    const timeStr = showSeconds
      ? `${pad(time.hours)}:${pad(time.minutes)}:${pad(time.seconds)}`
      : `${pad(time.hours)}:${pad(time.minutes)}`

    const isoStr = `${dateStr}T${timeStr}`

    if (value === undefined) {
      setSelectedDate(date)
      setSelectedTime(time)
    }

    onChange?.({
      target: { name, value: isoStr },
      persist: () => {},
    })
  }

  const displayString = () => {
    if (!selectedDate) return 'Select date and time...'

    const pad = (n: number) => String(n).padStart(2, '0')
    const datePart = `${pad(selectedDate.day)}/${pad(selectedDate.month)}/${selectedDate.year}`

    const { hours, minutes, seconds } = selectedTime

    if (use24Hour) {
      const timePart = showSeconds
        ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
        : `${pad(hours)}:${pad(minutes)}`
      return `${datePart} ${timePart}`
    }

    const isPm = hours >= 12
    const h12 = hours % 12 === 0 ? 12 : hours % 12
    const timePart = showSeconds
      ? `${pad(h12)}:${pad(minutes)}:${pad(seconds)} ${isPm ? 'PM' : 'AM'}`
      : `${pad(h12)}:${pad(minutes)} ${isPm ? 'PM' : 'AM'}`

    return `${datePart} ${timePart}`
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
      <div className="relative w-full">
        <input
          type="hidden"
          name={name}
          value={
            selectedDate
              ? `${toDateString(selectedDate)}T${String(selectedTime.hours).padStart(2, '0')}:${String(selectedTime.minutes).padStart(2, '0')}`
              : ''
          }
        />

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild disabled={disabled}>
            <button type="button" className={cn(fieldTriggerBase, error && fieldInputError)}>
              <span
                className={cn(
                  selectedDate ? 'font-mono text-xs text-foreground' : 'text-muted-foreground',
                )}
              >
                {displayString()}
              </span>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <CalendarIcon size={14} />
                <span className="text-border">|</span>
                <Clock size={14} />
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-3">
            <div className="flex flex-col gap-3">
              <CalendarGrid
                embedded
                value={selectedDate}
                onChange={(date) => triggerChange(date, selectedTime)}
                min={minDate}
                max={maxDate}
              />

              <div className="border-t border-border pt-3">
                <TimePickerColumns
                  value={selectedTime}
                  use24Hour={use24Hour}
                  showSeconds={showSeconds}
                  onHoursChange={(hours) =>
                    selectedDate &&
                    triggerChange(selectedDate, { ...selectedTime, hours })
                  }
                  onMinutesChange={(minutes) =>
                    selectedDate &&
                    triggerChange(selectedDate, { ...selectedTime, minutes })
                  }
                  onSecondsChange={(seconds) =>
                    selectedDate &&
                    triggerChange(selectedDate, { ...selectedTime, seconds })
                  }
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </FieldWrapper>
  )
}
