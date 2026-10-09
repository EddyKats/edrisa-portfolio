import { Gem, Layers, Zap, type LucideIcon } from "lucide-react";
import { serviceOffers, type ServiceIconName } from "@/data/services";
import { getNavItem } from "@/data/navigation";

const icons: Record<ServiceIconName, LucideIcon> = {
  gem: Gem,
  zap: Zap,
  layers: Layers,
};

export function ServiceOffers() {
  return (
    <section aria-label="Main services" className="mt-14 sm:mt-16">
      <ul className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
        {serviceOffers.map((offer) => {
          const Icon = icons[offer.icon];
          const surface = getNavItem(offer.surface).surfaceClass;

          return (
            <li key={offer.title}>
              <article className="h-full">
                <div className={`grid aspect-[4/3] place-items-center overflow-hidden rounded-2xl ${surface}`}>
                  <Icon className="size-10 text-white/90" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <h2 className="mt-5 text-xl font-semibold tracking-tight">{offer.title}</h2>
                <p className="mt-2 text-[0.98rem] leading-relaxed text-ink/70">{offer.summary}</p>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
