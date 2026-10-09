import Link from "next/link";
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
  const titleId = `${section}-cta-title`;

  return (
    <section aria-labelledby={titleId} className="relative mt-28 sm:mt-32">
      <div className={`absolute inset-x-0 top-16 bottom-0 overflow-hidden rounded-2xl ${surface}`}>
        <Watermark tile={section} className="nav-mark internal-cta-mark" />
        <Watermark tile={section} className="nav-mark internal-cta-mark-end" />
      </div>
      <div className="relative z-10 mx-3 rounded-[14px] bg-[#fffdfb] px-6 py-10 text-center shadow-[0_18px_50px_rgb(28_18_14/0.08)] sm:mx-auto sm:max-w-xl sm:px-10 sm:py-12">
        <h2 id={titleId} className="text-[clamp(1.6rem,2.2vw,2.1rem)] leading-snug font-semibold tracking-tight">
          {heading}
        </h2>
        <p className="mx-auto mt-4 max-w-[28rem] text-[0.98rem] leading-relaxed text-ink/70">{body}</p>
        <Link href={href} className={`mt-8 ${internalButtonClass}`}>
          {label}
        </Link>
      </div>
      <div className="h-28 sm:h-32" aria-hidden="true" />
    </section>
  );
}
