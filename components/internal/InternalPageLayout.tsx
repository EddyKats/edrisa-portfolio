"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { internalEase } from "@/components/internal/motion";
import { SectionMobileHeader } from "@/components/internal/SectionMobileHeader";
import { SectionSideNav } from "@/components/internal/SectionSideNav";
import type { NavId } from "@/data/navigation";

export function InternalPageLayout({
  section,
  bleed,
  children,
}: {
  section: NavId;
  bleed?: ReactNode;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();

  return (
    <div
      id="internal-page"
      className={`relative flex min-h-dvh flex-col overflow-x-clip text-ink ${bleed ? "bg-transparent" : "bg-[#fffbf3]"}`}
    >
      {bleed}
      <SectionMobileHeader section={section} revealAt={section === "about" ? "about-name" : undefined} />
      <div className="relative z-10 flex flex-1 flex-col split:flex-row split:items-stretch split:gap-8 split:px-5 split:pt-[1.125rem] split:pb-0">
        <motion.main
          className="flex min-w-0 flex-1 flex-col"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: internalEase }}
        >
          {children}
        </motion.main>
        <SectionSideNav section={section} />
      </div>
    </div>
  );
}
