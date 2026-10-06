import Image from "next/image";
import Link from "next/link";

// Temporary mock content — will move to a data/ folder, then come from the backend.
const navLinks = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

const categories = [
  { name: "Burgers", icon: "beef" },
  { name: "Pizza", icon: "pizza" },
  { name: "Desserts", icon: "iceCream" },
  { name: "Drinks", icon: "cupSoda" },
  { name: "Chips", icon: "sandwich" },
  { name: "Chicken", icon: "drumstick" },
] as const;

const offers = [
  {
    tag: "Promotion",
    title: "Burger + Mojito combo",
    text: "Get our WOW Toasted Burger with a Fresh Mint Mojito and save RWF 1,000 every weekday.",
    image: "/images/burger.jpg",
  },
  {
    tag: "New dish",
    title: "Pepperoni Pizza is here",
    text: "Stone-baked and loaded with cheese. Try the newest member of the WOW family.",
    image: "/images/pizza.jpg",
  },
  {
    tag: "New offer",
    title: "Free delivery Fridays",
    text: "Every Friday, delivery is on us for orders above RWF 10,000.",
    image: "/images/fries.jpg",
  },
];

type Dish = {
  name: string;
  description: string;
  tags: string[];
  price: number;
  image: string;
  isNew?: boolean;
};

const popularDishes: Dish[] = [
  {
    name: "WOW Toasted Burger",
    description:
      "Juicy grilled beef patty, melted cheddar, lettuce, tomato and house sauce on a toasted sesame bun.",
    tags: ["Beef", "Cheese"],
    price: 6000,
    image: "/images/burger.jpg",
  },
  {
    name: "Chips & Marinated Chicken Leg",
    description: "Herb-marinated grilled chicken leg with crispy chips and garlic dip.",
    tags: ["Chicken", "Chips"],
    price: 7000,
    image: "/images/chicken.jpg",
  },
  {
    name: "WOW Loaded Fries (Beef & Chicken)",
    description: "Golden fries loaded with pulled beef, chicken and melted cheese.",
    tags: ["Beef", "Chicken"],
    price: 6500,
    image: "/images/fries.jpg",
    isNew: true,
  },
  {
    name: "Pepperoni Pizza",
    description: "Stone-baked pizza with stretchy mozzarella and spicy pepperoni.",
    tags: ["Pepperoni", "Cheese"],
    price: 9000,
    image: "/images/pizza.jpg",
    isNew: true,
  },
  {
    name: "Fresh Mint Mojito",
    description: "Crushed ice, fresh mint, lime and soda. Non-alcoholic.",
    tags: ["Cold", "Fresh"],
    price: 3000,
    image: "/images/mojito.jpg",
  },
  {
    name: "Mango Smoothie",
    description: "Ripe mango blended smooth and creamy.",
    tags: ["Fruit", "Fresh"],
    price: 3500,
    image: "/images/mango.jpg",
  },
];

const newDishes: Dish[] = [
  popularDishes[2],
  popularDishes[3],
  {
    name: "Oreo Chocolate Milkshake",
    description: "Thick chocolate shake blended with Oreo, topped with cream.",
    tags: ["Sweet", "Cold"],
    price: 4000,
    image: "/images/milkshake.jpg",
    isNew: true,
  },
];

const features = [
  { icon: "truck", title: "Fast Delivery", text: "Hot food to your door" },
  { icon: "shieldCheck", title: "Secure Payment", text: "MTN MoMo & Airtel Money" },
  { icon: "headphones", title: "24/7 Support", text: "We're here to help" },
  { icon: "leaf", title: "Fresh Ingredients", text: "Quality from local farms" },
] as const;

const socials = [
  { icon: "instagram", label: "Instagram", href: "#" },
  { icon: "facebook", label: "Facebook", href: "#" },
  { icon: "youtube", label: "YouTube", href: "#" },
  { icon: "messageCircle", label: "WhatsApp", href: "#" },
] as const;

// Lucide icons (same set as the reference site), inlined to avoid an extra dependency.
const icons = {
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  arrowRight: <path d="M5 12h14m-7-7 7 7-7 7" />,
  heart: (
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  ),
  truck: (
    <>
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9m10 0h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </>
  ),
  leaf: (
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10ZM2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  ),
  shieldCheck: (
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1zM9 12l2 2 4-4" />
  ),
  headphones: (
    <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
  ),
  beef: (
    <>
      <circle cx="12.5" cy="8.5" r="2.5" />
      <path d="M12.5 2a6.5 6.5 0 0 0-6.22 4.6c-1.1 3.13-.78 3.9-3.18 6.08A3 3 0 0 0 5 18c4 0 8.4-1.8 11.4-4.3A6.5 6.5 0 0 0 12.5 2Zm6 4 2.19 4.5a6.48 6.48 0 0 1 .31 2 6.49 6.49 0 0 1-2.6 5.2C15.4 20.2 11 22 7 22a3 3 0 0 1-2.68-1.66L2.4 16.5" />
    </>
  ),
  pizza: (
    <path d="m12 14-1 1m2.75 3.25-1.25 1.42M17.775 5.654a15.68 15.68 0 0 0-12.121 12.12M18.8 9.3a1 1 0 0 0 2.1 7.7M21.964 20.732a1 1 0 0 1-1.232 1.232l-18-5a1 1 0 0 1-.695-1.232A19.68 19.68 0 0 1 15.732 2.037a1 1 0 0 1 1.232.695z" />
  ),
  iceCream: (
    <path d="m7 11 4.08 10.35a1 1 0 0 0 1.84 0L17 11M17 7A5 5 0 0 0 7 7m10 0a2 2 0 0 1 0 4H7a2 2 0 0 1 0-4" />
  ),
  cupSoda: (
    <path d="m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8M5 8h14M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0m-5-7 1-6h2" />
  ),
  sandwich: (
    <>
      <path d="m2.37 11.223 8.372-6.777a2 2 0 0 1 2.516 0l8.371 6.777M21 15a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-5.25M3 15a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h9m-5.33-4 6.13 4.6a2 2 0 0 0 2.8-.4l3.15-4.2" />
      <rect width="20" height="4" x="2" y="11" rx="1" />
    </>
  ),
  drumstick: (
    <path d="M15.4 15.63a7.875 6 135 1 1 6.23-6.23 4.3 3.43 135 0 0-6.23 6.23m-7.11-2.92-2.6 2.6a2.5 2.5 0 1 0-1.65 4.65A2.5 2.5 0 1 0 8.7 18.3l2.59-2.59" />
  ),
  instagram: (
    <>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01" />
    </>
  ),
  facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  youtube: (
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17M10 15l5-3-5-3z" />
  ),
  messageCircle: <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
};

type IconName = keyof typeof icons;

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

// Fades the hero video's edges into the page background (no visible rectangle)
const FADE_X = "linear-gradient(to right, transparent, #000 22%, #000 78%, transparent)";
const FADE_Y = "linear-gradient(to bottom, transparent, #000 12%, #000 85%, transparent)";
const HERO_VIDEO_MASK = {
  maskImage: `${FADE_X}, ${FADE_Y}`,
  maskComposite: "intersect",
  WebkitMaskImage: `${FADE_X}, ${FADE_Y}`,
  WebkitMaskComposite: "source-in",
} as const;

const formatPrice = (price: number) => `RWF ${price.toLocaleString("en-US")}`;

function DishCard({ dish }: { dish: Dish }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-card transition hover:-translate-y-1 hover:shadow-glow">
      <div className="relative aspect-[6/5] overflow-hidden">
        <Image
          src={dish.image}
          alt={dish.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {dish.isNew && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
            NEW
          </span>
        )}
        <button
          type="button"
          aria-label={`Add ${dish.name} to favourites`}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-background/70 text-foreground backdrop-blur transition hover:text-primary"
        >
          <Icon name="heart" className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg leading-tight">{dish.name}</h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">{dish.description}</p>
        <div className="flex flex-wrap gap-1">
          {dish.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          <span className="font-bold text-primary">{formatPrice(dish.price)}</span>
          <Link
            href="/menu"
            className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground transition hover:brightness-110"
          >
            Order Now
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      {/* ───────────── Header ───────────── */}
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="WOW Quick Bites logo"
              width={369}
              height={307}
              preload
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
                aria-current={link.href === "/" ? "page" : undefined}
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

            {/* Mobile menu — <details> keeps this page a Server Component (no JS state needed) */}
            <details className="group relative lg:hidden">
              <summary
                aria-label="Open menu"
                className="grid h-10 w-10 cursor-pointer place-items-center rounded-full hover:bg-primary-foreground/10"
              >
                <Icon name="menu" className="h-6 w-6 group-open:hidden" />
                <Icon name="x" className="hidden h-6 w-6 group-open:block" />
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

      <main className="flex-1">
        {/* ───────────── Hero — light-design layout: text left, video right ───────────── */}
        <section className="relative isolate overflow-hidden bg-black">
          {/* Pure black hero (matches the video), blended into the page background at the bottom */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-b from-transparent to-background" />

          <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:py-16">
            <div className="max-w-xl">
              <h1 className="text-5xl leading-[1.05] sm:text-6xl xl:text-7xl">
                Fresh Food.
                <br />
                <span className="text-primary">Amazing Taste.</span>
                <br />
                WOW Experience.
              </h1>
              <p className="mt-5 max-w-md text-base text-muted-foreground sm:text-lg">
                Enjoy freshly prepared sandwiches, wraps, meals, drinks and desserts made with
                quality ingredients.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/menu"
                  className="rounded-full border-2 border-primary px-6 py-2.5 font-bold text-primary transition hover:bg-primary hover:text-primary-foreground"
                >
                  View Menu
                </Link>
                <Link
                  href="/menu"
                  className="rounded-full bg-primary px-6 py-2.5 font-bold text-primary-foreground shadow-glow transition hover:brightness-110"
                >
                  Order Now
                </Link>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">
                {[
                  { icon: "truck", label: "Fast Delivery" },
                  { icon: "leaf", label: "Fresh Food" },
                  { icon: "shieldCheck", label: "Secure Payment" },
                ].map((item) => (
                  <li key={item.label} className="flex items-center gap-2">
                    <Icon name={item.icon as IconName} className="h-5 w-5 text-primary" />
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Burger video (natural, cropped on the burger, looping), on the same row as the text.
                Edges are faded so it melts into the black. Under the text on mobile. */}
            <div className="relative mx-auto aspect-[720/1024] w-full max-w-md lg:h-[560px] lg:w-auto lg:max-w-none">
              <div className="absolute inset-0" style={HERO_VIDEO_MASK}>
                <Image
                  src="/images/hero-poster.jpg"
                  alt="WOW burger with melted cheese"
                  fill
                  preload
                  sizes="(min-width: 1024px) 400px, 100vw"
                  className="object-contain"
                />
                <video
                  className="motion-video absolute inset-0 h-full w-full object-contain"
                  src="/heroBurger.mp4"
                  poster="/images/hero-poster.jpg"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-hidden="true"
                />
              </div>

            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl space-y-14 px-4 py-12 sm:px-6 md:space-y-20 md:py-16">
          {/* ───────────── Categories ───────────── */}
          <section aria-label="Categories">
            <ul className="grid grid-cols-3 gap-3 sm:gap-4 md:grid-cols-6">
              {categories.map((category) => (
                <li key={category.name}>
                  <Link
                    href={`/menu?category=${category.name}`}
                    className="group flex flex-col items-center gap-2 p-3 outline-none"
                  >
                    <span className="grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground ring-2 ring-primary/0 ring-offset-4 ring-offset-background transition duration-300 ease-out group-hover:-translate-y-1.5 group-hover:shadow-glow group-hover:ring-primary/60 group-focus-visible:ring-primary">
                      <Icon
                        name={category.icon}
                        className="h-7 w-7 transition duration-300 ease-out group-hover:-rotate-12 group-hover:scale-110"
                      />
                    </span>
                    <span className="text-sm font-bold transition-colors group-hover:text-primary">
                      {category.name}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors group-hover:text-primary">
                      Shop Now{" "}
                      <Icon
                        name="arrowRight"
                        className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* ───────────── Offers ───────────── */}
          <section>
            <h2 className="text-3xl sm:text-4xl">Offers &amp; what&apos;s new</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {offers.map((offer) => (
                <Link
                  key={offer.title}
                  href="/menu"
                  className="group relative block h-64 overflow-hidden rounded-2xl"
                >
                  <Image
                    src={offer.image}
                    alt={offer.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                  <div className="absolute bottom-0 p-5">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase text-primary-foreground">
                      {offer.tag}
                    </span>
                    <h3 className="mt-3 text-2xl">{offer.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{offer.text}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* ───────────── Popular Dishes + Ad slot ───────────── */}
          <section>
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-3xl sm:text-4xl">Popular Dishes</h2>
              <Link
                href="/menu"
                className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                See full menu <Icon name="arrowRight" className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {popularDishes.map((dish) => (
                  <DishCard key={dish.name} dish={dish} />
                ))}
              </div>

              {/* Ad space: horizontal banner on small screens, sticky 300×600 skyscraper on desktop */}
              <aside aria-label="Advertisement" className="lg:sticky lg:top-24 lg:self-start">
                <div className="flex h-28 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card text-center text-muted-foreground sm:h-32 lg:h-[600px]">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">
                    Advertisement
                  </span>
                  <span className="mt-1 text-xs">Your ad here</span>
                </div>
              </aside>
            </div>
          </section>

          {/* ───────────── New on the menu ───────────── */}
          <section>
            <h2 className="text-3xl sm:text-4xl">New on the menu</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
              {newDishes.map((dish) => (
                <DishCard key={dish.name} dish={dish} />
              ))}
            </div>
          </section>


          {/* ───────────── Features ───────────── */}
          <section
            aria-label="Why choose us"
            className="grid gap-6 rounded-2xl bg-primary p-6 text-primary-foreground sm:grid-cols-2 sm:p-8 lg:grid-cols-4"
          >
            {features.map((feature) => (
              <div key={feature.title} className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-primary-foreground/30">
                  <Icon name={feature.icon} className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-bold">{feature.title}</p>
                  <p className="text-xs opacity-80">{feature.text}</p>
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>

      {/* ───────────── Footer ───────────── */}
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
              {socials.map((social) => (
                <li key={social.label}>
                  <a href={social.href} aria-label={social.label} className="hover:text-primary">
                    <Icon name={social.icon} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-primary">Quick Links</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/menu" className="hover:text-foreground">
                  Order now
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-primary">Categories</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {categories.map((category) => (
                <li key={category.name}>
                  <Link href={`/menu?category=${category.name}`} className="hover:text-foreground">
                    {category.name}
                  </Link>
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
    </div>
  );
}
