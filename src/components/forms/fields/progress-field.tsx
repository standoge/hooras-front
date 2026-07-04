import { useId, useState } from 'react'
import { FieldWrapper } from '../field-wrapper'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export interface ProgressFieldProps {
  label?: string
  hint?: string
  error?: string
  inline?: boolean
  disabled?: boolean
  value?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  variant?: 'default' | 'gradient' | 'striped'
  color?: 'primary' | 'green' | 'amber' | 'red'
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  interactive?: boolean
  name?: string
  onChange?: (e: { target: { name: string; value: number }; persist: () => void }) => void
}

export function ProgressField({
  label,
  hint,
  error,
  inline = false,
  disabled = false,
  value,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  variant = 'default',
  color = 'primary',
  size = 'md',
  showValue = true,
  interactive = false,
  name = '',
  onChange,
}: ProgressFieldProps) {
  const generatedId = useId()
  const id = `${name || 'progress'}-${generatedId}`

  const [internalVal, setInternalVal] = useState<number>(defaultValue)
  const currentVal = value !== undefined ? value : internalVal

  const percent = Math.min(Math.max(((currentVal - min) / (max - min)) * 100, 0), 100)

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    if (value === undefined) {
      setInternalVal(val)
    }
    onChange?.({
      target: { name, value: val },
      persist: () => {},
    })
  }

  const colorClasses = {
    primary: {
      indicator: 'bg-primary',
      text: 'text-primary',
    },
    green: {
      indicator: 'bg-emerald-500',
      text: 'text-emerald-500',
    },
    amber: {
      indicator: 'bg-amber-500',
      text: 'text-amber-500',
    },
    red: {
      indicator: 'bg-destructive',
      text: 'text-destructive',
    },
  }

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-3',
    lg: 'h-5',
  }

  const indicatorClass = cn(
    color === 'primary' && '[&>div]:bg-primary',
    color === 'green' && '[&>div]:bg-emerald-500',
    color === 'amber' && '[&>div]:bg-amber-500',
    color === 'red' && '[&>div]:bg-destructive',
    variant === 'striped' &&
      '[&>div]:[background-image:linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] [&>div]:bg-[size:1rem_1rem]',
  )

  return (
    <FieldWrapper
      id={id}
      label={label}
      hint={hint}
      error={error}
      inline={inline}
      disabled={disabled}
    >
      <div className="flex w-full flex-col gap-1">
        {showValue && !inline ? (
          <div className="flex justify-end font-mono text-[10px] font-bold tracking-wider text-muted-foreground">
            <span className={colorClasses[color].text}>{currentVal}</span> / {max}
          </div>
        ) : null}

        <div className="relative flex w-full items-center">
          <Progress
            value={percent}
            className={cn(
              heightClasses[size],
              'bg-muted [&>div]:transition-all [&>div]:duration-300',
              indicatorClass,
              disabled && 'opacity-50',
            )}
          />

          {interactive ? (
            <input
              id={id}
              type="range"
              min={min}
              max={max}
              step={step}
              value={currentVal}
              disabled={disabled}
              onChange={handleSliderChange}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            />
          ) : null}

          {showValue && inline ? (
            <div className="ml-3 flex-shrink-0 font-mono text-xs font-bold tracking-wider text-muted-foreground">
              <span className={colorClasses[color].text}>{currentVal}</span>
            </div>
          ) : null}
        </div>
      </div>
    </FieldWrapper>
  )
}
