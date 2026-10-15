"use client";

import ContactCard from "@/components/contact/ContactCard";
import type { IconName } from "@/components/shared/ui/Icon";
import { localize, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { useGetBusinessQuery } from "@/lib/redux/api/businessApi";

type ContactEntry = { icon: IconName; label: string; value: string; href?: string };

export default function ContactDetails({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary["contact"];
}) {
  const { data: business, isLoading, isError } = useGetBusinessQuery();

  const cards: ContactEntry[] = [];
  if (business?.phone) {
    cards.push({
      icon: "phone",
      label: dict.phone,
      value: business.phone,
      href: `tel:${business.phone.replace(/[^\d+]/g, "")}`,
    });
  }
  if (business?.email) {
    cards.push({ icon: "mail", label: dict.email, value: business.email, href: `mailto:${business.email}` });
  }
  if (business?.location) cards.push({ icon: "mapPin", label: dict.location, value: localize(business.location, lang) });
  if (business?.hours) cards.push({ icon: "clock", label: dict.hours, value: localize(business.hours, lang) });

  if (isError) return <p role="alert" className="mt-8 text-sm text-critical">{dict.loadError}</p>;
  if (isLoading) return <div className="mt-8 min-h-40" aria-busy="true" />;
  if (cards.length === 0) return <p className="mt-8 text-sm text-muted-foreground">{dict.noDetails}</p>;

  return (
    <ul className="mt-8 grid gap-5 sm:grid-cols-2">
      {cards.map((card) => (
        <li key={card.icon}>
          <ContactCard {...card} />
        </li>
      ))}
    </ul>
  );
}
