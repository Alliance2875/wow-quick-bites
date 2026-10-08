import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

const categories = ["Burgers", "Pizza", "Desserts", "Drinks", "Chips", "Chicken"];

const socials = [
  {
    label: "Instagram",
    path: (
      <>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01" />
      </>
    ),
  },
  {
    label: "Facebook",
    path: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  },
  {
    label: "YouTube",
    path: (
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17M10 15l5-3-5-3z" />
    ),
  },
  { label: "WhatsApp", path: <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /> },
];

export default function SiteFooter() {
  return (
    <footer className="mt-8 bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="WOW Quick Bites logo"
              width={369}
              height={307}
              sizes="96px"
              className="h-16 w-auto"
            />
            <span className="font-display text-2xl">WOW Quick Bites</span>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">Fresh flavours made with love.</p>
          <p className="mt-6 text-sm font-semibold">Follow Us</p>
          <ul className="mt-2 flex gap-3 text-muted-foreground">
            {socials.map((s) => (
              <li key={s.label}>
                <a href="#" aria-label={s.label} className="hover:text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    {s.path}
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-semibold text-primary">Quick Links</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-foreground">{l.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/menu" className="hover:text-foreground">Order now</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-primary">Categories</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {categories.map((c) => (
              <li key={c}>
                <Link href={`/menu?category=${c}`} className="hover:text-foreground">{c}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-semibold text-primary">Owner</p>
          <p className="mt-3 text-sm text-muted-foreground">Rwasibo Alexis Junior</p>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} WOW Quick Bites. All rights reserved.
        </p>
      </div>
    </footer>
  );
}