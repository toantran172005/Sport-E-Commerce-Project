export function Skeleton({ className = '' }) {
  return (
    <div className={`bg-slate-200 dark:bg-slate-800 animate-pulse rounded-md ${className}`} />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-surface rounded-lg border border-line p-3 space-y-3">
      <Skeleton className="aspect-square w-full rounded-md" />
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-3 w-1/2" />
      <div className="pt-2 flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
}

export default Skeleton;
