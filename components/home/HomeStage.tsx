import { HeroPanel } from "@/components/home/HeroPanel";
import { HomeScrollLock } from "@/components/home/HomeScrollLock";
import { NavigationGrid } from "@/components/home/NavigationGrid";
import type { PublicSite } from "@/lib/content/site-shape";

export function HomeStage({
  site,
  labels,
}: {
  site: PublicSite;
  labels: { about: string; services: string; contact: string; portfolio: string };
}) {
  return (
    <>
      <HomeScrollLock />
      <a
        href="#primary-navigation"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink"
      >
        Skip to navigation
      </a>
      <main className="home-screen">
        <HeroPanel site={site} />
        <NavigationGrid labels={labels} />
      </main>
    </>
  );
}
