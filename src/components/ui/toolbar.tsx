import * as React from 'react'
import * as ToolbarPrimitive from '@radix-ui/react-toolbar'
import { cn } from '@/lib/utils'

const Toolbar = React.forwardRef<
  React.ComponentRef<typeof ToolbarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <ToolbarPrimitive.Root
    ref={ref}
    className={cn('flex w-full min-w-max items-center gap-1 rounded-lg border border-border bg-card p-1', className)}
    {...props}
  />
))
Toolbar.displayName = ToolbarPrimitive.Root.displayName

const ToolbarToggleGroup = ToolbarPrimitive.ToggleGroup

const toolbarItemStyles =
  'inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-[length:var(--text-body-sm)] font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

const ToolbarToggleItem = React.forwardRef<
  React.ComponentRef<typeof ToolbarPrimitive.ToggleItem>,
  React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.ToggleItem>
>(({ className, ...props }, ref) => (
  <ToolbarPrimitive.ToggleItem
    ref={ref}
    className={cn(
      toolbarItemStyles,
      'disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
      className,
    )}
    {...props}
  />
))
ToolbarToggleItem.displayName = ToolbarPrimitive.ToggleItem.displayName

const ToolbarSeparator = React.forwardRef<
  React.ComponentRef<typeof ToolbarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ToolbarPrimitive.Separator
    ref={ref}
    className={cn('mx-1 h-6 w-px bg-border', className)}
    {...props}
  />
))
ToolbarSeparator.displayName = ToolbarPrimitive.Separator.displayName

const ToolbarLink = React.forwardRef<
  React.ComponentRef<typeof ToolbarPrimitive.Link>,
  React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Link>
>(({ className, ...props }, ref) => (
  <ToolbarPrimitive.Link ref={ref} className={cn(toolbarItemStyles, className)} {...props} />
))
ToolbarLink.displayName = ToolbarPrimitive.Link.displayName

const ToolbarButton = React.forwardRef<
  React.ComponentRef<typeof ToolbarPrimitive.Button>,
  React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Button>
>(({ className, ...props }, ref) => (
  <ToolbarPrimitive.Button
    ref={ref}
    className={cn(toolbarItemStyles, 'disabled:pointer-events-none disabled:opacity-50', className)}
    {...props}
  />
))
ToolbarButton.displayName = ToolbarPrimitive.Button.displayName

export {
  Toolbar,
  ToolbarToggleGroup,
  ToolbarToggleItem,
  ToolbarSeparator,
  ToolbarLink,
  ToolbarButton,
}
