import AdPanel from "@/components/home/AdPanel";
import CategoryStrip from "@/components/home/CategoryStrip";
import FeaturesBar from "@/components/home/FeaturesBar";
import HeroSection from "@/components/home/HeroSection";
import DishCard from "@/components/shared/product/DishCard";
import Container from "@/components/shared/ui/Container";
import SectionHeader from "@/components/shared/ui/SectionHeader";
import { newItems, popularItems } from "@/data/menu";
import { resolveLang } from "@/i18n/get-dictionary";
import { localePath, routes } from "@/lib/routes";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang, dict } = await resolveLang(params);

  return (
    <>
      <HeroSection lang={lang} dict={dict.home.hero} />

      <Container className="space-y-14 pb-16 pt-12 md:space-y-[4.5rem] md:pb-20">
        <CategoryStrip lang={lang} dict={dict.home.categories} />

        <section>
          <SectionHeader
            title={dict.home.popular.title}
            action={{ label: dict.home.popular.seeAll, href: localePath(lang, routes.menu) }}
          />
          <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_18.125rem]">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {popularItems.map((item) => (
                <DishCard key={item.id} item={item} lang={lang} dict={dict.common} />
              ))}
            </div>
            <AdPanel lang={lang} brand={dict.common.brand} dict={dict.home.ad} />
          </div>
        </section>

        <section>
          <SectionHeader title={dict.home.newOnMenu.title} />
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {newItems.map((item) => (
              <DishCard key={item.id} item={item} lang={lang} dict={dict.common} />
            ))}
          </div>
        </section>

        <FeaturesBar lang={lang} label={dict.home.features.label} />
      </Container>
    </>
  );
}
