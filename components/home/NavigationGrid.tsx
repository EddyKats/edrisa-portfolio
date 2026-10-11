import { getNavItem, type NavId } from "@/data/navigation";
import { NavigationTile } from "@/components/home/NavigationTile";

const homeOrder = ["portfolio", "about", "services", "contact"] as const satisfies readonly NavId[];

const homeEyebrow: Partial<Record<NavId, string>> = {
  portfolio: "PORTFOLIO",
  about: "ABOUT ME",
};

function homeSurface(id: NavId) {
  if (id === "portfolio") {
    return "bg-[linear-gradient(148deg,#1A4FE0_0%,#2A74F4_36%,#2C95F3_64%,#24C0E4_84%,#1AD3C4_100%)]";
  }
  if (id === "about") return getNavItem("portfolio").surfaceClass;
  return getNavItem(id).surfaceClass;
}

export function NavigationGrid({
  labels,
}: {
  labels: { about: string; services: string; contact: string; portfolio: string };
}) {
  return (
    <nav
      id="primary-navigation"
      aria-label="Primary"
      className="home-nav"
    >
      {homeOrder.map((id, index) => (
        <NavigationTile
          key={id}
          item={getNavItem(id)}
          label={labels[id]}
          index={index}
          surfaceClass={homeSurface(id)}
          eyebrow={homeEyebrow[id]}
        />
      ))}
    </nav>
  );
}
