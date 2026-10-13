import Link from "next/link";
import { sectionTone } from "@/components/internal/sectionTone";
import { Watermark } from "@/components/site/Watermark";
import { getNavItem, type NavId } from "@/data/navigation";

export const internalButtonClass =
  "inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#FFE14A_0%,#FF8E12_55%,#F25C0A_100%)] px-6 py-3 text-sm font-semibold text-[#2a160c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2a160c]";

export function InternalCTA({
  section,
  heading,
  body,
  label,
  href,
}: {
  section: NavId;
  heading: string;
  body: string;
  label: string;
  href: string;
}) {
  const surface = getNavItem(section).surfaceClass;
  const tone = sectionTone(section);
  const titleId = `${section}-cta-title`;
  const buttonTone = tone.light
    ? "text-[#2a160c] focus-visible:outline-[#2a160c]"
    : "text-white focus-visible:outline-white";

  return (
    <section aria-labelledby={titleId} className="relative mt-28 sm:mt-32">
      <div className={`absolute inset-x-0 top-16 bottom-0 overflow-hidden rounded-2xl ${surface}`}>
        <Watermark tile={section} className="nav-mark internal-cta-mark" />
        <Watermark tile={section} className="nav-mark internal-cta-mark-end" />
      </div>
      <div className="relative z-10 mx-3 rounded-[14px] bg-[#070709] px-6 py-10 text-center shadow-[0_18px_50px_rgb(0_0_0/0.28)] sm:mx-auto sm:max-w-xl sm:px-10 sm:py-12">
        <h2 id={titleId} className="text-[clamp(1.9rem,3vw,2.6rem)] leading-tight font-bold tracking-tight text-white">
          {heading}
        </h2>
        <p className="mx-auto mt-4 max-w-[28rem] text-[0.98rem] leading-relaxed text-[#f4efe8]/78">{body}</p>
        <Link
          href={href}
          className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 ${surface} ${buttonTone}`}
        >
          {label}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div className="h-28 sm:h-32" aria-hidden="true" />
    </section>
  );
}
