import type { DrinkSection, MenuItem } from "./types";

// Mock menu — will come from the backend API. One entry per item, both languages side by side.
// `id` is also the product URL: /[lang]/menu/[id].

export const drinkSections: DrinkSection[] = [
  { id: "smoothies", name: { en: "Smoothies", fr: "Smoothies" } },
  { id: "milkshakes", name: { en: "Flavorful Milkshakes", fr: "Milkshakes gourmands" } },
  {
    id: "ice-cream",
    name: { en: "WOW Ice Cream Flavors", fr: "Parfums de glaces WOW" },
    note: { en: "Scoop @2000frw", fr: "La boule @2000frw" },
  },
  { id: "mojitos", name: { en: "Mojitos", fr: "Mojitos" } },
  { id: "spiced-tea", name: { en: "WOW Spiced Tea Selection", fr: "Sélection de thés épicés WOW" } },
];

export const menuItems: MenuItem[] = [
  // ───────── Food ─────────
  {
    id: "wow-toasted-burger",
    name: { en: "WOW Toasted Burger", fr: "Burger toasté WOW" },
    description: {
      en: "Juicy grilled beef patty, melted cheddar, lettuce, tomato and house sauce on a toasted bun.",
      fr: "Steak de bœuf grillé et juteux, cheddar fondu, laitue, tomate et sauce maison dans un pain toasté.",
    },
    cartMeta: { en: "Beef · Cheese · Toasted bun", fr: "Bœuf · Fromage · Pain toasté" },
    price: 6000,
    image: "/images/burger.jpg",
    group: "food",
    categories: ["burgers"],
    tags: ["beef", "cheese"],
    pairsWith: "fresh-mint-mojito",
  },
  {
    id: "chips-marinated-chicken-leg",
    name: { en: "Chips & Marinated Chicken Leg", fr: "Frites et cuisse de poulet marinée" },
    description: {
      en: "Herb-marinated grilled chicken leg with crispy chips and garlic dip.",
      fr: "Cuisse de poulet marinée aux herbes et grillée, accompagnée de frites croustillantes et de sauce à l’ail.",
    },
    price: 7000,
    image: "/images/chicken.jpg",
    group: "food",
    categories: ["chicken", "chips"],
    tags: ["chicken", "chips"],
    optionGroups: ["extra-proteins", "leave-out-chicken"],
    pairsWith: "fresh-mint-mojito",
  },
  {
    id: "wow-loaded-fries",
    name: { en: "WOW Loaded Fries (Beef & Chicken)", fr: "Frites garnies WOW (bœuf et poulet)" },
    description: {
      en: "Golden fries loaded with pulled beef, chicken and melted cheese.",
      fr: "Frites dorées généreusement garnies de bœuf effiloché, de poulet et de fromage fondu.",
    },
    price: 6500,
    image: "/images/fries.jpg",
    group: "food",
    categories: ["chips"],
    tags: ["beef", "chicken"],
    isNew: true,
  },
  {
    id: "wow-shawarma-experience",
    name: { en: "WOW Shawarma Experience", fr: "Shawarma WOW" },
    description: {
      en: "Grilled chicken, fresh veggies and creamy garlic sauce wrapped and toasted, served with fries.",
      fr: "Poulet grillé, légumes frais et sauce crémeuse à l’ail dans un wrap toasté, servi avec des frites.",
    },
    price: 5500,
    image: "/images/shawarma.jpg",
    group: "food",
    categories: ["chicken"],
    tags: ["chicken", "wrap"],
  },
  {
    id: "ham-sandwich-fully-loaded",
    name: { en: "Ham Sandwich – Fully Loaded", fr: "Sandwich au jambon généreusement garni" },
    description: {
      en: "Crusty baguette with ham, Swiss cheese, pickles, mustard and fresh greens.",
      fr: "Baguette croustillante garnie de jambon, de fromage suisse, de cornichons, de moutarde et de verdure fraîche.",
    },
    price: 5000,
    image: "/images/ham-sandwich.jpg",
    group: "food",
    categories: [],
    tags: ["ham", "cheese"],
  },
  {
    id: "pepperoni-pizza",
    name: { en: "Pepperoni Pizza", fr: "Pizza au pepperoni" },
    description: {
      en: "Stone-baked pizza with stretchy mozzarella and spicy pepperoni.",
      fr: "Pizza cuite sur pierre, garnie de mozzarella fondante et de pepperoni épicé.",
    },
    price: 9000,
    image: "/images/pizza.jpg",
    group: "food",
    categories: ["pizza"],
    tags: ["pepperoni", "cheese"],
    isNew: true,
  },
  {
    id: "fresh-fruit-mix-brownie",
    name: { en: "Fresh Fruit Mix & Brownie", fr: "Fruits frais assortis et brownie" },
    description: {
      en: "Seasonal fruit bowl with a warm chocolate brownie.",
      fr: "Bol de fruits de saison accompagné d’un brownie au chocolat chaud.",
    },
    price: 4000,
    image: "/images/fruit-brownie.jpg",
    group: "food",
    categories: ["desserts"],
    tags: ["fresh", "sweet"],
  },

  // ───────── Drinks: smoothies ─────────
  {
    id: "strawberry-smoothie",
    name: { en: "Strawberry Smoothie", fr: "Smoothie à la fraise" },
    description: {
      en: "Blended fresh strawberries, smooth and refreshing.",
      fr: "Fraises fraîches mixées, pour une boisson douce et rafraîchissante.",
    },
    price: 5000,
    image: "/images/strawberry-smoothie.jpg",
    group: "drinks",
    section: "smoothies",
    categories: ["drinks"],
    tags: ["fruit", "fresh"],
  },
  {
    // Design shows RWF 3,500 on Home and "All", RWF 5,000 on "Drinks": 3,500 kept until confirmed.
    id: "mango-smoothie",
    name: { en: "Mango Smoothie", fr: "Smoothie à la mangue" },
    description: {
      en: "Ripe mango blended smooth and creamy.",
      fr: "Mangue mûre mixée pour une texture lisse et onctueuse.",
    },
    price: 3500,
    image: "/images/mango.jpg",
    group: "drinks",
    section: "smoothies",
    categories: ["drinks"],
    tags: ["fruit", "fresh"],
  },
  {
    id: "pineapple-smoothie",
    name: { en: "Pineapple Smoothie", fr: "Smoothie à l’ananas" },
    description: {
      en: "Tropical pineapple blended into a refreshing drink.",
      fr: "Ananas tropical mixé pour une boisson rafraîchissante.",
    },
    price: 5000,
    image: "/images/pineapple-smoothie.jpg",
    group: "drinks",
    section: "smoothies",
    categories: ["drinks"],
    tags: ["tropical", "fresh"],
  },
  {
    id: "banana-chocolate-smoothie",
    name: { en: "Banana Chocolate Smoothie", fr: "Smoothie banane-chocolat" },
    description: {
      en: "Creamy banana and rich chocolate blended together.",
      fr: "Un mélange de banane onctueuse et de chocolat intense.",
    },
    price: 5000,
    image: "/images/banana-chocolate-smoothie.jpg",
    group: "drinks",
    section: "smoothies",
    categories: ["drinks"],
    tags: ["sweet", "creamy"],
  },
  {
    id: "mixed-fruits-smoothie",
    name: { en: "Mixed Fruits Smoothie", fr: "Smoothie aux fruits mélangés" },
    description: {
      en: "A vibrant blend of seasonal mixed fruits.",
      fr: "Un mélange haut en couleur de fruits de saison.",
    },
    price: 5000,
    image: "/images/mixed-fruits-smoothie.jpg",
    group: "drinks",
    section: "smoothies",
    categories: ["drinks"],
    tags: ["fruity", "fresh"],
  },

  // ───────── Drinks: milkshakes ─────────
  {
    id: "oreo-chocolate-milkshake",
    name: { en: "Oreo Chocolate Milkshake", fr: "Milkshake chocolat Oreo" },
    description: {
      en: "Thick chocolate shake blended with Oreo, topped with cream.",
      fr: "Milkshake épais au chocolat et aux biscuits Oreo, surmonté de crème.",
    },
    price: 4000,
    image: "/images/milkshake.jpg",
    group: "drinks",
    section: "milkshakes",
    categories: ["drinks", "desserts"],
    tags: ["sweet", "cold"],
    isNew: true,
  },
  {
    id: "chocolate-milkshake",
    name: { en: "Chocolate Milkshake", fr: "Milkshake au chocolat" },
    description: {
      en: "Rich and creamy classic chocolate milkshake.",
      fr: "Un milkshake classique au chocolat, riche et onctueux.",
    },
    price: 5000,
    image: "/images/chocolate-milkshake.jpg",
    group: "drinks",
    section: "milkshakes",
    categories: ["drinks", "desserts"],
    tags: ["sweet", "cold"],
  },
  {
    id: "strawberry-milkshake",
    name: { en: "Strawberry Milkshake", fr: "Milkshake à la fraise" },
    description: {
      en: "Creamy strawberry shake with a sweet fresh taste.",
      fr: "Milkshake onctueux à la fraise, aux saveurs fraîches et sucrées.",
    },
    price: 5000,
    image: "/images/strawberry-milkshake.jpg",
    group: "drinks",
    section: "milkshakes",
    categories: ["drinks", "desserts"],
    tags: ["sweet", "cold"],
  },
  {
    id: "banana-chocolate-milkshake",
    name: { en: "Banana Chocolate Milkshake", fr: "Milkshake banane-chocolat" },
    description: {
      en: "Smooth banana and chocolate blended into a thick shake.",
      fr: "Banane et chocolat mixés en un milkshake épais et velouté.",
    },
    price: 5000,
    image: "/images/banana-chocolate-milkshake.jpg",
    group: "drinks",
    section: "milkshakes",
    categories: ["drinks", "desserts"],
    tags: ["sweet", "creamy"],
  },

  // ───────── Drinks: ice cream ─────────
  {
    id: "vanilla-classic",
    name: { en: "Vanilla Classic", fr: "Vanille classique" },
    description: {
      en: "Smooth, rich and timeless vanilla ice cream.",
      fr: "Une glace à la vanille douce, généreuse et intemporelle.",
    },
    price: 2000,
    image: "/images/vanilla-classic.jpg",
    group: "drinks",
    section: "ice-cream",
    categories: ["drinks", "desserts"],
    tags: ["classic", "cold"],
  },
  {
    id: "butterscotch-crunch",
    name: { en: "Butterscotch Crunch", fr: "Caramel au beurre croustillant" },
    description: {
      en: "Sweet caramel flavor with a buttery crunch.",
      fr: "Une saveur de caramel sucré et des éclats croustillants au beurre.",
    },
    price: 2000,
    image: "/images/butterscotch-crunch.jpg",
    group: "drinks",
    section: "ice-cream",
    categories: ["drinks", "desserts"],
    tags: ["sweet", "crunchy"],
  },
  {
    id: "strawberry-fresh",
    name: { en: "Strawberry Fresh", fr: "Fraîcheur de fraise" },
    description: {
      en: "Light, fruity and refreshing strawberry ice cream.",
      fr: "Une glace à la fraise légère, fruitée et rafraîchissante.",
    },
    price: 2000,
    image: "/images/strawberry-fresh.jpg",
    group: "drinks",
    section: "ice-cream",
    categories: ["drinks", "desserts"],
    tags: ["fruity", "cold"],
  },
  {
    id: "coconut-cream",
    name: { en: "Coconut Cream", fr: "Crème de coco" },
    description: {
      en: "Tropical, creamy and unique coconut ice cream.",
      fr: "Une glace à la noix de coco tropicale, onctueuse et originale.",
    },
    price: 2000,
    image: "/images/coconut-cream.jpg",
    group: "drinks",
    section: "ice-cream",
    categories: ["drinks", "desserts"],
    tags: ["tropical", "creamy"],
  },
  {
    id: "chocolate-delight",
    name: { en: "Chocolate Delight", fr: "Délice au chocolat" },
    description: {
      en: "Deep, rich chocolate indulgence in every scoop.",
      fr: "Un chocolat riche et intense pour un plaisir gourmand à chaque boule.",
    },
    price: 2000,
    image: "/images/chocolate-delight.jpg",
    group: "drinks",
    section: "ice-cream",
    categories: ["drinks", "desserts"],
    tags: ["rich", "cold"],
  },

  // ───────── Drinks: mojitos ─────────
  {
    id: "fresh-mint-mojito",
    name: { en: "Fresh Mint Mojito", fr: "Mojito à la menthe fraîche" },
    description: {
      en: "Crushed ice, fresh mint, lime and soda. Non-alcoholic.",
      fr: "Glace pilée, menthe fraîche, citron vert et soda. Sans alcool.",
    },
    cartMeta: {
      en: "Fresh mint, lime & soda · Non-alcoholic",
      fr: "Menthe fraîche, citron vert et soda · Sans alcool",
    },
    price: 3000,
    image: "/images/mojito.jpg",
    group: "drinks",
    section: "mojitos",
    categories: ["drinks"],
    tags: ["cold", "fresh"],
  },
  {
    id: "classic-mint-mojito",
    name: { en: "Classic Mint Mojito", fr: "Mojito classique à la menthe" },
    description: {
      en: "Classic refreshing mojito with mint and lime.",
      fr: "Mojito classique et rafraîchissant à la menthe et au citron vert.",
    },
    price: 5000,
    image: "/images/classic-mint-mojito.jpg",
    group: "drinks",
    section: "mojitos",
    categories: ["drinks"],
    tags: ["cold", "fresh"],
  },
  {
    id: "passion-fruit-mojito",
    name: { en: "Passion Fruit Mojito", fr: "Mojito au fruit de la passion" },
    description: {
      en: "Tropical passion fruit with mint and sparkling soda.",
      fr: "Fruit de la passion tropical, menthe et soda pétillant.",
    },
    price: 5000,
    image: "/images/passion-fruit-mojito.jpg",
    group: "drinks",
    section: "mojitos",
    categories: ["drinks"],
    tags: ["tropical", "fresh"],
  },
  {
    id: "strawberry-mojito",
    name: { en: "Strawberry Mojito", fr: "Mojito à la fraise" },
    description: {
      en: "Sweet strawberry with mint and fizzy soda.",
      fr: "Fraise sucrée, menthe et soda pétillant.",
    },
    price: 5000,
    image: "/images/strawberry-mojito.jpg",
    group: "drinks",
    section: "mojitos",
    categories: ["drinks"],
    tags: ["sweet", "fresh"],
  },
  {
    id: "green-detox",
    name: { en: "Green Detox", fr: "Détox vert" },
    description: {
      en: "Detoxifying green drink with mint, lime and ginger.",
      fr: "Boisson verte détox à la menthe, au citron vert et au gingembre.",
    },
    price: 5000,
    image: "/images/green-detox.jpg",
    group: "drinks",
    section: "mojitos",
    categories: ["drinks"],
    tags: ["healthy", "fresh"],
  },

  // ───────── Drinks: spiced tea ─────────
  {
    id: "classic-chai",
    name: { en: "Classic Chai", fr: "Chai classique" },
    description: {
      en: "Warm spiced tea with aromatic herbs and spices.",
      fr: "Thé chaud épicé aux herbes et aux épices aromatiques.",
    },
    price: 3500,
    image: "/images/classic-chai.jpg",
    group: "drinks",
    section: "spiced-tea",
    categories: ["drinks"],
    tags: ["hot", "spiced"],
  },
  {
    id: "ginger-tea",
    name: { en: "Ginger Tea", fr: "Thé au gingembre" },
    description: {
      en: "Fresh ginger brewed into a soothing warm tea.",
      fr: "Gingembre frais infusé pour un thé chaud apaisant.",
    },
    price: 3500,
    image: "/images/ginger-tea.jpg",
    group: "drinks",
    section: "spiced-tea",
    categories: ["drinks"],
    tags: ["hot", "spiced"],
  },
  {
    id: "cinnamon-spice-tea",
    name: { en: "Cinnamon Spice Tea", fr: "Thé épicé à la cannelle" },
    description: {
      en: "Aromatic cinnamon and warm spices brewed to perfection.",
      fr: "Cannelle parfumée et épices chaleureuses, infusées à la perfection.",
    },
    price: 3500,
    image: "/images/cinnamon-spice-tea.jpg",
    group: "drinks",
    section: "spiced-tea",
    categories: ["drinks"],
    tags: ["hot", "aromatic"],
  },
  {
    id: "lemon-honey-tea",
    name: { en: "Lemon Honey Tea", fr: "Thé citron-miel" },
    description: {
      en: "Soothing blend of lemon and natural honey in hot tea.",
      fr: "Un mélange apaisant de citron et de miel naturel dans un thé chaud.",
    },
    price: 3500,
    image: "/images/lemon-honey-tea.jpg",
    group: "drinks",
    section: "spiced-tea",
    categories: ["drinks"],
    tags: ["hot", "sweet"],
  },
];

export const getMenuItem = (id: string) => menuItems.find((item) => item.id === id);

const byIds = (ids: string[]) =>
  ids.map(getMenuItem).filter((item): item is MenuItem => Boolean(item));

/** Home page "Popular Dishes", in display order */
export const popularItems = byIds([
  "wow-toasted-burger",
  "chips-marinated-chicken-leg",
  "wow-loaded-fries",
  "pepperoni-pizza",
  "fresh-mint-mojito",
  "mango-smoothie",
]);

export const newItems = menuItems.filter((item) => item.isNew);
