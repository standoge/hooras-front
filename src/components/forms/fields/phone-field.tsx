import { useEffect, useId, useState } from 'react'
import { FieldWrapper } from '../field-wrapper'
import { fieldInputBase, fieldInputError, fieldOptionDefault, fieldOptionSelected } from '../field-styles'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PhoneCountryOption {
  code: string
  dial: string
  label: string
  flag?: string
}

export const DEFAULT_COUNTRIES: PhoneCountryOption[] = [
  { code: 'US', dial: '+1', label: 'United States', flag: '🇺🇸' },
  { code: 'MX', dial: '+52', label: 'Mexico', flag: '🇲🇽' },
  { code: 'CA', dial: '+1', label: 'Canada', flag: '🇨🇦' },
  { code: 'GB', dial: '+44', label: 'United Kingdom', flag: '🇬🇧' },
  { code: 'ES', dial: '+34', label: 'Spain', flag: '🇪🇸' },
  { code: 'FR', dial: '+33', label: 'France', flag: '🇫🇷' },
  { code: 'DE', dial: '+49', label: 'Germany', flag: '🇩🇪' },
  { code: 'IT', dial: '+39', label: 'Italy', flag: '🇮🇹' },
  { code: 'BR', dial: '+55', label: 'Brazil', flag: '🇧🇷' },
  { code: 'AR', dial: '+54', label: 'Argentina', flag: '🇦🇷' },
  { code: 'CO', dial: '+57', label: 'Colombia', flag: '🇨🇴' },
  { code: 'CL', dial: '+56', label: 'Chile', flag: '🇨🇱' },
  { code: 'PE', dial: '+51', label: 'Peru', flag: '🇵🇪' },
  { code: 'VE', dial: '+58', label: 'Venezuela', flag: '🇻🇪' },
  { code: 'JP', dial: '+81', label: 'Japan', flag: '🇯🇵' },
  { code: 'CN', dial: '+86', label: 'China', flag: '🇨🇳' },
  { code: 'IN', dial: '+91', label: 'India', flag: '🇮🇳' },
  { code: 'AU', dial: '+61', label: 'Australia', flag: '🇦🇺' },
  { code: 'ZA', dial: '+27', label: 'South Africa', flag: '🇿🇦' },
  { code: 'RU', dial: '+7', label: 'Russia', flag: '🇷🇺' },
]

export interface PhoneFieldProps {
  label?: string
  hint?: string
  error?: string
  inline?: boolean
  disabled?: boolean
  value?: string
  defaultValue?: string
  country?: string
  defaultCountry?: string
  countries?: PhoneCountryOption[]
  name?: string
  onCountryChange?: (countryCode: string) => void
  onChange?: (e: { target: { name: string; value: string }; persist: () => void }) => void
}

function parsePhoneValue(val: string, countries: PhoneCountryOption[]) {
  if (!val) return { dial: '', national: '' }
  const match = countries.find((c) => val.startsWith(c.dial))
  if (match) {
    return {
      dial: match.dial,
      national: val.substring(match.dial.length).trim(),
    }
  }
  return { dial: '', national: val }
}

export function PhoneField({
  label,
  hint,
  error,
  inline = false,
  disabled = false,
  value,
  defaultValue = '',
  country,
  defaultCountry = 'US',
  countries = DEFAULT_COUNTRIES,
  name = '',
  onCountryChange,
  onChange,
}: PhoneFieldProps) {
  const generatedId = useId()
  const id = `${name || 'phone'}-${generatedId}`
  const [open, setOpen] = useState(false)

  const initialParsed = parsePhoneValue(defaultValue, countries)

  const [selectedCountry, setSelectedCountry] = useState<PhoneCountryOption>(() => {
    if (country) {
      return countries.find((c) => c.code === country) || countries[0]
    }
    if (initialParsed.dial) {
      return (
        countries.find((c) => c.dial === initialParsed.dial) ||
        countries.find((c) => c.code === defaultCountry) ||
        countries[0]
      )
    }
    return countries.find((c) => c.code === defaultCountry) || countries[0]
  })

  const [nationalNumber, setNationalNumber] = useState(initialParsed.national)

  useEffect(() => {
    if (value !== undefined) {
      const parsed = parsePhoneValue(value, countries)
      if (parsed.dial) {
        const matchingCountry = countries.find((c) => c.dial === parsed.dial)
        if (matchingCountry) setSelectedCountry(matchingCountry)
      }
      setNationalNumber(parsed.national)
    }
  }, [value, countries])

  const handleCountryChange = (c: PhoneCountryOption) => {
    setSelectedCountry(c)
    onCountryChange?.(c.code)

    const newFullNumber = `${c.dial} ${nationalNumber}`.trim()
    onChange?.({
      target: { name, value: newFullNumber },
      persist: () => {},
    })
    setOpen(false)
  }

  const handleNationalNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^\d\s\-()]/g, '')
    setNationalNumber(cleaned)

    const newFullNumber = `${selectedCountry.dial} ${cleaned}`.trim()
    onChange?.({
      target: { name, value: newFullNumber },
      persist: () => {},
    })
  }

  const fullNumber = `${selectedCountry.dial} ${nationalNumber}`.trim()

  return (
    <FieldWrapper
      id={id}
      label={label}
      hint={hint}
      error={error}
      inline={inline}
      disabled={disabled}
    >
      <div className="relative flex w-full items-center">
        <input type="hidden" name={name} value={fullNumber} />

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild disabled={disabled}>
            <button
              type="button"
              className={cn(
                'flex h-10 cursor-pointer items-center gap-1.5 rounded-l-lg border border-border border-r-0 bg-muted px-3 transition-colors select-none hover:bg-accent',
                disabled && 'cursor-not-allowed opacity-50 hover:bg-muted',
              )}
            >
              <span className="text-base leading-none">{selectedCountry.flag}</span>
              <span className="font-mono text-xs font-semibold">{selectedCountry.dial}</span>
              <ChevronDown size={12} className="text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 p-2">
            <div className="flex max-h-[220px] flex-col gap-0.5 overflow-y-auto">
              {countries.map((c) => {
                const isSelected = c.code === selectedCountry.code
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleCountryChange(c)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-all',
                      isSelected ? fieldOptionSelected : fieldOptionDefault,
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-sm">{c.flag}</span>
                      <span className="rounded bg-accent px-1 py-0.5 font-mono text-[10px] text-muted-foreground">
                        {c.dial}
                      </span>
                      <span className="truncate">{c.label}</span>
                    </div>
                    {isSelected ? <Check size={12} className="text-primary" /> : null}
                  </button>
                )
              })}
            </div>
          </PopoverContent>
        </Popover>

        <input
          id={id}
          type="tel"
          disabled={disabled}
          value={nationalNumber}
          onChange={handleNationalNumberChange}
          placeholder="Enter phone number..."
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(
            fieldInputBase,
            'h-10 rounded-l-none rounded-r-lg',
            error && fieldInputError,
          )}
        />
      </div>
    </FieldWrapper>
  )
}
