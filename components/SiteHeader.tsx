import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

const svgProps = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export default function SiteHeader({ current }: { current: string }) {
  return (
    <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="WOW Quick Bites logo"
            width={369}
            height={307}
            sizes="80px"
            className="h-[60px] w-auto drop-shadow-[0_2px_4px_rgb(0_0_0/0.45)]"
          />
          <span className="font-display text-lg sm:text-xl">WOW Quick Bites</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 text-sm font-semibold lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={link.href === current ? "page" : undefined}
              className="decoration-2 underline-offset-8 hover:underline aria-[current=page]:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/menu"
            className="hidden rounded-full border-2 border-primary-foreground px-4 py-1.5 text-sm font-bold transition hover:bg-primary-foreground hover:text-primary sm:inline-block"
          >
            Order Now
          </Link>

          <details className="group relative lg:hidden">
            <summary
              aria-label="Open menu"
              className="grid h-10 w-10 cursor-pointer place-items-center rounded-full hover:bg-primary-foreground/10"
            >
              <svg {...svgProps} className="h-6 w-6 group-open:hidden">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg {...svgProps} className="hidden h-6 w-6 group-open:block">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </summary>
            <nav
              aria-label="Mobile"
              className="absolute right-0 top-14 flex w-56 flex-col gap-1 rounded-2xl bg-card p-3 text-foreground shadow-glow"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-xl px-3 py-2 text-sm font-semibold hover:bg-muted"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/menu"
                className="mt-1 rounded-full bg-primary px-3 py-2 text-center text-sm font-bold text-primary-foreground"
              >
                Order Now
              </Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}