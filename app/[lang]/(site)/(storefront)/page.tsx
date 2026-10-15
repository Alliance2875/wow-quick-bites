import AdPanel from "@/components/home/AdPanel";
import CategoryStrip from "@/components/home/CategoryStrip";
import FeaturesBar from "@/components/home/FeaturesBar";
import HeroSection from "@/components/home/HeroSection";
import { NewDishes, PopularDishes } from "@/components/home/HomeDishes";
import Container from "@/components/shared/ui/Container";
import SectionHeader from "@/components/shared/ui/SectionHeader";
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
            <PopularDishes lang={lang} dict={dict.common} />
            <AdPanel lang={lang} brand={dict.common.brand} dict={dict.home.ad} />
          </div>
        </section>

        <section>
          <SectionHeader title={dict.home.newOnMenu.title} />
          <NewDishes lang={lang} dict={dict.common} />
        </section>

        <FeaturesBar lang={lang} label={dict.home.features.label} />
      </Container>
    </>
  );
}
