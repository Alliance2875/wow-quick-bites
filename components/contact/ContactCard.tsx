import Icon, { type IconName } from "@/components/shared/ui/Icon";

export default function ContactCard({
  icon,
  label,
  value,
  href,
}: {
  icon: IconName;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex h-full items-center gap-4 rounded-2xl bg-card p-5 light:border light:border-border">
      <Icon name={icon} className="h-6 w-6 shrink-0 text-accent" />
      <div>
        <p className="font-bold">{label}</p>
        {href ? (
          <a href={href} className="text-sm text-muted-foreground hover:text-accent">
            {value}
          </a>
        ) : (
          <p className="text-sm text-muted-foreground">{value}</p>
        )}
      </div>
    </div>
  );
}
