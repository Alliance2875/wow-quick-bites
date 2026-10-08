import Link from "next/link";
import Icon from "@/components/shared/ui/Icon";
import { categories } from "@/data/categories";
import { localize, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { localePath, routes } from "@/lib/routes";

export default function CategoryStrip({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary["home"]["categories"];
}) {
  return (
    <section aria-label={dict.label}>
      <ul className="grid grid-cols-3 gap-4 md:grid-cols-6">
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`${localePath(lang, routes.menu)}?category=${category.id}`}
              className="group flex flex-col items-center gap-2 p-2 outline-none"
            >
              <span className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground ring-2 ring-primary/0 ring-offset-4 ring-offset-background transition duration-300 group-hover:-translate-y-1 group-hover:shadow-glow group-hover:ring-primary/60 group-focus-visible:ring-primary">
                <Icon name={category.icon} className="h-6 w-6 transition duration-300 group-hover:-rotate-12" />
              </span>
              <span className="text-sm font-bold group-hover:text-accent">{localize(category.name, lang)}</span>
              <span className="text-[0.6875rem] text-muted-foreground group-hover:text-accent">{dict.shopNow}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
