export function AboutIntro({
  heading,
  intro,
  storyHeading,
  story,
}: {
  heading: string;
  intro: string;
  storyHeading: string;
  story: string;
}) {
  return (
    <div className="mt-16 sm:mt-20">
      <h2 className="text-center text-[clamp(1.55rem,2.1vw,2.05rem)] leading-snug font-semibold tracking-tight">
        {heading}
      </h2>
      <p className="mx-auto mt-8 max-w-[40rem] text-center text-[1.05rem] leading-relaxed whitespace-pre-line text-ink/90">
        {intro}
      </p>
      <h2 className="mx-auto mt-16 max-w-[36rem] text-center text-[clamp(1.25rem,1.7vw,1.6rem)] leading-snug font-semibold tracking-tight">
        {storyHeading}
      </h2>
      <p className="mx-auto mt-6 max-w-[40rem] text-center text-[0.98rem] leading-relaxed whitespace-pre-line text-ink/70">
        {story}
      </p>
    </div>
  );
}
