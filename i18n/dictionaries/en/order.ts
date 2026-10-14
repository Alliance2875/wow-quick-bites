// Order confirmation page (step 3).
export const order = {
  breadcrumb: "Order confirmation",
  thanks: "Thanks, {name}. Your order is submitted.",
  meta: "Order {id} · Placed {date} · {fulfilment}",
  dateFormat: "{day} at {time}",
  receiptNote:
    "Submission receipt · This records the moment of checkout, before manager acceptance. Open tracking for the latest status.",
  receiptNoteGuest: "Submission receipt · This records the moment of checkout, before manager acceptance. Keep your order ID.",
  receiptTitle: "Your receipt · {id}",
  receiptMeta: "{items} · Standard menu prices · Amounts in RWF",
  /** Guests have no account: no tracking page or notifications, the manager calls them */
  guestNext: {
    review: {
      title: "Manager reviews your order",
      text: "The manager accepts your order and starts preparing it. If anything needs checking, they call {phone}.",
    },
    ready: {
      title: "We call you when it’s ready",
      text: "Keep your phone nearby: the manager calls {phone} when your order is ready for pickup.",
    },
  },
  next: {
    title: "What happens next",
    review: {
      title: "Manager reviews your order",
      text: "Follow your order for acceptance and preparation updates.",
    },
    ready: {
      title: "Wait for the ready update",
      text: "Check Notifications when your order is marked ready for pickup.",
    },
    collect: {
      title: "Collect and pay",
      text: "Use {id} at pickup. {amount} is due; completion follows confirmed collection and payment.",
    },
  },
  backToMenu: "Back to menu",
  identity: {
    title: "Client & order identity",
    client: "Client",
    clientCode: "Permanent client code",
    orderId: "Order ID",
    note: "Your client code identifies you across all purchases. The order ID identifies this purchase only.",
    guest: "Guest order · no account",
    phone: "Phone",
    guestNote: "Keep your order ID. The manager calls {phone} when your order is ready.",
  },
  payment: {
    title: "Payment & fulfilment",
    pending: "Payment pending",
    fulfilment: "Fulfilment",
    method: "Payment",
    amountDue: "Amount due",
  },
  track: "Track order {id}",
  notifications: "Notifications",
  myOrders: "My orders",
  none: {
    title: "No recent order",
    text: "Place an order from the menu to see its confirmation here.",
  },
};

export type OrderDict = typeof order;
