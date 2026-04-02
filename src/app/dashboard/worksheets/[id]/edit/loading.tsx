export default function WorksheetEditorLoading() {
  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="h-10 w-72 animate-pulse rounded bg-muted" />
        <div className="h-16 animate-pulse rounded bg-card" />
        <div className="h-[60vh] animate-pulse rounded-lg border border-border bg-card" />
      </div>
    </main>
  );
}
