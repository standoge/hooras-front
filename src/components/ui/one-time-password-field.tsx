import * as React from 'react'
import * as OneTimePasswordFieldPrimitive from '@radix-ui/react-one-time-password-field'
import { cn } from '@/lib/utils'

const OneTimePasswordField = OneTimePasswordFieldPrimitive.Root

const OneTimePasswordFieldInput = React.forwardRef<
  React.ComponentRef<typeof OneTimePasswordFieldPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof OneTimePasswordFieldPrimitive.Input>
>(({ className, ...props }, ref) => (
  <OneTimePasswordFieldPrimitive.Input
    ref={ref}
    className={cn(
      'flex h-10 w-10 rounded-lg border border-border bg-muted text-center text-[length:var(--text-body-sm)] text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
))
OneTimePasswordFieldInput.displayName = OneTimePasswordFieldPrimitive.Input.displayName

const OneTimePasswordFieldHiddenInput = OneTimePasswordFieldPrimitive.HiddenInput

export { OneTimePasswordField, OneTimePasswordFieldInput, OneTimePasswordFieldHiddenInput }
