import Icon from "@/components/shared/ui/Icon";
import { features } from "@/data/site";
import { localize, type Locale } from "@/i18n/config";

export default function FeaturesBar({ lang, label }: { lang: Locale; label: string }) {
  return (
    <section
      aria-label={label}
      className="grid gap-6 rounded-2xl bg-primary px-6 py-5 text-primary-foreground sm:grid-cols-2 lg:grid-cols-4"
    >
      {features.map((feature) => (
        <div key={feature.icon} className="flex items-center gap-3">
          <Icon name={feature.icon} className="h-6 w-6 shrink-0" />
          <div>
            <p className="font-bold">{localize(feature.title, lang)}</p>
            <p className="text-xs opacity-80">{localize(feature.text, lang)}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
