import type { NavId } from "@/data/navigation";

export function sectionTone(id: NavId) {
  const light = id === "contact";

  return {
    light,
    icon: light ? "text-[#2a160c]/80" : "text-white/80",
    links: light ? "text-[#2a160c]/75" : "text-white/70",
    label: light ? "text-[#2a160c]/80" : "text-white/90",
    focus: light
      ? "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2a160c]"
      : "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
  };
}
