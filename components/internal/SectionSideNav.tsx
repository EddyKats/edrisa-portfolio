"use client";

import Link from "next/link";
import { ViewTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { NavIcon } from "@/components/icons/NavIcon";
import { internalEase } from "@/components/internal/motion";
import { EdrisaLogo } from "@/components/site/EdrisaLogo";
import { Watermark } from "@/components/site/Watermark";
import { getSectionNeighbors, type NavId } from "@/data/navigation";

const sidebarTitleArt: Record<NavId, { src: string; ratio: string }> = {
  portfolio: { src: "/images/homepage-titles/selected-works.svg", ratio: "685.95 / 220" },
  about: { src: "/images/homepage-titles/about-edrisa.svg", ratio: "491.46 / 220" },
  services: { src: "/images/homepage-titles/what-i-do.svg", ratio: "390.9 / 220" },
  contact: { src: "/images/homepage-titles/talk-to-me.svg", ratio: "439.78 / 220" },
};

export function SectionSideNav({ section }: { section: NavId }) {
  const reduce = useReducedMotion();
  const { current, previous, next } = getSectionNeighbors(section);
  const focus =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

  return (
    <aside
      aria-label={current.title}
      className="section-side sticky top-[1.125rem] hidden h-[calc(100dvh-2.25rem)] shrink-0 self-start split:block"
    >
      <ViewTransition name={current.transitionName}>
        <motion.div
          className={`relative flex h-full flex-col overflow-hidden rounded-2xl px-6 pt-5 pb-6 text-white ${current.surfaceClass}`}
          initial={reduce ? false : { opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: reduce ? 0 : 0.08, ease: internalEase }}
        >
          <Watermark tile={section} />
          <Watermark tile={section} className="nav-mark section-works-mark" />
          <div className="relative z-10 flex items-center justify-between gap-3">
            <p className="sidebar-edge-inset text-base font-semibold tracking-[0.22em] uppercase">
              {current.title}
            </p>
            <Link
              href="/"
              aria-label="Return to home"
              className={`grid size-11 shrink-0 place-items-center rounded-full ${focus}`}
            >
              <X className="size-5" strokeWidth={1.75} aria-hidden="true" />
            </Link>
          </div>
          <div className="sidebar-signature-zone pointer-events-none relative z-10 flex min-h-0 flex-1 items-center justify-center overflow-hidden">
            <EdrisaLogo className="sidebar-signature opacity-65" />
          </div>
          <div className="relative z-10 mt-auto flex flex-col items-center">
            <div className="sidebar-edge-inset relative z-10 mb-8 w-full">
              <div className="relative z-10 flex flex-col items-start gap-3">
                <NavIcon name={current.icon} className="size-12 text-white/80" />
                <span
                  aria-hidden="true"
                  className="sidebar-title-art block w-[62%] bg-contain bg-left bg-no-repeat"
                  style={{
                    aspectRatio: sidebarTitleArt[section].ratio,
                    backgroundImage: `url(${sidebarTitleArt[section].src})`,
                  }}
                />
              </div>
            </div>
            <nav
              aria-label="Adjacent sections"
              className="w-full border-t border-white/28 pt-5 text-white/70"
            >
              <div className="flex items-center justify-between gap-4">
                <Link
                  href={previous.href}
                  aria-label={`Previous: ${previous.title}`}
                  className={`inline-flex min-h-12 items-center gap-1 text-base font-semibold tracking-tight ${focus}`}
                >
                  <ChevronLeft className="size-5 shrink-0" strokeWidth={2} aria-hidden="true" />
                  {previous.title}
                </Link>
                <Link
                  href={next.href}
                  aria-label={`Next: ${next.title}`}
                  className={`inline-flex min-h-12 items-center gap-1 text-base font-semibold tracking-tight ${focus}`}
                >
                  {next.title}
                  <ChevronRight className="size-5 shrink-0" strokeWidth={2} aria-hidden="true" />
                </Link>
              </div>
            </nav>
          </div>
        </motion.div>
      </ViewTransition>
    </aside>
  );
}
