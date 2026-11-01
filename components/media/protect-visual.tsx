"use client";

import type { DragEvent, MouseEvent } from "react";
import Image, { type ImageProps } from "next/image";

export function stopVisualGrab(event: DragEvent | MouseEvent) {
  event.preventDefault();
}

export const visualProtection = {
  draggable: false as const,
  onDragStart: (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
  },
  onContextMenu: (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
  },
};

export function ProtectedImage({ className = "", alt, ...props }: ImageProps) {
  return <Image {...props} {...visualProtection} alt={alt} className={`select-none ${className}`} />;
}
