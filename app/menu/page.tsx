"use client";

import { Suspense, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  group: "food" | "drinks";
  section?: string; // only used for drinks
  categories: string[];
  tags: string[];
  isNew?: boolean;
};

const chips = ["Burgers", "Pizza", "Desserts", "Drinks", "Chips", "Chicken"];
const groups = ["All", "Food", "Drinks"] as const;

const groupTitles = {
  All: "Food & Drinks",
  Food: "Delicious Meals",
  Drinks: "Drinks & Beverages",
} as const;

// Order of the sections on the Drinks page
const drinkSections = [
  { name: "Smoothies", note: "" },
  { name: "Flavorful Milkshakes", note: "" },
  { name: "WOW Ice Cream Flavors", note: "Scoop @2000frw" },
  { name: "Mojitos", note: "" },
  { name: "WOW Spiced Tea Selection", note: "" },
];

const menuItems: MenuItem[] = [
  // ───────── Food ─────────
  { id: 1, name: "WOW Toasted Burger", description: "Juicy grilled beef patty, melted cheddar, lettuce, tomato and house sauce on a toasted sesame bun.", price: 6000, image: "/images/burger.jpg", group: "food", categories: ["Burgers"], tags: ["Beef", "Cheese"] },
  { id: 2, name: "Chips & Marinated Chicken Leg", description: "Herb-marinated grilled chicken leg with crispy chips and garlic dip.", price: 7000, image: "/images/chicken.jpg", group: "food", categories: ["Chicken", "Chips"], tags: ["Chicken", "Chips"] },
  { id: 3, name: "WOW Loaded Fries (Beef & Chicken)", description: "Golden fries loaded with pulled beef, chicken and melted cheese.", price: 6500, image: "/images/fries.jpg", group: "food", categories: ["Chips"], tags: ["Beef", "Chicken"], isNew: true },
  { id: 4, name: "WOW Shawarmas Experience", description: "Grilled chicken, fresh veggies and creamy garlic sauce wrapped and toasted.", price: 5500, image: "/images/shawarma.jpg", group: "food", categories: ["Chicken"], tags: ["Chicken", "Wrap"] },
  { id: 5, name: "Ham Sandwich - Fully Loaded", description: "Crusty baguette with ham, Swiss cheese, pickles, mustard and fresh greens.", price: 5000, image: "/images/ham-sandwich.jpg", group: "food", categories: [], tags: ["Ham", "Cheese"] },
  { id: 6, name: "Pepperoni Pizza", description: "Stone-baked pizza with stretchy mozzarella and spicy pepperoni.", price: 9000, image: "/images/pizza.jpg", group: "food", categories: ["Pizza"], tags: ["Pepperoni", "Cheese"], isNew: true },
  { id: 7, name: "Fresh Fruit Mix & Brownie", description: "Seasonal fruit bowl with a warm, fudgy chocolate brownie.", price: 4000, image: "/images/fruit-brownie.jpg", group: "food", categories: ["Desserts"], tags: ["Fruit", "Sweet"] },

  // ───────── Drinks: Smoothies ─────────
  { id: 20, name: "Strawberry Smoothie", description: "Blended fresh strawberries, smooth and refreshing.", price: 5000, image: "/images/strawberry-smoothie.jpg", group: "drinks", section: "Smoothies", categories: ["Drinks"], tags: ["Fruit", "Fresh"] },
  { id: 21, name: "Mango Smoothie", description: "Ripe mango blended smooth and creamy.", price: 5000, image: "/images/mango.jpg", group: "drinks", section: "Smoothies", categories: ["Drinks"], tags: ["Fruit", "Fresh"] },
  { id: 22, name: "Pineapple Smoothie", description: "Tropical pineapple blended into a refreshing drink.", price: 5000, image: "/images/pineapple-smoothie.jpg", group: "drinks", section: "Smoothies", categories: ["Drinks"], tags: ["Tropical", "Fresh"] },
  { id: 23, name: "Banana Chocolate Smoothie", description: "Creamy banana and rich chocolate blended together.", price: 5000, image: "/images/banana-chocolate-smoothie.jpg", group: "drinks", section: "Smoothies", categories: ["Drinks"], tags: ["Sweet", "Creamy"] },
  { id: 24, name: "Mixed Fruits Smoothie", description: "A vibrant blend of seasonal mixed fruits.", price: 5000, image: "/images/mixed-fruits-smoothie.jpg", group: "drinks", section: "Smoothies", categories: ["Drinks"], tags: ["Fruity", "Fresh"] },

  // ───────── Drinks: Milkshakes ─────────
  { id: 30, name: "Oreo Chocolate Milkshake", description: "Thick chocolate shake blended with Oreo, topped with cream.", price: 4000, image: "/images/milkshake.jpg", group: "drinks", section: "Flavorful Milkshakes", categories: ["Drinks", "Desserts"], tags: ["Sweet", "Cold"], isNew: true },
  { id: 31, name: "Chocolate Milkshake", description: "Rich and creamy classic chocolate milkshake.", price: 5000, image: "/images/chocolate-milkshake.jpg", group: "drinks", section: "Flavorful Milkshakes", categories: ["Drinks", "Desserts"], tags: ["Sweet", "Cold"] },
  { id: 32, name: "Strawberry Milkshake", description: "Creamy strawberry shake with a sweet fresh taste.", price: 5000, image: "/images/strawberry-milkshake.jpg", group: "drinks", section: "Flavorful Milkshakes", categories: ["Drinks", "Desserts"], tags: ["Sweet", "Cold"] },
  { id: 33, name: "Banana Chocolate Milkshake", description: "Smooth banana and chocolate blended into a thick shake.", price: 5000, image: "/images/banana-chocolate-milkshake.jpg", group: "drinks", section: "Flavorful Milkshakes", categories: ["Drinks", "Desserts"], tags: ["Sweet", "Creamy"] },

  // ───────── Drinks: Ice cream ─────────
  { id: 40, name: "Vanilla Classic", description: "Smooth, rich and timeless vanilla ice cream.", price: 2000, image: "/images/vanilla.jpg", group: "drinks", section: "WOW Ice Cream Flavors", categories: ["Drinks", "Desserts"], tags: ["Classic", "Cold"] },
  { id: 41, name: "Butterscotch Crunch", description: "Sweet caramel flavor with a buttery crunch.", price: 2000, image: "/images/butterscotch.jpg", group: "drinks", section: "WOW Ice Cream Flavors", categories: ["Drinks", "Desserts"], tags: ["Sweet", "Crunchy"] },
  { id: 42, name: "Strawberry Fresh", description: "Light, fruity and refreshing strawberry ice cream.", price: 2000, image: "/images/strawberry-icecream.jpg", group: "drinks", section: "WOW Ice Cream Flavors", categories: ["Drinks", "Desserts"], tags: ["Fruity", "Cold"] },
  { id: 43, name: "Coconut Cream", description: "Tropical, creamy and unique coconut ice cream.", price: 2000, image: "/images/coconut.jpg", group: "drinks", section: "WOW Ice Cream Flavors", categories: ["Drinks", "Desserts"], tags: ["Tropical", "Creamy"] },
  { id: 44, name: "Chocolate Delight", description: "Deep, rich chocolate indulgence in every scoop.", price: 2000, image: "/images/chocolate-delight.jpg", group: "drinks", section: "WOW Ice Cream Flavors", categories: ["Drinks", "Desserts"], tags: ["Rich", "Cold"] },

  // ───────── Drinks: Mojitos ─────────
  { id: 50, name: "Fresh Mint Mojito", description: "Crushed ice, fresh mint, lime and soda. Non-alcoholic.", price: 3000, image: "/images/mojito.jpg", group: "drinks", section: "Mojitos", categories: ["Drinks"], tags: ["Cold", "Fresh"] },
  { id: 51, name: "Classic Mint Mojito", description: "Classic refreshing mojito with mint and lime.", price: 5000, image: "/images/classic-mojito.jpg", group: "drinks", section: "Mojitos", categories: ["Drinks"], tags: ["Cold", "Fresh"] },
  { id: 52, name: "Passion Fruit Mojito", description: "Tropical passion fruit with mint and sparkling soda.", price: 5000, image: "/images/passion-mojito.jpg", group: "drinks", section: "Mojitos", categories: ["Drinks"], tags: ["Tropical", "Fresh"] },
  { id: 53, name: "Strawberry Mojito", description: "Sweet strawberry with mint and fizzy soda.", price: 5000, image: "/images/strawberry-mojito.jpg", group: "drinks", section: "Mojitos", categories: ["Drinks"], tags: ["Sweet", "Fresh"] },
  { id: 54, name: "Green Detox", description: "Detoxifying green drink with mint, lime and ginger.", price: 5000, image: "/images/green-detox.jpg", group: "drinks", section: "Mojitos", categories: ["Drinks"], tags: ["Healthy", "Fresh"] },

  // ───────── Drinks: Spiced tea ─────────
  { id: 60, name: "Classic Chai", description: "Warm spiced tea with aromatic herbs and spices.", price: 3500, image: "/images/chai.jpg", group: "drinks", section: "WOW Spiced Tea Selection", categories: ["Drinks"], tags: ["Hot", "Spiced"] },
  { id: 61, name: "Ginger Tea", description: "Fresh ginger brewed into a soothing warm tea.", price: 3500, image: "/images/ginger-tea.jpg", group: "drinks", section: "WOW Spiced Tea Selection", categories: ["Drinks"], tags: ["Hot", "Spiced"] },
  { id: 62, name: "Cinnamon Spice Tea", description: "Aromatic cinnamon and warm spices brewed to perfection.", price: 3500, image: "/images/cinnamon-tea.jpg", group: "drinks", section: "WOW Spiced Tea Selection", categories: ["Drinks"], tags: ["Hot", "Aromatic"] },
  { id: 63, name: "Lemon Honey Tea", description: "Soothing blend of lemon and natural honey in hot tea.", price: 3500, image: "/images/lemon-honey-tea.jpg", group: "drinks", section: "WOW Spiced Tea Selection", categories: ["Drinks"], tags: ["Hot", "Sweet"] },
];

const formatPrice = (price: number) => `RWF ${price.toLocaleString("en-US")}`;

// One dish card (kept in this file so the menu stays in a single page)
function Card({ item }: { item: MenuItem }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-card transition hover:-translate-y-1 hover:shadow-glow">
      <div className="relative aspect-[6/5] overflow-hidden">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {item.isNew && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
            NEW
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg leading-tight">{item.name}</h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
        <div className="flex flex-wrap gap-1">
          {item.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          <span className="font-bold">{formatPrice(item.price)}</span>
          <button
            type="button"
            className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground transition hover:brightness-110"
          >
            Order Now
          </button>
        </div>
      </div>
    </article>
  );
}

function MenuContent() {
  // Lets links like /menu?category=Pizza (from the home page) open with that filter on
  const params = useSearchParams();
  const initial = params.get("category");

  const [group, setGroup] = useState<(typeof groups)[number]>("All");
  const [chip, setChip] = useState<string | null>(initial && chips.includes(initial) ? initial : null);
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return menuItems.filter((item) => {
      if (group !== "All" && item.group !== group.toLowerCase()) return false;
      if (chip && !item.categories.includes(chip)) return false;
      if (q && !`${item.name} ${item.description} ${item.tags.join(" ")}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [group, chip, query]);

  return (
    <>
      <h1 className="text-center text-4xl sm:text-5xl">Menu</h1>

      {/* Filters */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {groups.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGroup(g)}
              aria-pressed={group === g}
              className={`rounded-full px-5 py-1.5 text-sm font-bold transition ${
                group === g ? "bg-primary text-primary-foreground" : "bg-secondary text-primary hover:brightness-125"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <h2 className="order-first w-full text-center text-xl text-primary md:order-none md:w-auto">
          {groupTitles[group]}
        </h2>

        <label className="flex w-full items-center gap-2 rounded-full bg-card px-4 py-2 md:w-64">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for food or drink..."
            aria-label="Search the menu"
            className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>

      {/* Category chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setChip(chip === c ? null : c)}
            aria-pressed={chip === c}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              chip === c
                ? "border-primary bg-primary font-bold text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Results */}
      {items.length === 0 ? (
        <p className="mt-16 text-center text-muted-foreground">
          No items match your search. Try another word or clear the filters.
        </p>
      ) : group === "Drinks" ? (
        // Drinks: all sections on one page, each with a title and a line
        <div className="mt-8 space-y-10">
          {drinkSections.map((section) => {
            const sectionItems = items.filter((i) => i.section === section.name);
            if (sectionItems.length === 0) return null;
            return (
              <section key={section.name} aria-label={section.name}>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl text-primary">{section.name}</h3>
                  {section.note && <span className="text-xs text-muted-foreground">{section.note}</span>}
                  <div className="h-px flex-1 bg-primary/30" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {sectionItems.map((item) => (
                    <Card key={item.id} item={item} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        // All / Food: one normal grid
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {items.map((item) => (
            <Card key={item.id} item={item} />
          ))}
        </div>
      )}
    </>
  );
}

export default function MenuPage() {
  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <SiteHeader current="/menu" />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 md:py-14">
        {/* Suspense is required by Next.js when a page reads the URL query (useSearchParams) */}
        <Suspense fallback={null}>
          <MenuContent />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}