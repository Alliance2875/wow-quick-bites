"use client";

import Image from "next/image";
import { useState } from "react";
import Icon from "@/components/shared/ui/Icon";
import { cn } from "@/lib/format";

/**
 * Dashed drop zone with the current photo: drag an image in or choose a file.
 * The file stays a local preview (object URL) until the backend stores uploads.
 */
export default function ImageDrop({
  image,
  alt,
  title,
  labels,
  onImage,
}: {
  image: string;
  alt: string;
  title: string;
  labels: { drop: string; upload: string };
  onImage: (url: string) => void;
}) {
  const [over, setOver] = useState(false);

  const take = (file?: File) => {
    if (file && file.type.startsWith("image/")) onImage(URL.createObjectURL(file));
  };

  return (
    <label
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        take(event.dataTransfer.files[0]);
      }}
      className={cn(
        "flex cursor-pointer items-center gap-4 rounded-lg border border-dashed bg-field p-3 transition",
        over ? "border-primary" : "border-border hover:border-primary/60",
      )}
    >
      <Image
        src={image}
        alt={alt}
        width={136}
        height={136}
        sizes="68px"
        unoptimized={image.startsWith("blob:")}
        className="h-[4.25rem] w-[4.25rem] shrink-0 rounded-md object-cover"
      />
      <span className="min-w-0">
        <span className="block text-[0.8125rem] font-semibold">{title}</span>
        <span className="mt-1 block text-[0.6875rem] text-muted-foreground">{labels.drop}</span>
        <span className="mt-1 flex items-center gap-1 text-[0.6875rem] font-semibold text-accent">
          <Icon name="arrowUp" className="h-3 w-3" strokeWidth={2.5} /> {labels.upload}
        </span>
      </span>
      <input type="file" accept="image/*" className="sr-only" onChange={(event) => take(event.target.files?.[0])} />
    </label>
  );
}
