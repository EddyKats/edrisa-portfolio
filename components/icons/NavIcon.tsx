import { Gem, MapPin, Trophy, Zap, type LucideIcon } from "lucide-react";
import type { NavIconName } from "@/data/navigation";

const icons: Record<NavIconName, LucideIcon> = {
  gem: Gem,
  zap: Zap,
  pin: MapPin,
  trophy: Trophy,
};

type NavIconProps = {
  name: NavIconName;
  className?: string;
};

export function NavIcon({ name, className }: NavIconProps) {
  const Icon = icons[name];

  return <Icon className={className} strokeWidth={1.5} aria-hidden="true" />;
}
