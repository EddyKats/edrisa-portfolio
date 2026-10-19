"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { internalEase } from "@/components/internal/motion";
import { sectionTone } from "@/components/internal/sectionTone";
import { Watermark } from "@/components/site/Watermark";
import { getNavItem, type NavId } from "@/data/navigation";

export function SectionMobileHeader({
  section,
  revealAt,
}: {
  section: NavId;
  revealAt?: string;
}) {
  const reduce = useReducedMotion();
  const item = getNavItem(section);
  const tone = sectionTone(section);
  const [open, setOpen] = useState(!revealAt);

  useEffect(() => {
    if (!revealAt) return;

    const update = () => {
      const target = document.getElementById(revealAt);
      if (!target) return;
      setOpen(target.getBoundingClientRect().top <= 88);
    };

    update();
    const frame = window.requestAnimationFrame(update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [revealAt]);

  return (
    <>
      {revealAt && !open ? (
        <Link
          href="/"
          aria-label="Return to home"
          className="fixed top-[max(0.9rem,env(safe-area-inset-top,0px))] right-5 z-40 grid size-11 place-items-center rounded-full bg-[#f4efe8] text-[#070709] shadow-[0_8px_22px_rgb(28_18_14/0.16)] split:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#070709]"
        >
          <X className="size-5" strokeWidth={1.75} aria-hidden="true" />
        </Link>
      ) : null}
    <motion.header
      className={`z-40 flex min-h-[5.5rem] items-center justify-between gap-4 overflow-hidden rounded-b-[1.35rem] px-5 pt-[max(0.9rem,env(safe-area-inset-top,0px))] pb-4 split:hidden ${
        revealAt ? "fixed inset-x-0 top-0" : "sticky top-0"
      } ${open ? "" : "pointer-events-none"} ${tone.light ? "text-[#2a160c]" : "text-white"} ${item.surfaceClass}`}
      initial={false}
      animate={{
        opacity: open ? 1 : 0,
        y: open ? 0 : "-110%",
      }}
      transition={{ duration: reduce ? 0 : 0.35, ease: internalEase }}
      aria-hidden={open ? undefined : true}
    >
      <Watermark tile={section} />
      <p className={`relative z-10 text-sm font-semibold tracking-[0.18em] uppercase ${tone.label}`}>
        {item.title}
      </p>
      <Link
        href="/"
        tabIndex={open ? 0 : -1}
        aria-label="Return to home"
        className="relative z-10 grid size-11 shrink-0 place-items-center rounded-full bg-[#f4efe8] text-[#070709] shadow-[0_8px_22px_rgb(28_18_14/0.16)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#070709]"
      >
        <X className="size-5" strokeWidth={1.75} aria-hidden="true" />
      </Link>
    </motion.header>
    </>
  );
}
