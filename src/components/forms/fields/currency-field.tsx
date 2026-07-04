import { useEffect, useId, useMemo, useState } from 'react'
import { FieldWrapper } from '../field-wrapper'
import { fieldInputBase, fieldInputError } from '../field-styles'
import { cn } from '@/lib/utils'

export interface CurrencyFieldProps {
  label?: string
  hint?: string
  error?: string
  inline?: boolean
  disabled?: boolean
  value?: number | null
  defaultValue?: number | null
  currency?: string
  locale?: string
  min?: number
  max?: number
  step?: number
  allowNegative?: boolean
  name?: string
  onChange?: (e: { target: { name: string; value: number | null }; persist: () => void }) => void
}

export function CurrencyField({
  label,
  hint,
  error,
  inline = false,
  disabled = false,
  value,
  defaultValue = null,
  currency = 'USD',
  locale = 'en-US',
  min,
  max,
  step = 1,
  allowNegative = false,
  name = '',
  onChange,
}: CurrencyFieldProps) {
  const generatedId = useId()
  const id = `${name || 'currency'}-${generatedId}`

  const [internalVal, setInternalVal] = useState<number | null>(defaultValue)
  const currentVal = value !== undefined ? value : internalVal

  const [isFocused, setIsFocused] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const formatter = useMemo(() => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    })
  }, [locale, currency])

  useEffect(() => {
    if (value !== undefined) {
      setInternalVal(value)
    }
  }, [value])

  useEffect(() => {
    if (isFocused) {
      setInputValue(currentVal !== null ? String(currentVal) : '')
    } else {
      setInputValue(currentVal !== null ? formatter.format(currentVal) : '')
    }
  }, [currentVal, isFocused, formatter])

  const validateValue = (num: number): number => {
    let nextVal = num
    if (!allowNegative && nextVal < 0) {
      nextVal = 0
    }
    if (min !== undefined && nextVal < min) {
      nextVal = min
    }
    if (max !== undefined && nextVal > max) {
      nextVal = max
    }
    return nextVal
  }

  const triggerChange = (newNum: number | null) => {
    if (value === undefined) {
      setInternalVal(newNum)
    }
    onChange?.({
      target: { name, value: newNum },
      persist: () => {},
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    let cleaned = val.replace(/[^\d.-]/g, '')

    const decimalCount = (cleaned.match(/\./g) || []).length
    if (decimalCount > 1) {
      const parts = cleaned.split('.')
      cleaned = `${parts[0]}.${parts.slice(1).join('')}`
    }
    if (!allowNegative) {
      cleaned = cleaned.replace(/-/g, '')
    } else {
      const minusCount = (cleaned.match(/-/g) || []).length
      if (minusCount > 1 || cleaned.indexOf('-') > 0) {
        cleaned = cleaned.replace(/-/g, '')
        cleaned = `-${cleaned}`
      }
    }

    setInputValue(cleaned)

    const numeric = Number.parseFloat(cleaned)
    if (!Number.isNaN(numeric)) {
      triggerChange(validateValue(numeric))
    } else {
      triggerChange(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      const baseNum = currentVal !== null ? currentVal : 0
      const delta = e.key === 'ArrowUp' ? step : -step
      const newNum = validateValue(baseNum + delta)

      triggerChange(newNum)
      setInputValue(String(newNum))
    }
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
          value={currentVal !== null ? currentVal : ''}
        />

        <input
          id={id}
          type="text"
          inputMode="decimal"
          disabled={disabled}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(fieldInputBase, 'font-mono', error && fieldInputError)}
        />
      </div>
    </FieldWrapper>
  )
}
