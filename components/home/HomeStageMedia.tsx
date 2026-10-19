"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { HomeFrame, HomeMediaMode } from "@/lib/content/home-surfaces";

const ease = [0.22, 1, 0.36, 1] as const;

export function HomeStageMedia({
  frames,
  mode,
  alt,
  sizes,
  objectClass = "object-cover",
  priority = false,
}: {
  frames: HomeFrame[];
  mode: HomeMediaMode;
  alt: string;
  sizes: string;
  objectClass?: string;
  priority?: boolean;
}) {
  const reduce = useReducedMotion();
  const rotating = !reduce && mode === "sequence" && frames.length > 1;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [frames.map((frame) => frame.src).join("|")]);

  useEffect(() => {
    if (!rotating) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % frames.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [frames.length, rotating]);

  if (frames.length === 0) return null;

  return (
    <>
      {frames.map((frame, position) => {
        const visible = position === index;
        return (
          <motion.div
            key={`${frame.src}-${position}`}
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: visible ? 1 : 0 }}
            transition={{ duration: rotating ? 0.9 : 0.6, ease }}
          >
            {frame.kind === "VIDEO" ? (
              <HomeVideo src={frame.src} alt={alt} play={visible} className={objectClass} />
            ) : (
              <Image
                src={frame.src}
                alt={alt}
                fill
                priority={priority && position === 0}
                quality={90}
                sizes={sizes}
                unoptimized={frame.kind === "GIF"}
                className={objectClass}
              />
            )}
          </motion.div>
        );
      })}
    </>
  );
}

function HomeVideo({
  src,
  alt,
  play,
  className,
}: {
  src: string;
  alt: string;
  play: boolean;
  className: string;
}) {
  const node = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = node.current;
    if (!video) return;
    if (play) {
      void video.play().catch(() => undefined);
      return;
    }
    video.pause();
  }, [play, src]);

  return (
    <video
      ref={node}
      src={src}
      aria-label={alt}
      muted
      loop
      playsInline
      autoPlay={play}
      preload="metadata"
      className={`h-full w-full ${className}`}
    />
  );
}
