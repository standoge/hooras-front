import { Skeleton } from '@/components/ui/skeleton'

export function LayoutSkeleton() {
  return (
    <div className="flex min-h-svh w-full">
      <aside className="hidden w-sidebar shrink-0 flex-col gap-2 border-r border-sidebar-border bg-sidebar p-2 md:flex">
        <Skeleton className="h-12 w-full rounded-lg" />
        <div className="space-y-2 px-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-full rounded-md" />
          <Skeleton className="h-8 w-full rounded-md" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
        <div className="mt-auto px-2 pb-2">
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </aside>
      <div className="flex flex-1 flex-col bg-background">
        <div className="flex h-16 shrink-0 items-center gap-2 px-4">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-48 w-full rounded-xl bg-muted/50" />
          <Skeleton className="h-48 w-full rounded-xl bg-muted/50" />
        </div>
      </div>
    </div>
  )
}
