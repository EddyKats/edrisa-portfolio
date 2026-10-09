import { navigation } from "@/data/navigation";
import { NavigationTile } from "@/components/home/NavigationTile";

export function NavigationGrid() {
  return (
    <nav
      id="primary-navigation"
      aria-label="Primary"
      className="home-nav"
    >
      {navigation.map((item, index) => (
        <NavigationTile key={item.id} item={item} index={index} />
      ))}
    </nav>
  );
}
