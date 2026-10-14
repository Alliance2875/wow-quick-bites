import type { Metadata } from "next";
import ContactCard from "@/components/contact/ContactCard";
import { contactCards } from "@/data/contact";
import { localize } from "@/i18n/config";
import { resolveLang } from "@/i18n/get-dictionary";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { dict } = await resolveLang(params);
  return { title: dict.contact.metaTitle };
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang, dict } = await resolveLang(params);

  return (
    <div className="mx-auto w-full max-w-[51.75rem] px-4 py-16 sm:px-6">
      <h1 className="text-4xl">{dict.contact.title}</h1>
      <ul className="mt-8 grid gap-5 sm:grid-cols-2">
        {contactCards.map((card) => (
          <li key={card.icon}>
            <ContactCard
              icon={card.icon}
              label={localize(card.label, lang)}
              value={localize(card.value, lang)}
              href={card.href}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
