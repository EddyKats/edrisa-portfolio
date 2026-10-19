import { Gem, Layers, Zap, type LucideIcon } from "lucide-react";
import { getNavItem } from "@/data/navigation";
import type { NavId } from "@/data/navigation";

type ServiceIconName = "gem" | "zap" | "layers";

const icons: Record<ServiceIconName, LucideIcon> = {
  gem: Gem,
  zap: Zap,
  layers: Layers,
};

export function ServiceOffers({
  heading,
  offers,
}: {
  heading: string;
  offers: { title: string; summary: string; icon: ServiceIconName; surface: NavId }[];
}) {
  return (
    <section aria-labelledby="services-offers-title" className="services-block">
      <h2 id="services-offers-title" className="about-kicker">
        {heading}
      </h2>
      <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:auto-rows-[18rem]">
        {offers.map((offer, index) => {
          const Icon = icons[offer.icon];
          const surface = getNavItem(offer.surface).surfaceClass;

          return (
            <li key={offer.title} className="h-[17rem] sm:h-[18rem] xl:h-auto">
              <article className={`relative h-full overflow-hidden rounded-[1.05rem] ${surface}`}>
                <span className="absolute top-4 left-4 text-[0.62rem] font-bold tracking-[0.16em] text-white/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Icon
                  className="absolute top-4 right-4 size-7 text-white/80"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-[#1c120e]/70 via-[#1c120e]/22 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <h3 className="text-xl leading-tight font-semibold tracking-tight text-white">{offer.title}</h3>
                  <p className="mt-1.5 max-w-[22rem] text-[0.95rem] leading-snug text-white/80">{offer.summary}</p>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
