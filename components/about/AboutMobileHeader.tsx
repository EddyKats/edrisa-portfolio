"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { Watermark } from "@/components/site/Watermark";
import { getNavItem } from "@/data/navigation";

const aboutSurface = getNavItem("about").surfaceClass;
const ease = [0.22, 1, 0.36, 1] as const;

export function AboutMobileHeader() {
  const reduce = useReducedMotion();

  return (
    <motion.header
      className={`relative flex h-[5.5rem] items-center justify-between overflow-hidden px-5 text-white split:hidden ${aboutSurface}`}
      initial={reduce ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease }}
    >
      <Watermark />
      <p className="relative z-10 text-sm font-semibold tracking-[0.18em]">ABOUT EDRISA</p>
      <Link
        href="/"
        aria-label="Back to home"
        className="relative z-10 grid size-11 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <X className="size-5" strokeWidth={1.75} aria-hidden="true" />
      </Link>
    </motion.header>
  );
}
