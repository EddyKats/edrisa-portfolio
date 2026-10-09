import { aboutCopy } from "@/data/about";

export function AboutIntro() {
  return (
    <div className="mt-16 sm:mt-20">
      <h2 className="text-center text-[clamp(1.55rem,2.1vw,2.05rem)] leading-snug font-semibold tracking-tight">
        {aboutCopy.introHeading}
      </h2>
      <p className="mx-auto mt-8 max-w-[40rem] text-center text-[1.05rem] leading-relaxed text-ink/90">
        {aboutCopy.intro}
      </p>
      <h2 className="mx-auto mt-16 max-w-[36rem] text-center text-[clamp(1.25rem,1.7vw,1.6rem)] leading-snug font-semibold tracking-tight">
        {aboutCopy.storyHeading}
      </h2>
      <p className="mx-auto mt-6 max-w-[40rem] text-center text-[0.98rem] leading-relaxed text-ink/70">
        {aboutCopy.story}
      </p>
    </div>
  );
}
