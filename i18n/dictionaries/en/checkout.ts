export const checkout = {
  breadcrumb: "Checkout",
  title: "Checkout",
  subtitle: "Confirm your details, collection and payment preferences.",
  gate: {
    title: "Sign in to check out",
    text: "Your cart is saved. Sign in or create an account to place your order.",
    signIn: "Sign in",
  },
  account: {
    kicker: "SIGNED-IN ACCOUNT",
    role: "Client",
    codeKicker: "PERMANENT CLIENT CODE",
    codeHelp: "One code for all your purchases.",
  },
  contact: {
    title: "Customer contact",
    fullName: "Full name",
    phone: "Phone number",
    phonePlaceholder: "07X XXX XXXX",
    email: "Email",
    emailPlaceholder: "Enter your email address",
  },
  fulfilment: {
    title: "How would you like your order?",
    pickupHelp: "Collect your order when the manager confirms it is ready. Pickup time is not yet confirmed.",
    deliveryHelp: "We deliver to the address below once the manager accepts your order.",
    address: "Delivery address",
    addressPlaceholder: "District, street, house number",
  },
  payment: {
    title: "Payment",
    dueOnPickup: "{amount} will be due when you collect your order.",
    dueMobile: "You will receive a {method} payment request of {amount} on your phone.",
  },
  notes: {
    title: "Order notes",
    label: "Notes (optional)",
    placeholder: "Anything you'd like us to know about your order?",
  },
  sidebar: {
    title: "Your order",
    meta: "{items} · Amounts in RWF",
    editCart: "Edit cart",
    pendingNote: "Payment is pending until it is confirmed at collection.",
    placeOrder: "Place order · {amount}",
    helper:
      "Review your contact details before placing your order. Follow acceptance and readiness in your account.",
    backToCart: "Back to cart",
  },
  required: "Please fill in your name and phone number.",
};

export type CheckoutDict = typeof checkout;
