import { Gem, Layers, Zap, type LucideIcon } from "lucide-react";
import { getNavItem } from "@/data/navigation";
import type { NavId } from "@/data/navigation";

type ServiceIconName = "gem" | "zap" | "layers";
type ServiceArt = "print" | "mark" | "web" | "app";

const icons: Record<ServiceIconName, LucideIcon> = {
  gem: Gem,
  zap: Zap,
  layers: Layers,
};

const arts: ServiceArt[] = ["print", "mark", "web", "app"];

export function ServiceOffers({
  heading,
  offers,
}: {
  heading: string;
  offers: { title: string; summary: string; icon: ServiceIconName; surface: NavId }[];
}) {
  return (
    <section aria-labelledby="services-offers-title" className="services-block is-open">
      <h2 id="services-offers-title" className="about-kicker">
        {heading}
      </h2>
      <ul className="service-offers">
        {offers.map((offer, index) => {
          const Icon = icons[offer.icon];
          const surface = getNavItem(offer.surface).surfaceClass;
          const art = arts[index % arts.length]!;

          return (
            <li key={offer.title}>
              <article className={`service-offer ${surface}`}>
                <ServiceArt kind={art} />
                <span className="service-offer-index">{String(index + 1).padStart(2, "0")}</span>
                <Icon className="service-offer-icon" strokeWidth={1.5} aria-hidden="true" />
                <div className="service-offer-copy">
                  <h3>{offer.title}</h3>
                  <p>{offer.summary}</p>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ServiceArt({ kind }: { kind: ServiceArt }) {
  return (
    <svg className={`service-offer-art is-${kind}`} viewBox="0 0 360 220" aria-hidden="true">
      {kind === "print" ? (
        <g fill="none" stroke="currentColor" strokeWidth="1.25">
          <path d="M28 28h16M28 28v16M332 28h-16M332 28v16M28 192h16M28 192v-16M332 192h-16M332 192v-16" />
          <rect x="86" y="42" width="128" height="150" />
          <rect x="148" y="24" width="150" height="96" />
          <path d="M46 70h270M46 118h270M46 166h270M104 16v188M176 16v188M248 16v188" opacity="0.45" />
        </g>
      ) : null}
      {kind === "mark" ? (
        <g fill="none" stroke="currentColor" strokeWidth="1.25">
          <circle cx="168" cy="108" r="62" />
          <circle cx="214" cy="78" r="38" />
          <circle cx="118" cy="146" r="24" />
          <path d="M48 40h264M48 180h264M70 22v176M290 22v176" opacity="0.4" />
          <path d="M154 92h48M168 78v48" />
        </g>
      ) : null}
      {kind === "web" ? (
        <g fill="none" stroke="currentColor" strokeWidth="1.25">
          <rect x="42" y="28" width="276" height="164" rx="10" />
          <path d="M42 58h276" />
          <circle cx="62" cy="43" r="3.5" fill="currentColor" stroke="none" />
          <circle cx="78" cy="43" r="3.5" fill="currentColor" stroke="none" />
          <circle cx="94" cy="43" r="3.5" fill="currentColor" stroke="none" />
          <rect x="62" y="76" width="92" height="92" />
          <path d="M172 76h122M172 112h122M172 148h86" />
        </g>
      ) : null}
      {kind === "app" ? (
        <g fill="none" stroke="currentColor" strokeWidth="1.25">
          <rect x="118" y="22" width="92" height="168" rx="16" />
          <rect x="168" y="46" width="92" height="150" rx="16" />
          <path d="M136 48h56M186 70h56M186 96h56M186 122h40" />
          <path d="M150 168h28" />
        </g>
      ) : null}
    </svg>
  );
}
