import { useEffect, useId, useMemo, useState } from 'react'
import { Calendar as CalendarIcon, Clock } from 'lucide-react'
import { FieldWrapper } from '../field-wrapper'
import { fieldTriggerBase, fieldInputError } from '../field-styles'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarGrid } from '../utils/calendar-grid'
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

  const hoursList = Array.from({ length: use24Hour ? 24 : 12 }, (_, i) => (use24Hour ? i : i + 1))
  const minutesList = Array.from({ length: 60 }, (_, i) => i)
  const secondsList = Array.from({ length: 60 }, (_, i) => i)

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
          <PopoverContent align="start" className="w-auto p-2">
            <div className="flex max-w-[300px] flex-col gap-3">
              <CalendarGrid
                value={selectedDate}
                onChange={(date) => triggerChange(date, selectedTime)}
                min={minDate}
                max={maxDate}
              />

              <div className="flex h-32 select-none justify-center gap-1.5 rounded-lg border border-border bg-muted p-2 text-foreground">
                <div className="flex w-12 flex-col overflow-y-auto border-r border-border pr-1 text-center">
                  <span className="mb-1 text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
                    Hrs
                  </span>
                  {hoursList.map((h) => {
                    let active = false
                    if (use24Hour) {
                      active = selectedTime.hours === h
                    } else {
                      const curH12 =
                        selectedTime.hours % 12 === 0 ? 12 : selectedTime.hours % 12
                      active = curH12 === h
                    }

                    const handleHourClick = () => {
                      let nextH = h
                      if (!use24Hour) {
                        const isPm = selectedTime.hours >= 12
                        if (isPm && h < 12) nextH = h + 12
                        else if (!isPm && h === 12) nextH = 0
                      }
                      triggerChange(selectedDate, { ...selectedTime, hours: nextH })
                    }

                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={handleHourClick}
                        className={cn(
                          'rounded py-0.5 font-mono text-[10px] transition-colors hover:bg-accent',
                          active && 'bg-primary/20 font-bold text-primary',
                        )}
                      >
                        {String(h).padStart(2, '0')}
                      </button>
                    )
                  })}
                </div>

                <div className="flex w-12 flex-col overflow-y-auto border-r border-border px-1 text-center">
                  <span className="mb-1 text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
                    Min
                  </span>
                  {minutesList.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => triggerChange(selectedDate, { ...selectedTime, minutes: m })}
                      className={cn(
                        'rounded py-0.5 font-mono text-[10px] transition-colors hover:bg-accent',
                        selectedTime.minutes === m && 'bg-primary/20 font-bold text-primary',
                      )}
                    >
                      {String(m).padStart(2, '0')}
                    </button>
                  ))}
                </div>

                {showSeconds ? (
                  <div className="flex w-12 flex-col overflow-y-auto border-r border-border px-1 text-center">
                    <span className="mb-1 text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
                      Sec
                    </span>
                    {secondsList.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => triggerChange(selectedDate, { ...selectedTime, seconds: s })}
                        className={cn(
                          'rounded py-0.5 font-mono text-[10px] transition-colors hover:bg-accent',
                          selectedTime.seconds === s && 'bg-primary/20 font-bold text-primary',
                        )}
                      >
                        {String(s).padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                ) : null}

                {!use24Hour ? (
                  <div className="flex w-12 flex-col justify-center gap-1 pl-1 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedTime.hours >= 12) {
                          triggerChange(selectedDate, {
                            ...selectedTime,
                            hours: selectedTime.hours - 12,
                          })
                        }
                      }}
                      className={cn(
                        'rounded py-1 font-mono text-[8px] font-bold transition-colors hover:bg-accent',
                        selectedTime.hours < 12 && 'bg-primary/20 text-primary',
                      )}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedTime.hours < 12) {
                          triggerChange(selectedDate, {
                            ...selectedTime,
                            hours: selectedTime.hours + 12,
                          })
                        }
                      }}
                      className={cn(
                        'rounded py-1 font-mono text-[8px] font-bold transition-colors hover:bg-accent',
                        selectedTime.hours >= 12 && 'bg-primary/20 text-primary',
                      )}
                    >
                      PM
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </FieldWrapper>
  )
}
