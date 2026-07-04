import { useEffect, useId, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
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

const PARTIAL_NUMBER_PATTERN = /^-?\d*\.?\d*$/

function clampNumber(val: number, min?: number, max?: number) {
  let next = val
  if (min !== undefined && next < min) next = min
  if (max !== undefined && next > max) next = max
  return next
}

function formatNumber(val: number, step: number) {
  const decimalPlaces = (step.toString().split('.')[1] || '').length
  return decimalPlaces > 0 ? Number.parseFloat(val.toFixed(decimalPlaces)) : val
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

  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const commitValue = (raw: string, fallback = currentVal) => {
    const trimmed = raw.trim()

    if (trimmed === '' || trimmed === '-' || trimmed === '.') {
      return fallback
    }

    const parsed = Number.parseFloat(trimmed)
    if (Number.isNaN(parsed)) {
      return fallback
    }

    return formatNumber(clampNumber(parsed, min, max), step)
  }

  const emitValue = (nextVal: number) => {
    if (value === undefined) {
      setInternalVal(nextVal)
    }

    onChange?.({
      target: { name, value: nextVal },
      persist: () => {},
    })
  }

  const handleUpdate = (direction: 'increment' | 'decrement') => {
    const baseVal = isEditing ? commitValue(draft, currentVal) : currentVal
    let nextVal = direction === 'increment' ? baseVal + step : baseVal - step
    nextVal = formatNumber(clampNumber(nextVal, min, max), step)

    if (isEditing) {
      setDraft(String(nextVal))
    }

    emitValue(nextVal)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    if (raw === '' || PARTIAL_NUMBER_PATTERN.test(raw)) {
      setDraft(raw)
    }
  }

  const handleInputFocus = () => {
    setIsEditing(true)
    setDraft(String(currentVal))
  }

  const handleInputBlur = () => {
    const nextVal = commitValue(draft, currentVal)
    setIsEditing(false)
    setDraft('')
    emitValue(nextVal)
  }

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const nextVal = commitValue(draft, currentVal)
      setIsEditing(false)
      setDraft('')
      emitValue(nextVal)
      e.currentTarget.blur()
    }

    if (e.key === 'Escape') {
      setIsEditing(false)
      setDraft('')
      e.currentTarget.blur()
    }
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

  useEffect(() => {
    if (!isEditing) {
      setDraft('')
    }
  }, [currentVal, isEditing])

  const stepperButtonClass = cn(
    'flex h-10 items-center justify-center bg-muted px-3 text-muted-foreground transition-colors select-none hover:bg-accent hover:text-primary',
    'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-muted disabled:hover:text-muted-foreground',
  )

  const displayValue = isEditing ? draft : String(currentVal)

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
          inputMode="decimal"
          name={name}
          value={displayValue}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
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
