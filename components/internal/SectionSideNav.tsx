"use client";

import Link from "next/link";
import { ViewTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { NavIcon } from "@/components/icons/NavIcon";
import { internalEase } from "@/components/internal/motion";
import { sectionTone } from "@/components/internal/sectionTone";
import { EdrisaLogo } from "@/components/site/EdrisaLogo";
import { Watermark } from "@/components/site/Watermark";
import { getSectionNeighbors, type NavId } from "@/data/navigation";

export function SectionSideNav({ section }: { section: NavId }) {
  const reduce = useReducedMotion();
  const { current, previous, next } = getSectionNeighbors(section);
  const tone = sectionTone(section);

  return (
    <aside
      aria-label={current.title}
      className="section-side sticky top-[1.125rem] hidden h-[calc(100dvh-2.25rem)] shrink-0 self-start split:block"
    >
      <ViewTransition name={current.transitionName}>
        <motion.div
          className={`relative flex h-full flex-col overflow-hidden rounded-2xl px-6 pt-5 pb-6 ${tone.light ? "text-[#2a160c]" : "text-white"} ${current.surfaceClass}`}
          initial={reduce ? false : { opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: reduce ? 0 : 0.08, ease: internalEase }}
        >
          <Watermark tile={section} />
          <Link
            href="/"
            aria-label="Return to home"
            className={`relative z-10 ml-auto grid size-11 place-items-center rounded-full ${tone.focus}`}
          >
            <X className="size-5" strokeWidth={1.75} aria-hidden="true" />
          </Link>
          <div className="relative z-10 flex flex-1 items-center justify-center py-8">
            <p className={`section-vertical-title${tone.light ? " is-ink" : ""}`}>{current.title}</p>
          </div>
          <div className="relative z-10 mt-auto flex flex-col items-center">
            <NavIcon name={current.icon} className={`size-8 ${tone.icon}`} />
            <div className="relative mx-auto mt-8 mb-8 w-[58%]">
              {tone.light ? (
                <span
                  aria-hidden="true"
                  className="absolute -inset-x-3 -inset-y-2 -z-10 rounded-full bg-[#2e211c]/35 blur-md"
                />
              ) : null}
              <EdrisaLogo className="h-auto w-full" />
            </div>
            <nav
              aria-label="Adjacent sections"
              className={`flex w-full items-center justify-between gap-3 text-xs tracking-wide whitespace-nowrap ${tone.links}`}
            >
              <Link href={previous.href} className={`rounded-sm ${tone.focus}`}>
                <span aria-hidden="true">← </span>
                <span className="sr-only">Previous: </span>
                {previous.title}
              </Link>
              <Link href={next.href} className={`rounded-sm ${tone.focus}`}>
                <span className="sr-only">Next: </span>
                {next.title}
                <span aria-hidden="true"> →</span>
              </Link>
            </nav>
          </div>
        </motion.div>
      </ViewTransition>
    </aside>
  );
}
