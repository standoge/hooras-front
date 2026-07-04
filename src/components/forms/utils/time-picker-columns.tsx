import { type ReactNode } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export interface TimeValue {
  hours: number
  minutes: number
  seconds: number
}

export interface TimePickerColumnsProps {
  value: TimeValue
  onHoursChange: (hours: number) => void
  onMinutesChange: (minutes: number) => void
  onSecondsChange?: (seconds: number) => void
  use24Hour?: boolean
  showSeconds?: boolean
  minuteStep?: number
  className?: string
  heightClass?: string
}

function TimeColumn({
  label,
  children,
  className,
  heightClass = 'h-44',
}: {
  label: string
  children: ReactNode
  className?: string
  heightClass?: string
}) {
  return (
    <div className={cn('flex w-14 flex-col border-r border-border last:border-r-0', className)}>
      <span className="mb-1 shrink-0 text-center text-[10px] font-bold uppercase text-muted-foreground">
        {label}
      </span>
      <ScrollArea className={cn(heightClass, 'w-full')}>
        <div className="flex flex-col px-1">{children}</div>
      </ScrollArea>
    </div>
  )
}

export function TimePickerColumns({
  value,
  onHoursChange,
  onMinutesChange,
  onSecondsChange,
  use24Hour = true,
  showSeconds = false,
  minuteStep = 1,
  className,
  heightClass = 'h-44',
}: TimePickerColumnsProps) {
  const hoursList = Array.from({ length: use24Hour ? 24 : 12 }, (_, i) => (use24Hour ? i : i + 1))

  const minutesList: number[] = []
  for (let i = 0; i < 60; i += minuteStep) {
    minutesList.push(i)
  }

  const secondsList = Array.from({ length: 60 }, (_, i) => i)

  const handleHourSelect = (h: number) => {
    let nextH = h
    if (!use24Hour) {
      const isPm = value.hours >= 12
      if (isPm && h < 12) nextH = h + 12
      else if (!isPm && h === 12) nextH = 0
    }
    onHoursChange(nextH)
  }

  return (
    <div
      className={cn(
        'flex select-none justify-center gap-1 text-foreground',
        className,
      )}
    >
      <TimeColumn label="Hrs" heightClass={heightClass}>
        {hoursList.map((h) => {
          let active = false
          if (use24Hour) {
            active = value.hours === h
          } else {
            const curH12 = value.hours % 12 === 0 ? 12 : value.hours % 12
            active = curH12 === h
          }

          return (
            <button
              key={h}
              type="button"
              onClick={() => handleHourSelect(h)}
              className={cn(
                'rounded py-1 font-mono text-xs transition-colors hover:bg-accent',
                active && 'bg-primary/20 font-bold text-primary',
              )}
            >
              {String(h).padStart(2, '0')}
            </button>
          )
        })}
      </TimeColumn>

      <TimeColumn label="Min" heightClass={heightClass}>
        {minutesList.map((m) => {
          const active = value.minutes === m
          return (
            <button
              key={m}
              type="button"
              onClick={() => onMinutesChange(m)}
              className={cn(
                'rounded py-1 font-mono text-xs transition-colors hover:bg-accent',
                active && 'bg-primary/20 font-bold text-primary',
              )}
            >
              {String(m).padStart(2, '0')}
            </button>
          )
        })}
      </TimeColumn>

      {showSeconds && onSecondsChange ? (
        <TimeColumn label="Sec" heightClass={heightClass}>
          {secondsList.map((s) => {
            const active = value.seconds === s
            return (
              <button
                key={s}
                type="button"
                onClick={() => onSecondsChange(s)}
                className={cn(
                  'rounded py-1 font-mono text-xs transition-colors hover:bg-accent',
                  active && 'bg-primary/20 font-bold text-primary',
                )}
              >
                {String(s).padStart(2, '0')}
              </button>
            )
          })}
        </TimeColumn>
      ) : null}

      {!use24Hour ? (
        <div className="flex w-14 flex-col justify-center gap-2 pl-1">
          <button
            type="button"
            onClick={() => {
              if (value.hours >= 12) {
                onHoursChange(value.hours - 12)
              }
            }}
            className={cn(
              'rounded py-1 font-mono text-[10px] font-bold transition-colors hover:bg-accent',
              value.hours < 12 && 'bg-primary/20 text-primary',
            )}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => {
              if (value.hours < 12) {
                onHoursChange(value.hours + 12)
              }
            }}
            className={cn(
              'rounded py-1 font-mono text-[10px] font-bold transition-colors hover:bg-accent',
              value.hours >= 12 && 'bg-primary/20 text-primary',
            )}
          >
            PM
          </button>
        </div>
      ) : null}
    </div>
  )
}
