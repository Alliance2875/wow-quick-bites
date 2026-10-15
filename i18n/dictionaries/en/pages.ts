// About and Contact pages (small, static content).
export const about = {
  metaTitle: "About Us",
  title: "Healthy choices,",
  titleAccent: "delivered",
  paragraphs: [
    "WOW Quick Bites prepares fresh sandwiches, wraps, burgers, pizza, desserts and drinks every day with quality ingredients. Order online for delivery to your door, or pick up on your way.",
    "Owned and run by Rwasibo Alexis Junior.",
  ],
  imageAlt: "Fresh fruit bowl with a chocolate brownie",
};

export const contact = {
  metaTitle: "Contact Us",
  title: "Contact Us",
  phone: "Phone",
  email: "Email",
  location: "Location",
  hours: "Hours",
  loadError: "Business contact details could not be loaded.",
  noDetails: "Contact details are not available yet.",
};

export type AboutDict = typeof about;
export type ContactDict = typeof contact;
