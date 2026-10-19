import Link from "next/link";
import { getNavItem } from "@/data/navigation";

const servicesSurface = getNavItem("services").surfaceClass;

export function CapabilityPackages({
  heading,
  packages,
}: {
  heading: string;
  packages: { id: string; name: string; description?: string | null; items: string[]; buttonLabel: string }[];
}) {
  return (
    <section aria-labelledby="services-capabilities-title" className="services-block">
      <h2 id="services-capabilities-title" className="about-chapter-title">
        {heading}
      </h2>
      <ul className="services-packages">
        {packages.map((pack, index) => (
          <li key={pack.id} className="services-package">
            <p className="services-package-index" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </p>
            <div className="services-package-body">
              <h3 className="text-[1.35rem] leading-tight font-semibold tracking-tight">{pack.name}</h3>
              {pack.description ? (
                <p className="mt-2 max-w-[28rem] text-sm leading-relaxed text-ink/65">{pack.description}</p>
              ) : null}
              <ul className="about-skills mt-5">
                {pack.items.map((item, itemIndex) => (
                  <li key={item}>
                    <span className="about-skills-index">{String(itemIndex + 1).padStart(2, "0")}</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="services-package-talk">
                <Link
                  href="/contact"
                  className={`services-package-talk-btn ${servicesSurface}`}
                >
                  {pack.buttonLabel}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
