import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-gray-200 dark:bg-dark-800/80 animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-100 dark:border-dark-800 bg-white dark:bg-dark-900 p-6 space-y-4 shadow-sm animate-pulse">
      <Skeleton className="h-48 w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
}

function SkeletonTable({ rows = 5 }: SkeletonTableProps) {
  return (
    <div className="w-full border border-gray-100 dark:border-dark-800 rounded-xl overflow-hidden bg-white dark:bg-dark-900 shadow-sm animate-pulse">
      {/* Header Skeleton */}
      <div className="border-b border-gray-100 dark:border-dark-800 bg-gray-50/50 dark:bg-dark-950/20 p-4 flex space-x-4">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      {/* Rows Skeletons */}
      <div className="divide-y divide-gray-100 dark:divide-dark-800">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex space-x-4 items-center">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonTable }
