/** Placeholder shown inside the portal shell while a page loads (loading.tsx). */
export default function PageSkeleton() {
  const block = "animate-pulse rounded-xl bg-panel-muted";
  return (
    <div aria-busy="true" className="space-y-7">
      <div className="space-y-3">
        <div className={`${block} h-8 w-72 max-w-full`} />
        <div className={`${block} h-4 w-96 max-w-full`} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`${block} h-28`} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className={`${block} h-96`} />
        <div className={`${block} h-72`} />
      </div>
    </div>
  );
}
