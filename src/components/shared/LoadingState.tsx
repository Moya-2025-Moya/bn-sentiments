export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`bg-bg-card rounded-xl border border-border-default p-5 animate-pulse ${className ?? ""}`}
    >
      <div className="h-4 w-32 bg-bg-card-hover rounded mb-4" />
      <div className="h-8 w-24 bg-bg-card-hover rounded mb-2" />
      <div className="h-3 w-48 bg-bg-card-hover rounded" />
    </div>
  );
}

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`bg-bg-card rounded-xl border border-border-default p-5 animate-pulse ${className ?? ""}`}
    >
      <div className="h-4 w-40 bg-bg-card-hover rounded mb-4" />
      <div className="h-48 bg-bg-card-hover rounded" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-14 bg-bg-card rounded-xl animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartSkeleton className="lg:col-span-1" />
        <ChartSkeleton className="lg:col-span-2" />
      </div>
    </div>
  );
}
