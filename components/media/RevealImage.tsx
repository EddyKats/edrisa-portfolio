"use client";

import Image, { type ImageProps } from "next/image";

export function RevealImage({ className = "", priority, alt, ...props }: ImageProps) {
  const image = <Image {...props} alt={alt} priority={priority} loading={priority ? undefined : "lazy"} className={className} />;
  if (priority || !props.fill) return image;

  return <span className="photo-in absolute inset-0">{image}</span>;
}
