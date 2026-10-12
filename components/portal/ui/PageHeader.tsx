/** Page title + subtitle, with the page's main action on the right (wraps under on phones). */
export default function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        <h1 className="text-[1.625rem] leading-tight sm:text-[1.75rem]">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-3xl text-[0.8125rem] text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}
