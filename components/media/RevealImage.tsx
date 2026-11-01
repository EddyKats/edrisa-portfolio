"use client";

import { ProtectedImage } from "@/components/media/protect-visual";
import type { ImageProps } from "next/image";

export function RevealImage({ className = "", priority, loading, alt, ...props }: ImageProps) {
  const image = (
    <ProtectedImage
      {...props}
      alt={alt}
      priority={priority}
      loading={priority ? undefined : loading ?? "lazy"}
      className={className}
    />
  );
  if (priority || !props.fill) return image;

  return <span className="photo-in absolute inset-0">{image}</span>;
}
