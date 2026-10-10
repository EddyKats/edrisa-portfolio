import { Clock, Layers, Sparkles, type LucideIcon } from "lucide-react";

type Stat = {
  value: string;
  label: string;
  icon: "layers" | "sparkles" | "clock";
  tone: "cyan" | "violet" | "magenta";
};

const icons: Record<Stat["icon"], LucideIcon> = {
  layers: Layers,
  sparkles: Sparkles,
  clock: Clock,
};

const tones: Record<Stat["tone"], string> = {
  cyan: "bg-[radial-gradient(circle_at_50%_42%,rgb(32_209_192/0.45),transparent_62%),linear-gradient(180deg,#f4fbff,#e7f6ff)] text-[#1d6fbf]",
  violet:
    "bg-[radial-gradient(circle_at_50%_42%,rgb(99_37_232/0.28),transparent_62%),linear-gradient(180deg,#f7f4ff,#eee9ff)] text-[#5b35d5]",
  magenta:
    "bg-[radial-gradient(circle_at_50%_42%,rgb(228_36_123/0.28),transparent_62%),linear-gradient(180deg,#fff4f8,#ffe8f1)] text-[#c4256d]",
};

export function AboutStatCard({ stat }: { stat: Stat }) {
  const Icon = icons[stat.icon];

  return (
    <article className="text-center">
      <div className={`grid h-40 place-items-center rounded-2xl ${tones[stat.tone]}`}>
        <Icon className="size-8" strokeWidth={1.5} aria-hidden="true" />
      </div>
      <p className="mt-5 text-4xl font-semibold tracking-tight">{stat.value}</p>
      <p className="mx-auto mt-2 max-w-[16rem] text-sm leading-snug text-ink/70">{stat.label}</p>
    </article>
  );
}
