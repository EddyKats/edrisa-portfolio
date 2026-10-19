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
    <div id="internal-page" className="relative min-h-dvh bg-[#f6f3ef] text-ink">
      {bleed}
      <SectionMobileHeader section={section} />
      <div className="relative z-10 split:flex split:items-start split:gap-8 split:px-5 split:py-[1.125rem]">
        <motion.main
          className="min-w-0 flex-1"
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
