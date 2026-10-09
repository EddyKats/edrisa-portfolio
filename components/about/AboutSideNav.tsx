"use client";

import Link from "next/link";
import { ViewTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { Watermark } from "@/components/site/Watermark";
import { NavIcon } from "@/components/icons/NavIcon";
import { getNavItem } from "@/data/navigation";

const aboutSurface = getNavItem("about").surfaceClass;
const ease = [0.22, 1, 0.36, 1] as const;

export function AboutSideNav() {
  const reduce = useReducedMotion();

  return (
    <aside
      aria-label="About"
      className="sticky top-5 hidden h-[calc(100dvh-2.5rem)] w-[13.25rem] shrink-0 self-start split:block"
    >
      <ViewTransition name="section-about">
        <motion.div
          className={`relative flex h-full flex-col overflow-hidden rounded-2xl px-4 pt-4 pb-5 text-white ${aboutSurface}`}
          initial={reduce ? false : { opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: reduce ? 0 : 0.08, ease }}
        >
          <Watermark />
          <Link
            href="/"
            aria-label="Back to home"
            className="relative z-10 ml-auto grid size-11 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <X className="size-5" strokeWidth={1.75} aria-hidden="true" />
          </Link>
          <div className="relative z-10 flex flex-1 items-center justify-center py-6">
            <p className="about-vertical-title">About Edrisa</p>
          </div>
          <div className="relative z-10 mb-8 flex justify-center">
            <NavIcon name="gem" className="size-7 text-white/80" />
          </div>
          <nav aria-label="Adjacent sections" className="relative z-10 flex items-center justify-between gap-2 text-[0.7rem] tracking-wide text-white/70">
            <Link
              href="/portfolio"
              className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              ← Portfolio
            </Link>
            <Link
              href="/services"
              className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Services →
            </Link>
          </nav>
        </motion.div>
      </ViewTransition>
    </aside>
  );
}
