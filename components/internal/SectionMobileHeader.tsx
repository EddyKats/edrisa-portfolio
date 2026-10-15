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
      className={`sticky top-0 z-40 flex h-[5.5rem] items-center overflow-hidden rounded-b-[1.35rem] px-5 pr-16 split:hidden ${tone.light ? "text-[#2a160c]" : "text-white"} ${item.surfaceClass}`}
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
        className="absolute top-[max(0.5rem,env(safe-area-inset-top,0px))] right-[max(0.75rem,env(safe-area-inset-right,0px))] z-10 grid size-11 place-items-center rounded-full bg-[#f4efe8] text-[#070709] shadow-[0_8px_22px_rgb(28_18_14/0.16)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#070709]"
      >
        <X className="size-5" strokeWidth={1.75} aria-hidden="true" />
      </Link>
    </motion.header>
  );
}
