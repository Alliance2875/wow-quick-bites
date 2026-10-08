import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PairsWithCard from "@/components/product/PairsWithCard";
import PurchasePanel from "@/components/product/PurchasePanel";
import Breadcrumb from "@/components/shared/ui/Breadcrumb";
import Container from "@/components/shared/ui/Container";
import Icon from "@/components/shared/ui/Icon";
import Tag from "@/components/shared/ui/Tag";
import { categories } from "@/data/categories";
import { getMenuItem, menuItems } from "@/data/menu";
import { tagLabel } from "@/data/tags";
import { localize } from "@/i18n/config";
import { resolveLang } from "@/i18n/get-dictionary";
import { formatPrice } from "@/lib/format";
import { localePath, routes } from "@/lib/routes";

export function generateStaticParams() {
  return menuItems.map((item) => ({ slug: item.id }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/menu/[slug]">): Promise<Metadata> {
  const { lang } = await resolveLang(params);
  const item = getMenuItem((await params).slug);
  return item ? { title: localize(item.name, lang), description: localize(item.description, lang) } : {};
}

export default async function ProductPage({ params }: PageProps<"/[lang]/menu/[slug]">) {
  const { lang, dict } = await resolveLang(params);
  const item = getMenuItem((await params).slug);
  if (!item) notFound();

  const name = localize(item.name, lang);
  const category = categories.find((c) => c.id === item.categories[0]);
  const pairsWith = item.pairsWith ? getMenuItem(item.pairsWith) : undefined;
  const href = (path: string) => localePath(lang, path);

  return (
    <Container className="py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Breadcrumb
          items={[
            { label: dict.common.nav.home, href: href(routes.home) },
            { label: dict.common.nav.menu, href: href(routes.menu) },
            ...(category
              ? [{ label: localize(category.name, lang), href: `${href(routes.menu)}?category=${category.id}` }]
              : []),
            { label: name },
          ]}
        />
        <Link href={href(routes.menu)} className="flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
          <Icon name="arrowLeft" className="h-4 w-4" /> {dict.product.backToMenu}
        </Link>
      </div>

      <div className="mt-5 grid gap-10 lg:grid-cols-[minmax(0,40.625rem)_1fr] lg:gap-14">
        <div className="relative aspect-[650/744] overflow-hidden rounded-3xl">
          <Image src={item.image} alt={name} fill preload sizes="(min-width: 1024px) 650px, 100vw" className="object-cover" />
          {category && (
            <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-[0.6875rem] font-bold uppercase text-primary-foreground">
              {localize(category.name, lang)}
            </span>
          )}
        </div>

        <div>
          <h1 className="text-4xl leading-tight sm:text-5xl">{name}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{localize(item.description, lang)}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <Tag key={tag}>{tagLabel(tag, lang)}</Tag>
            ))}
          </div>
          <p className="mt-5 text-3xl font-bold text-accent">{formatPrice(item.price)}</p>

          <PurchasePanel
            item={item}
            itemLabel={(category ? localize(category.name, lang) : name).toLowerCase().replace(/s$/, "")}
            lang={lang}
            dict={dict.product}
            options={dict.common.options}
            cartHref={href(routes.cart)}
          />
        </div>
      </div>

      {pairsWith && <PairsWithCard item={pairsWith} lang={lang} dict={dict.product} />}
    </Container>
  );
}
