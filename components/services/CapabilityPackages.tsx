import Link from "next/link";
import { internalButtonClass } from "@/components/internal/InternalCTA";
export function CapabilityPackages({
  heading,
  note,
  packages,
}: {
  heading: string;
  note: string;
  packages: { id: string; name: string; items: string[]; buttonLabel: string }[];
}) {
  return (
    <section aria-labelledby="services-capabilities-title" className="mt-24 sm:mt-28">
      <h2
        id="services-capabilities-title"
        className="text-center text-[clamp(1.7rem,2.2vw,2.15rem)] font-semibold tracking-tight"
      >
        {heading}
      </h2>
      <p className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed text-ink/60">
        {note}
      </p>
      <ul className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {packages.map((pack) => (
          <li key={pack.id} className="flex flex-col rounded-2xl bg-white px-6 py-8 shadow-[0_12px_40px_rgb(28_18_14/0.05)]">
            <h3 className="text-sm font-semibold tracking-[0.18em] uppercase">{pack.name}</h3>
            <ul className="mt-6 flex-1 space-y-2 text-[0.98rem] leading-relaxed text-ink/75">
              {pack.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Link href="/contact" className={`mt-8 self-start ${internalButtonClass}`}>
              {pack.buttonLabel}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
