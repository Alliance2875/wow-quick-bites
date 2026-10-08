import Image from "next/image";
import { ButtonLink } from "@/components/shared/ui/Button";
import Icon from "@/components/shared/ui/Icon";
import { heroHighlights } from "@/data/site";
import { localize, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { localePath, routes } from "@/lib/routes";

// Figma: dark media panel on the right ~60% of the hero, flush with the header and the right edge.
// The panel fades into the page background on its left (→ the light theme's light-to-dark gradient).
const PANEL_MASK = {
  maskImage: "linear-gradient(to right, transparent, #000 30%)",
  WebkitMaskImage: "linear-gradient(to right, transparent, #000 30%)",
} as const;

// The video is portrait (720×1024): up to 640px wide (light vertical crop, no blur from upscaling),
// centred in the panel, its sides melting into the black.
const VIDEO_MASK = {
  maskImage: "linear-gradient(to right, transparent, #000 18%, #000 82%, transparent)",
  WebkitMaskImage: "linear-gradient(to right, transparent, #000 18%, #000 82%, transparent)",
} as const;

export default function HeroSection({ lang, dict }: { lang: Locale; dict: Dictionary["home"]["hero"] }) {
  return (
    <section className="relative isolate overflow-hidden">
      <div
        className="absolute inset-y-0 right-0 -z-10 flex w-full justify-center bg-black md:w-[60%]"
        style={PANEL_MASK}
      >
        <div className="relative h-full w-full max-w-[40rem]" style={VIDEO_MASK}>
          <Image
            src="/images/hero-poster.jpg"
            alt=""
            fill
            preload
            sizes="(min-width: 768px) 640px, 100vw"
            className="object-cover"
          />
          <video
            className="motion-video absolute inset-0 h-full w-full object-cover"
            src="/heroBurger.mp4"
            poster="/images/hero-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label={dict.videoAlt}
          />
        </div>
      </div>
      {/* Small screens: the video sits behind the text, so the text gets a readable backdrop */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/85 to-background/20 md:hidden" />

      <div className="page-container flex min-h-[32.5rem] flex-col justify-center py-14 lg:h-[40rem]">
        <h1 className="text-[clamp(2.5rem,4.8vw,4.5rem)] leading-[1.05]">
          {dict.line1}
          <br />
          <span className="text-accent">{dict.line2}</span>
          <br />
          {dict.line3}
        </h1>
        <p className="mt-6 max-w-md text-base text-muted-foreground md:max-w-[min(28rem,33vw)] lg:text-lg">{dict.text}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href={localePath(lang, routes.menu)} variant="outline" size="lg">
            {dict.viewMenu}
          </ButtonLink>
          <ButtonLink href={localePath(lang, routes.menu)} size="lg">
            {dict.orderNow}
          </ButtonLink>
        </div>
        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-muted-foreground">
          {heroHighlights.map((item) => (
            <li key={item.icon} className="flex items-center gap-2">
              <Icon name={item.icon} className="h-4 w-4 text-accent" />
              {localize(item.label, lang)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
