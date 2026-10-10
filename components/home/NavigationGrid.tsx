import { navigation } from "@/data/navigation";
import { NavigationTile } from "@/components/home/NavigationTile";

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
      {navigation.map((item, index) => (
        <NavigationTile key={item.id} item={item} label={labels[item.id]} index={index} />
      ))}
    </nav>
  );
}
