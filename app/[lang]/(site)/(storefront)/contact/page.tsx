import type { Metadata } from "next";
import ContactDetails from "@/components/contact/ContactDetails";
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
      <ContactDetails lang={lang} dict={dict.contact} />
    </div>
  );
}
