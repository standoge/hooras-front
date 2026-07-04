import { useId, useMemo, useState } from 'react'
import { FieldWrapper } from '../field-wrapper'
import { fieldTriggerBase, fieldInputError } from '../field-styles'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { parseTimeValue } from '../utils/parse-time-value'
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

  const hoursList = Array.from({ length: use24Hour ? 24 : 12 }, (_, i) => (use24Hour ? i : i + 1))

  const minutesList: number[] = []
  for (let i = 0; i < 60; i += minuteStep) {
    minutesList.push(i)
  }

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
        <input type="hidden" name={name} value={displayTime()} />

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild disabled={disabled}>
            <button type="button" className={cn(fieldTriggerBase, error && fieldInputError)}>
              <span className="font-mono text-foreground">{displayTime()}</span>
              <Clock size={16} className="text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-2">
            <div className="flex h-44 select-none gap-1 rounded-lg bg-muted p-2 text-foreground">
              <div className="flex w-12 flex-col overflow-y-auto border-r border-border pr-1">
                <span className="mb-1 text-center text-[9px] font-bold uppercase text-muted-foreground">
                  Hrs
                </span>
                {hoursList.map((h) => {
                  let active = false
                  if (use24Hour) {
                    active = currentTime.hours === h
                  } else {
                    const curH12 = currentTime.hours % 12 === 0 ? 12 : currentTime.hours % 12
                    active = curH12 === h
                  }

                  const handleHourSelect = () => {
                    let nextH = h
                    if (!use24Hour) {
                      const isPm = currentTime.hours >= 12
                      if (isPm && h < 12) nextH = h + 12
                      else if (!isPm && h === 12) nextH = 0
                    }
                    triggerChange(nextH, currentTime.minutes, currentTime.seconds)
                  }

                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={handleHourSelect}
                      className={cn(
                        'rounded py-1 font-mono text-xs transition-colors hover:bg-accent',
                        active && 'bg-primary/20 font-bold text-primary',
                      )}
                    >
                      {String(h).padStart(2, '0')}
                    </button>
                  )
                })}
              </div>

              <div className="flex w-12 flex-col overflow-y-auto border-r border-border px-1">
                <span className="mb-1 text-center text-[9px] font-bold uppercase text-muted-foreground">
                  Min
                </span>
                {minutesList.map((m) => {
                  const active = currentTime.minutes === m
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => triggerChange(currentTime.hours, m, currentTime.seconds)}
                      className={cn(
                        'rounded py-1 font-mono text-xs transition-colors hover:bg-accent',
                        active && 'bg-primary/20 font-bold text-primary',
                      )}
                    >
                      {String(m).padStart(2, '0')}
                    </button>
                  )
                })}
              </div>

              {showSeconds ? (
                <div className="flex w-12 flex-col overflow-y-auto border-r border-border px-1">
                  <span className="mb-1 text-center text-[9px] font-bold uppercase text-muted-foreground">
                    Sec
                  </span>
                  {secondsList.map((s) => {
                    const active = currentTime.seconds === s
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() =>
                          triggerChange(currentTime.hours, currentTime.minutes, s)
                        }
                        className={cn(
                          'rounded py-1 font-mono text-xs transition-colors hover:bg-accent',
                          active && 'bg-primary/20 font-bold text-primary',
                        )}
                      >
                        {String(s).padStart(2, '0')}
                      </button>
                    )
                  })}
                </div>
              ) : null}

              {!use24Hour ? (
                <div className="flex w-12 flex-col justify-center gap-2 pl-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (currentTime.hours >= 12) {
                        triggerChange(
                          currentTime.hours - 12,
                          currentTime.minutes,
                          currentTime.seconds,
                        )
                      }
                    }}
                    className={cn(
                      'rounded py-1 font-mono text-[10px] font-bold transition-colors hover:bg-accent',
                      currentTime.hours < 12 && 'bg-primary/20 text-primary',
                    )}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (currentTime.hours < 12) {
                        triggerChange(
                          currentTime.hours + 12,
                          currentTime.minutes,
                          currentTime.seconds,
                        )
                      }
                    }}
                    className={cn(
                      'rounded py-1 font-mono text-[10px] font-bold transition-colors hover:bg-accent',
                      currentTime.hours >= 12 && 'bg-primary/20 text-primary',
                    )}
                  >
                    PM
                  </button>
                </div>
              ) : null}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </FieldWrapper>
  )
}
