import Link from "next/link";
import { Watermark } from "@/components/site/Watermark";
import { aboutCopy } from "@/data/about";
import { getNavItem } from "@/data/navigation";

const aboutSurface = getNavItem("about").surfaceClass;

export function AboutCTA() {
  return (
    <section aria-labelledby="about-cta-title" className="relative mt-28 sm:mt-32">
      <div className={`absolute inset-x-0 top-16 bottom-0 overflow-hidden rounded-2xl ${aboutSurface}`}>
        <Watermark className="nav-mark about-cta-mark" />
        <Watermark className="nav-mark about-cta-mark-end" />
      </div>
      <div className="relative z-10 mx-3 rounded-[14px] bg-[#fffdfb] px-6 py-10 text-center shadow-[0_18px_50px_rgb(28_18_14/0.08)] sm:mx-auto sm:max-w-xl sm:px-10 sm:py-12">
        <h2 id="about-cta-title" className="text-[clamp(1.6rem,2.2vw,2.1rem)] leading-snug font-semibold tracking-tight">
          {aboutCopy.ctaHeading}
        </h2>
        <p className="mx-auto mt-4 max-w-[28rem] text-[0.98rem] leading-relaxed text-ink/70">
          {aboutCopy.ctaBody}
        </p>
        <Link
          href="/contact"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#FFE14A_0%,#FF8E12_55%,#F25C0A_100%)] px-6 py-3 text-sm font-semibold text-[#2a160c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2a160c]"
        >
          {aboutCopy.ctaLabel}
        </Link>
      </div>
      <div className="h-28 sm:h-32" aria-hidden="true" />
    </section>
  );
}
