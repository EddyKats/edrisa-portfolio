import { aboutStats } from "@/data/about";
import { AboutStatCard } from "@/components/about/AboutStatCard";

export function AboutStats() {
  return (
    <section aria-label="A few numbers, still temporary" className="mt-20 sm:mt-24">
      <div className="grid gap-12 split:grid-cols-3 split:gap-6">
        {aboutStats.map((stat) => (
          <AboutStatCard key={stat.label} stat={stat} />
        ))}
      </div>
    </section>
  );
}
