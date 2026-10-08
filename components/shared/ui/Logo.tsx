import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/format";

export default function Logo({
  href,
  brand,
  size = "md",
  preload = false,
}: {
  href: string;
  brand: string;
  size?: "md" | "lg";
  preload?: boolean;
}) {
  return (
    <Link href={href} className="flex shrink-0 items-center gap-2.5">
      <Image
        src="/logo.png"
        alt={`${brand} logo`}
        width={369}
        height={307}
        sizes="80px"
        preload={preload}
        className={cn(
          "w-auto drop-shadow-[0_2px_0.25rem_rgb(0_0_0/0.45)]",
          size === "md" ? "h-11 sm:h-12" : "h-12",
        )}
      />
      <span className={cn("whitespace-nowrap font-extrabold", size === "md" ? "hidden text-lg sm:inline" : "text-lg")}>
        {brand}
      </span>
    </Link>
  );
}
