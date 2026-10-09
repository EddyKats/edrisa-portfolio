"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { internalEase } from "@/components/internal/motion";
import { sectionTone } from "@/components/internal/sectionTone";
import { Watermark } from "@/components/site/Watermark";
import { getNavItem, type NavId } from "@/data/navigation";

export function SectionMobileHeader({ section }: { section: NavId }) {
  const reduce = useReducedMotion();
  const item = getNavItem(section);
  const tone = sectionTone(section);

  return (
    <motion.header
      className={`relative flex h-[5.5rem] items-center justify-between overflow-hidden px-5 split:hidden ${tone.light ? "text-[#2a160c]" : "text-white"} ${item.surfaceClass}`}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: internalEase }}
    >
      <Watermark tile={section} />
      <p className={`relative z-10 text-sm font-semibold tracking-[0.18em] uppercase ${tone.label}`}>
        {item.title}
      </p>
      <Link
        href="/"
        aria-label="Return to home"
        className={`relative z-10 grid size-11 place-items-center rounded-full ${tone.focus}`}
      >
        <X className="size-5" strokeWidth={1.75} aria-hidden="true" />
      </Link>
    </motion.header>
  );
}
