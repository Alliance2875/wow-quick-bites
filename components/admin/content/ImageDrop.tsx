"use client";

import Image from "next/image";
import { useState } from "react";
import Icon from "@/components/shared/ui/Icon";
import { cn } from "@/lib/format";
import { useUploadImageMutation } from "@/lib/redux/api/adminApi";

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
  labels: { drop: string; upload: string; uploading: string; uploadError: string; invalid: string };
  onImage: (url: string, imageId: string) => void;
}) {
  const [over, setOver] = useState(false);
  const [error, setError] = useState<"upload" | "invalid" | null>(null);
  const [upload, { isLoading }] = useUploadImageMutation();

  const take = async (file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError("invalid");
      return;
    }
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const result = await upload(formData).unwrap();
      onImage(result.url, result.imageId);
    } catch {
      setError("upload");
    }
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
      {image ? (
        <Image src={image} alt={alt} width={136} height={136} sizes="68px" className="h-[4.25rem] w-[4.25rem] shrink-0 rounded-md object-cover" />
      ) : (
        <span aria-hidden="true" className="h-[4.25rem] w-[4.25rem] shrink-0 rounded-md bg-panel-muted" />
      )}
      <span className="min-w-0">
        <span className="block text-[0.8125rem] font-semibold">{title}</span>
        <span className="mt-1 block text-[0.6875rem] text-muted-foreground">{labels.drop}</span>
        <span className="mt-1 flex items-center gap-1 text-[0.6875rem] font-semibold text-accent">
          <Icon name="arrowUp" className="h-3 w-3" strokeWidth={2.5} /> {isLoading ? labels.uploading : labels.upload}
        </span>
        {error && <span role="alert" className="mt-1 block text-[0.6875rem] text-critical">{error === "upload" ? labels.uploadError : labels.invalid}</span>}
      </span>
      <input type="file" accept="image/jpeg,image/png,image/webp" disabled={isLoading} className="sr-only" onChange={(event) => void take(event.target.files?.[0])} />
    </label>
  );
}
