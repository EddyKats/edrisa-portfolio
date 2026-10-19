"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { PublicSite } from "@/lib/content/site-shape";

const ease = [0.22, 1, 0.36, 1] as const;

export function HeroPanel({ site }: { site: PublicSite }) {
  const reduce = useReducedMotion();
  const frames = site.portraits.length > 0 ? site.portraits : [site.portraitSrc];
  const rotating = !reduce && site.portraitMode === "sequence" && frames.length > 1;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!rotating) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % frames.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [frames.length, rotating]);

  return (
    <section
      aria-labelledby="home-logo"
      className="home-hero @container relative isolate bg-[linear-gradient(180deg,#51392f_0%,#442f28_58%,#2e211c_100%)]"
    >
      <div className="absolute inset-0">
        {frames.map((src, frame) => (
          <motion.div
            key={`${src}-${frame}`}
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: frame === index ? 1 : 0 }}
            transition={{ duration: rotating ? 0.9 : 0.6, ease }}
          >
            <Image
              src={src}
              alt="Portrait of Edrisa"
              fill
              priority={frame === 0}
              quality={90}
              sizes="(min-width: 960px) 50vw, 100vw"
              className="object-cover object-[center_top]"
            />
          </motion.div>
        ))}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[42%] bg-[linear-gradient(to_top,#000_0%,rgb(0_0_0/0.82)_22%,rgb(0_0_0/0.42)_58%,transparent_100%)]"
      />

      <motion.div
        className="home-logo absolute bottom-[3.2%] z-10 w-[88%]"
        initial={reduce ? false : { opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: reduce ? 0 : 0.12, ease }}
      >
        <h1 id="home-logo" className="m-0">
          <Image
            src={site.logoSrc}
            alt="Edrisa"
            width={site.logoWidth}
            height={site.logoHeight}
            priority
            quality={90}
            sizes="(min-width: 960px) 44vw, 88vw"
            className="h-auto w-full"
            style={{ width: "100%", height: "auto" }}
          />
        </h1>
      </motion.div>
    </section>
  );
}
