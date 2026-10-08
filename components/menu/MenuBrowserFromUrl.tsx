"use client";

import { useSearchParams } from "next/navigation";
import { categories } from "@/data/categories";
import MenuBrowser from "./MenuBrowser";

type Props = Omit<React.ComponentProps<typeof MenuBrowser>, "initialCategory">;

/**
 * Reads ?category= (links from the home page and the footer) on the client, so the menu page
 * itself stays static and cached. Remounts when the category in the URL changes.
 */
export default function MenuBrowserFromUrl(props: Props) {
  const param = useSearchParams().get("category")?.toLowerCase();
  const category = categories.find((c) => c.id === param)?.id ?? null;
  return <MenuBrowser key={category ?? "all"} {...props} initialCategory={category} />;
}
