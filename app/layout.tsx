import type { Metadata } from "next";
import { Caveat, DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
});

// Handwritten accent ("Fresh & Tasty") from the light design
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: "600",
});

export const metadata: Metadata = {
  title: "WOW Quick Bites",
  description:
    "Fresh food, amazing taste, WOW experience. Sandwiches, wraps, meals, drinks and desserts made with quality ingredients.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${dmSerif.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
