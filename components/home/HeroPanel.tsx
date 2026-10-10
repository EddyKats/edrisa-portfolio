"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { SocialLinks } from "@/components/home/SocialLinks";
import type { PublicSite } from "@/lib/content/site-shape";

const ease = [0.22, 1, 0.36, 1] as const;

export function HeroPanel({ site }: { site: PublicSite }) {
  const reduce = useReducedMotion();

  return (
    <section
      aria-labelledby="home-logo"
      className="home-hero @container relative isolate bg-[linear-gradient(180deg,#51392f_0%,#442f28_58%,#2e211c_100%)]"
    >
      <motion.div
        className="absolute inset-0"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
      >
        <Image
          src={site.portraitSrc}
          alt="Portrait of Edrisa"
          fill
          priority
          quality={90}
          sizes="(min-width: 960px) 50vw, 100vw"
          className="object-cover object-[center_top]"
        />
      </motion.div>

        <SocialLinks profiles={site.socials} />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[34%] bg-gradient-to-t from-[#2e211c]/70 via-[#2e211c]/25 to-transparent"
      />

      <motion.div
        className="absolute bottom-[3.2%] left-[4%] z-10 w-[88%]"
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
