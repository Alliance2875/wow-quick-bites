import Link from "next/link";
import Icon from "./Icon";

export default function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 className="text-2xl sm:text-3xl">{title}</h2>
      {action && (
        <Link
          href={action.href}
          className="flex items-center gap-1 text-sm font-bold text-accent hover:underline"
        >
          {action.label} <Icon name="arrowRight" className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
