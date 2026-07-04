import { useId, useMemo, useRef, useState } from 'react'
import { FieldWrapper } from '../field-wrapper'
import { fieldTriggerBase } from '../field-styles'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  parseColor,
  formatColor,
  hsvToRgb,
  type ColorState,
} from '../utils/color-conversions'
import { cn } from '@/lib/utils'

export interface ColorPickerFieldProps {
  label?: string
  hint?: string
  error?: string
  inline?: boolean
  disabled?: boolean
  format?: 'hex' | 'rgb' | 'hsl' | 'hex-alpha' | 'rgb-alpha' | 'hsl-alpha'
  presets?: string[]
  showInput?: boolean
  value?: string
  defaultValue?: string
  name?: string
  onChange?: (e: { target: { name: string; value: string }; persist: () => void }) => void
}

const DEFAULT_PRESETS = [
  '#006bff',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#8b5cf6',
  '#3b82f6',
  '#64748b',
]

export function ColorPickerField({
  label,
  hint,
  error,
  inline = false,
  disabled = false,
  format = 'hex',
  presets = DEFAULT_PRESETS,
  value,
  defaultValue = '#006bff',
  name = '',
  onChange,
}: ColorPickerFieldProps) {
  const generatedId = useId()
  const id = `${name || 'color'}-${generatedId}`
  const [open, setOpen] = useState(false)

  const initialColor = useMemo(() => parseColor(defaultValue), [defaultValue])
  const [internalColor, setInternalColor] = useState<ColorState>(initialColor)

  const currentColor = useMemo(() => {
    if (value !== undefined) {
      return parseColor(value)
    }
    return internalColor
  }, [value, internalColor])

  const triggerChange = (newColor: ColorState) => {
    const formatted = formatColor(newColor, format)
    if (value === undefined) {
      setInternalColor(newColor)
    }
    onChange?.({
      target: { name, value: formatted },
      persist: () => {},
    })
  }

  const svRef = useRef<HTMLDivElement>(null)

  const handleSVPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return
    updateSVFromPointer(e)

    const handlePointerMove = (moveEvent: PointerEvent) => {
      updateSVFromPointer(moveEvent)
    }
    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const updateSVFromPointer = (e: PointerEvent | React.PointerEvent) => {
    if (!svRef.current) return
    const rect = svRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height))

    const s = Math.round((x / rect.width) * 100)
    const v = Math.round((1 - y / rect.height) * 100)

    const rgb = hsvToRgb(currentColor.h, s, v)
    triggerChange({
      ...currentColor,
      ...rgb,
      s,
      v,
    })
  }

  const hueRef = useRef<HTMLDivElement>(null)

  const handleHuePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return
    updateHueFromPointer(e)

    const handlePointerMove = (moveEvent: PointerEvent) => {
      updateHueFromPointer(moveEvent)
    }
    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const updateHueFromPointer = (e: PointerEvent | React.PointerEvent) => {
    if (!hueRef.current) return
    const rect = hueRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const h = Math.round((x / rect.width) * 360)

    const rgb = hsvToRgb(h, currentColor.s, currentColor.v)
    triggerChange({
      ...currentColor,
      ...rgb,
      h: h === 360 ? 0 : h,
    })
  }

  const alphaRef = useRef<HTMLDivElement>(null)

  const handleAlphaPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return
    updateAlphaFromPointer(e)

    const handlePointerMove = (moveEvent: PointerEvent) => {
      updateAlphaFromPointer(moveEvent)
    }
    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const updateAlphaFromPointer = (e: PointerEvent | React.PointerEvent) => {
    if (!alphaRef.current) return
    const rect = alphaRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const a = Number.parseFloat((x / rect.width).toFixed(2))

    triggerChange({
      ...currentColor,
      a,
    })
  }

  const handlePresetSelect = (presetStr: string) => {
    triggerChange(parseColor(presetStr))
  }

  const hueBaseRgb = hsvToRgb(currentColor.h, 100, 100)
  const hueBaseHex = `rgb(${hueBaseRgb.r}, ${hueBaseRgb.g}, ${hueBaseRgb.b})`

  return (
    <FieldWrapper
      id={id}
      label={label}
      hint={hint}
      error={error}
      inline={inline}
      disabled={disabled}
    >
      <div className="relative flex w-full gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild disabled={disabled}>
            <button type="button" className={cn(fieldTriggerBase, 'flex-1 justify-start')}>
              <div
                className="h-5 w-5 flex-shrink-0 rounded border border-border"
                style={{ backgroundColor: formatColor(currentColor, 'rgb-alpha') }}
              />
              <span className="font-mono text-xs uppercase text-foreground">
                {formatColor(currentColor, format)}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[220px] p-3">
            <div className="flex flex-col gap-3">
              <div
                ref={svRef}
                onPointerDown={handleSVPointerDown}
                className="relative h-28 w-full cursor-crosshair overflow-hidden rounded-lg border border-border select-none"
                style={{ backgroundColor: hueBaseHex }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                <div
                  className="pointer-events-none absolute h-3 w-3 -translate-x-1.5 -translate-y-1.5 rounded-full border-2 border-white shadow-[var(--shadow-sm)]"
                  style={{
                    left: `${currentColor.s}%`,
                    top: `${100 - currentColor.v}%`,
                    backgroundColor: formatColor(currentColor, 'rgb'),
                  }}
                />
              </div>

              <div className="flex select-none flex-col gap-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                  Hue
                </span>
                <div
                  ref={hueRef}
                  onPointerDown={handleHuePointerDown}
                  className="relative h-3 w-full cursor-ew-resize rounded border border-border [background-image:linear-gradient(to_right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)]"
                >
                  <div
                    className="pointer-events-none absolute h-3.5 w-2 -translate-x-1 -translate-y-0.5 rounded border border-border bg-card shadow-[var(--shadow-sm)]"
                    style={{ left: `${(currentColor.h / 360) * 100}%` }}
                  />
                </div>
              </div>

              {format.includes('alpha') ? (
                <div className="flex select-none flex-col gap-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    Opacity ({Math.round(currentColor.a * 100)}%)
                  </span>
                  <div
                    ref={alphaRef}
                    onPointerDown={handleAlphaPointerDown}
                    className="relative h-3 w-full cursor-ew-resize rounded border border-border bg-muted"
                    style={{
                      backgroundImage: `linear-gradient(to right, transparent, rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b}))`,
                    }}
                  >
                    <div
                      className="pointer-events-none absolute h-3.5 w-2 -translate-x-1 -translate-y-0.5 rounded border border-border bg-card shadow-[var(--shadow-sm)]"
                      style={{ left: `${currentColor.a * 100}%` }}
                    />
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                  Presets
                </span>
                <div className="grid grid-cols-8 gap-1.5">
                  {presets.map((preset) => {
                    const active =
                      formatColor(parseColor(preset), 'hex') === formatColor(currentColor, 'hex')
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handlePresetSelect(preset)}
                        className={cn(
                          'h-5 w-5 cursor-pointer rounded border border-border transition-transform hover:scale-110',
                          active && 'ring-1 ring-primary',
                        )}
                        style={{ backgroundColor: preset }}
                        title={preset}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </FieldWrapper>
  )
}
