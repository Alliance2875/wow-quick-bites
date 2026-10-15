// Cart, checkout and confirmation share the step indicator and the order summary.
export const cart = {
  breadcrumb: "Cart",
  title: "Your cart",
  subtitle: "Review your items before checkout.",
  steps: {
    label: "Order progress",
    cart: "Your cart",
    checkout: "Checkout",
    confirmation: "Confirmation",
  },
  addMore: "Add more items",
  empty: "Your cart is empty.",
  priceLoadError: "We couldn't load current menu prices. Please try again.",
  browseMenu: "Browse menu",
  itemsTitle: "Items in your cart",
  itemCount: { one: "{count} item", other: "{count} items" },
  each: "{price} each",
  remove: "Remove",
  continueShopping: "Continue shopping",
  summary: {
    title: "Order summary",
    meta: "{items} · Standard menu prices",
    subtotal: "Subtotal",
    fees: "Additional fees",
    total: "Total",
  },
  proceed: "Proceed to checkout",
  proceedHelper: "Choose pickup or delivery and your payment method in the next step.",
  shoppingAs: "Shopping as {name}",
  clientCode: "Permanent client code: {code}. One code for all your purchases.",
};

export type CartDict = typeof cart;
