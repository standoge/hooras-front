import { useId, useMemo, useState } from 'react'
import { FieldWrapper } from '../field-wrapper'
import { fieldTriggerBase, fieldInputError } from '../field-styles'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { parseTimeValue } from '../utils/parse-time-value'
import { TimePickerColumns } from '../utils/time-picker-columns'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TimeFieldProps {
  label?: string
  hint?: string
  error?: string
  inline?: boolean
  disabled?: boolean
  use24Hour?: boolean
  showSeconds?: boolean
  minuteStep?: number
  value?: string
  defaultValue?: string
  name?: string
  onChange?: (e: { target: { name: string; value: string }; persist: () => void }) => void
}

export function TimeField({
  label,
  hint,
  error,
  inline = false,
  disabled = false,
  use24Hour = true,
  showSeconds = false,
  minuteStep = 1,
  value,
  defaultValue = '',
  name = '',
  onChange,
}: TimeFieldProps) {
  const generatedId = useId()
  const id = `${name || 'time'}-${generatedId}`
  const [open, setOpen] = useState(false)

  const defaultTime = useMemo(
    () => parseTimeValue(defaultValue) || { hours: 0, minutes: 0, seconds: 0 },
    [defaultValue],
  )
  const [internalTime, setInternalTime] = useState(defaultTime)

  const currentTime = useMemo(() => {
    if (value !== undefined) {
      return parseTimeValue(value) || { hours: 0, minutes: 0, seconds: 0 }
    }
    return internalTime
  }, [value, internalTime])

  const triggerChange = (hours: number, minutes: number, seconds: number) => {
    const formattedHours = String(hours).padStart(2, '0')
    const formattedMinutes = String(minutes).padStart(2, '0')
    const formattedSeconds = String(seconds).padStart(2, '0')

    const timeString = showSeconds
      ? `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
      : `${formattedHours}:${formattedMinutes}`

    if (value === undefined) {
      setInternalTime({ hours, minutes, seconds })
    }

    onChange?.({
      target: { name, value: timeString },
      persist: () => {},
    })
  }

  const displayTime = () => {
    const { hours, minutes, seconds } = currentTime
    if (use24Hour) {
      const hStr = String(hours).padStart(2, '0')
      const mStr = String(minutes).padStart(2, '0')
      const sStr = String(seconds).padStart(2, '0')
      return showSeconds ? `${hStr}:${mStr}:${sStr}` : `${hStr}:${mStr}`
    }

    const isPm = hours >= 12
    const h12 = hours % 12 === 0 ? 12 : hours % 12
    const hStr = String(h12).padStart(2, '0')
    const mStr = String(minutes).padStart(2, '0')
    const sStr = String(seconds).padStart(2, '0')
    const ampm = isPm ? 'PM' : 'AM'
    return showSeconds ? `${hStr}:${mStr}:${sStr} ${ampm}` : `${hStr}:${mStr} ${ampm}`
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
        <input type="hidden" name={name} value={displayTime()} />

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild disabled={disabled}>
            <button type="button" className={cn(fieldTriggerBase, error && fieldInputError)}>
              <span className="font-mono text-foreground">{displayTime()}</span>
              <Clock size={16} className="text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-3">
            <TimePickerColumns
              value={currentTime}
              use24Hour={use24Hour}
              showSeconds={showSeconds}
              minuteStep={minuteStep}
              onHoursChange={(hours) =>
                triggerChange(hours, currentTime.minutes, currentTime.seconds)
              }
              onMinutesChange={(minutes) =>
                triggerChange(currentTime.hours, minutes, currentTime.seconds)
              }
              onSecondsChange={(seconds) =>
                triggerChange(currentTime.hours, currentTime.minutes, seconds)
              }
            />
          </PopoverContent>
        </Popover>
      </div>
    </FieldWrapper>
  )
}
