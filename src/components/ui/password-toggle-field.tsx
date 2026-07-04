import * as React from 'react'
import * as PasswordToggleFieldPrimitive from '@radix-ui/react-password-toggle-field'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

const PasswordToggleField = PasswordToggleFieldPrimitive.Root

const PasswordToggleFieldInput = React.forwardRef<
  React.ComponentRef<typeof PasswordToggleFieldPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof PasswordToggleFieldPrimitive.Input>
>(({ className, ...props }, ref) => (
  <PasswordToggleFieldPrimitive.Input
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-lg border border-border bg-muted px-3 py-2 text-[length:var(--text-body-sm)] text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
))
PasswordToggleFieldInput.displayName = PasswordToggleFieldPrimitive.Input.displayName

const PasswordToggleFieldToggle = React.forwardRef<
  React.ComponentRef<typeof PasswordToggleFieldPrimitive.Toggle>,
  React.ComponentPropsWithoutRef<typeof PasswordToggleFieldPrimitive.Toggle>
>(({ className, ...props }, ref) => (
  <PasswordToggleFieldPrimitive.Toggle
    ref={ref}
    className={cn(
      'absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      className,
    )}
    {...props}
  >
    <PasswordToggleFieldPrimitive.Icon visible={<Eye className="h-4 w-4" />} hidden={<EyeOff className="h-4 w-4" />} />
  </PasswordToggleFieldPrimitive.Toggle>
))
PasswordToggleFieldToggle.displayName = PasswordToggleFieldPrimitive.Toggle.displayName

export { PasswordToggleField, PasswordToggleFieldInput, PasswordToggleFieldToggle }
