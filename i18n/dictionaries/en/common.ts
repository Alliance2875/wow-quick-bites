// Shared UI strings: header, footer, dish cards, generic buttons.
export const common = {
  brand: "WOW Quick Bites",
  nav: {
    home: "Home",
    menu: "Menu",
    about: "About Us",
    contact: "Contact Us",
  },
  header: {
    orderNow: "Order Now",
    signIn: "Sign in",
    account: "My account",
    signOut: "Sign out",
    cart: "Cart",
    openMenu: "Open menu",
    themeDark: "Dark theme",
    themeLight: "Light theme",
    language: "Language",
  },
  footer: {
    tagline: "Fresh flavours made with love.",
    followUs: "Follow Us",
    quickLinks: "Quick Links",
    orderNow: "Order now",
    categories: "Categories",
    owner: "Owner",
    rights: "All rights reserved.",
  },
  dish: {
    orderNow: "Order Now",
    isNew: "NEW",
    addToFavourites: "Add {name} to favourites",
  },
  options: {
    optional: "Optional",
    specialInstructions: "Special instructions",
    specialPlaceholder: "e.g. allergies, extra spicy...",
    total: "Total:",
    addToCart: "Add to cart",
    close: "Close",
    decrease: "Decrease quantity",
    increase: "Increase quantity",
    quantity: "Quantity",
  },
  notFound: {
    title: "Page not found",
    text: "The page you are looking for does not exist.",
    back: "Back to home",
  },
};

export type CommonDict = typeof common;
