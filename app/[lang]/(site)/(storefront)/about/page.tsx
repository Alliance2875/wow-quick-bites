import type { Metadata } from "next";
import Image from "next/image";
import Container from "@/components/shared/ui/Container";
import { resolveLang } from "@/i18n/get-dictionary";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { dict } = await resolveLang(params);
  return { title: dict.about.metaTitle };
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { dict } = await resolveLang(params);
  const about = dict.about;

  return (
    <Container className="grid min-h-[35rem] items-center gap-12 py-16 lg:grid-cols-2">
      <div className="max-w-xl">
        <h1 className="text-4xl leading-tight">
          {about.title} <span className="text-accent">{about.titleAccent}</span>
        </h1>
        {about.paragraphs.map((text) => (
          <p key={text} className="mt-5 leading-7 text-muted-foreground">
            {text}
          </p>
        ))}
      </div>
      <div className="relative aspect-[608/509] overflow-hidden rounded-2xl">
        <Image
          src="/images/fruit-brownie.jpg"
          alt={about.imageAlt}
          fill
          preload
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
    </Container>
  );
}
