import { useEffect, useId, useRef, useState } from 'react'
import { FieldWrapper } from '../field-wrapper'
import { fieldInputBase, fieldInputError } from '../field-styles'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface NumberFieldProps {
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
  name?: string
  onChange?: (e: { target: { name: string; value: number }; persist: () => void }) => void
}

export function NumberField({
  label,
  hint,
  error,
  inline = false,
  disabled = false,
  value,
  defaultValue = 0,
  min,
  max,
  step = 1,
  name = '',
  onChange,
}: NumberFieldProps) {
  const generatedId = useId()
  const id = `${name || 'number'}-${generatedId}`

  const [internalVal, setInternalVal] = useState<number>(defaultValue)
  const currentVal = value !== undefined ? value : internalVal

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const handleUpdate = (direction: 'increment' | 'decrement') => {
    let nextVal = direction === 'increment' ? currentVal + step : currentVal - step

    if (min !== undefined && nextVal < min) {
      nextVal = min
    }
    if (max !== undefined && nextVal > max) {
      nextVal = max
    }

    const decimalPlaces = (step.toString().split('.')[1] || '').length
    nextVal = Number.parseFloat(nextVal.toFixed(decimalPlaces))

    if (value === undefined) {
      setInternalVal(nextVal)
    }

    onChange?.({
      target: { name, value: nextVal },
      persist: () => {},
    })
  }

  const startContinuousChange = (direction: 'increment' | 'decrement') => {
    if (disabled) return
    handleUpdate(direction)

    timerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        handleUpdate(direction)
      }, 80)
    }, 400)
  }

  const stopContinuousChange = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  useEffect(() => {
    return () => {
      stopContinuousChange()
    }
  }, [])

  const stepperButtonClass = cn(
    'flex h-10 items-center justify-center bg-muted px-3 text-muted-foreground transition-colors select-none hover:bg-accent hover:text-primary',
    'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-muted disabled:hover:text-muted-foreground',
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
      <div className="flex w-full items-center">
        <button
          type="button"
          disabled={disabled || (min !== undefined && currentVal <= min)}
          onPointerDown={() => startContinuousChange('decrement')}
          onPointerUp={stopContinuousChange}
          onPointerLeave={stopContinuousChange}
          className={cn(stepperButtonClass, 'cursor-pointer rounded-l-lg border border-border border-r-0')}
          title="Decrease"
          aria-label="Decrease"
        >
          <Minus size={14} />
        </button>

        <input
          id={id}
          type="text"
          name={name}
          value={currentVal}
          readOnly
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(
            fieldInputBase,
            'h-10 rounded-none border-x-0 text-center font-mono',
            error && fieldInputError,
          )}
        />

        <button
          type="button"
          disabled={disabled || (max !== undefined && currentVal >= max)}
          onPointerDown={() => startContinuousChange('increment')}
          onPointerUp={stopContinuousChange}
          onPointerLeave={stopContinuousChange}
          className={cn(stepperButtonClass, 'cursor-pointer rounded-r-lg border border-border border-l-0')}
          title="Increase"
          aria-label="Increase"
        >
          <Plus size={14} />
        </button>
      </div>
    </FieldWrapper>
  )
}
