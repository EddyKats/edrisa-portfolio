"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AboutCTA } from "@/components/about/AboutCTA";
import { AboutFeatureMedia } from "@/components/about/AboutFeatureMedia";
import { AboutFooter } from "@/components/about/AboutFooter";
import { AboutIntro } from "@/components/about/AboutIntro";
import { AboutJourney } from "@/components/about/AboutJourney";
import { AboutMobileHeader } from "@/components/about/AboutMobileHeader";
import { AboutSideNav } from "@/components/about/AboutSideNav";
import { AboutStats } from "@/components/about/AboutStats";
import { aboutCopy } from "@/data/about";

const ease = [0.22, 1, 0.36, 1] as const;

export function AboutPage() {
  const reduce = useReducedMotion();

  return (
    <div className="min-h-dvh bg-[#f6f3ef] text-ink">
      <AboutMobileHeader />
      <div className="split:flex split:items-start split:gap-10 split:px-6 split:py-5">
        <motion.main
          className="min-w-0 flex-1"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <div className="mx-auto w-full max-w-[48rem] px-5 py-14 sm:px-8 sm:py-20">
            <h1 className="text-center text-[clamp(1.875rem,2.4vw,2.375rem)] font-medium tracking-tight">
              {aboutCopy.title}
            </h1>
            <AboutFeatureMedia />
            <AboutIntro />
            <AboutStats />
            <AboutJourney />
            <AboutCTA />
            <AboutFooter />
          </div>
        </motion.main>
        <AboutSideNav />
      </div>
    </div>
  );
}
