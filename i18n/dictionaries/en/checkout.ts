export const checkout = {
  breadcrumb: "Checkout",
  title: "Checkout",
  subtitle: "Confirm your details, collection and payment preferences.",
  gate: {
    title: "Sign in to check out",
    text: "Your cart is saved. Sign in or create an account to place your order.",
    signIn: "Sign in",
    or: "or",
    guest: "Continue without signing in",
    guestNote: "No account needed: just your name and phone number.",
  },
  guest: {
    kicker: "GUEST ORDER",
    role: "Continue without an account",
    text: "Just add your name and phone number below. The manager calls this number if needed about your order.",
    signIn: "Have an account? Sign in",
    createAccount: "Create an account for a permanent client code",
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
    // dueMobile: "You will receive a {method} payment request of {amount} on your phone.",
    dueMobile: "Pay via {method}, dial 182*1*1 0786156132*{amount} on your phone, Names: Wow Quick Bites",
    //Mobile Money
// Pay via MTN Mobile Money or Airtel Money

// dial 182*1*1 0786156132*money to pay RWF

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
  invalidPhone: "Enter a valid Rwandan mobile number (07X XXX XXXX).",
  orderFailed: "We couldn't place your order. Please try again.",
};

export type CheckoutDict = typeof checkout;
