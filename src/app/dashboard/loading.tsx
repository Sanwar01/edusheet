export default function DashboardLoading() {
  return (
    <main className="container py-8">
      <div className="space-y-3">
        <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-72 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={`dashboard_stat_skeleton_${idx}`}
            className="h-28 animate-pulse rounded-lg border border-slate-200 bg-white"
          />
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={`worksheet_card_skeleton_${idx}`}
            className="h-40 animate-pulse rounded-lg border border-slate-200 bg-white"
          />
        ))}
      </div>
    </main>
  );
}
