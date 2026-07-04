import { Fragment, useId, useState, type ElementType } from 'react'
import { FieldWrapper } from '../field-wrapper'
import { Toggle } from '@/components/ui/toggle'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface ToggleOption {
  value: string | number
  label?: string
  icon?: ElementType
  hint?: string
}

export interface ToggleFieldProps {
  label?: string
  hint?: string
  error?: string
  inline?: boolean
  disabled?: boolean
  options: ToggleOption[]
  value?: (string | number)[]
  defaultValue?: (string | number)[]
  multiple?: boolean
  size?: 'sm' | 'md' | 'lg'
  name?: string
  onChange?: (e: { target: { name: string; value: (string | number)[] }; persist: () => void }) => void
}

export function ToggleField({
  label,
  hint,
  error,
  inline = false,
  disabled = false,
  options = [],
  value,
  defaultValue = [],
  multiple = false,
  size = 'md',
  name = '',
  onChange,
}: ToggleFieldProps) {
  const generatedId = useId()
  const id = `${name || 'toggle'}-${generatedId}`

  const [internalVal, setInternalVal] = useState<(string | number)[]>(defaultValue)
  const currentVal = value !== undefined ? value : internalVal

  const handleToggle = (optVal: string | number, pressed: boolean) => {
    let newVal: (string | number)[]

    if (multiple) {
      if (pressed) {
        newVal = currentVal.includes(optVal) ? currentVal : [...currentVal, optVal]
      } else {
        newVal = currentVal.filter((v) => v !== optVal)
      }
    } else {
      newVal = pressed ? [optVal] : []
    }

    if (value === undefined) {
      setInternalVal(newVal)
    }

    onChange?.({
      target: { name, value: newVal },
      persist: () => {},
    })
  }

  const sizeMap = {
    sm: 'sm' as const,
    md: 'default' as const,
    lg: 'lg' as const,
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
      <TooltipProvider>
        <div
          id={id}
          role="group"
          className="inline-flex w-fit max-w-full rounded-lg border border-border bg-muted p-1"
        >
          {options.map((opt) => {
            const isActive = currentVal.includes(opt.value)

            const buttonEl = (
              <Toggle
                key={opt.value}
                type="button"
                variant="outline"
                size={sizeMap[size]}
                disabled={disabled}
                pressed={isActive}
                onPressedChange={(pressed) => handleToggle(opt.value, pressed)}
                className={cn(
                  'border-transparent',
                  isActive && 'border-primary/50 bg-primary/10 text-primary shadow-[var(--shadow-sm)]',
                )}
              >
                {opt.icon ? (
                  <opt.icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
                ) : null}
                {opt.label ? <span>{opt.label}</span> : null}
              </Toggle>
            )

            if (opt.hint) {
              return (
                <Tooltip key={opt.value}>
                  <TooltipTrigger asChild>{buttonEl}</TooltipTrigger>
                  <TooltipContent side="top">{opt.hint}</TooltipContent>
                </Tooltip>
              )
            }

            return <Fragment key={opt.value}>{buttonEl}</Fragment>
          })}
        </div>
      </TooltipProvider>
    </FieldWrapper>
  )
}
