export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="h-8 w-2/3 animate-pulse rounded bg-teal-900/10" />
      <div className="mt-4 h-4 w-1/2 animate-pulse rounded bg-teal-900/10" />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="h-48 animate-pulse rounded-xl bg-white" />
        <div className="h-48 animate-pulse rounded-xl bg-white" />
      </div>
    </div>
  );
}
