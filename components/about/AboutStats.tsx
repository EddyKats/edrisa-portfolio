import { AboutStatCard } from "@/components/about/AboutStatCard";

type Stat = {
  value: string;
  label: string;
  icon: "layers" | "sparkles" | "clock";
  tone: "cyan" | "violet" | "magenta";
};

export function AboutStats({ stats }: { stats: Stat[] }) {
  if (stats.length === 0) return null;

  return (
    <section aria-label="A few numbers" className="mt-20 sm:mt-24">
      <div className="grid gap-12 split:grid-cols-3 split:gap-6">
        {stats.map((stat) => (
          <AboutStatCard key={stat.label} stat={stat} />
        ))}
      </div>
    </section>
  );
}
