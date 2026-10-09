import Image from "next/image";
import { aboutCopy, aboutJourney } from "@/data/about";

const markTones = [
  "bg-[linear-gradient(145deg,#d9fff8,#8ee7f2)] text-[#145f73]",
  "bg-[linear-gradient(145deg,#efe7ff,#c7b6ff)] text-[#3d2a86]",
  "bg-[linear-gradient(145deg,#ffe3f0,#ffb3d1)] text-[#8a2458]",
];

export function AboutJourney() {
  return (
    <section aria-labelledby="about-journey-title" className="mt-24 sm:mt-28">
      <h2
        id="about-journey-title"
        className="text-center text-[clamp(1.7rem,2.2vw,2.15rem)] font-semibold tracking-tight"
      >
        {aboutCopy.journeyTitle}
      </h2>
      <ol className="mt-12 grid gap-12 sm:grid-cols-2 split:grid-cols-3 split:gap-8">
        {aboutJourney.map((entry, index) => (
          <li key={entry.company} className="text-center">
            <div
              className={`mx-auto grid place-items-center overflow-hidden rounded-full font-semibold ${markTones[index]} ${index === 0 ? "size-28 text-2xl sm:size-32" : "size-24 text-xl sm:size-28"}`}
            >
              {entry.markSrc ? (
                <Image
                  src={entry.markSrc}
                  alt=""
                  width={160}
                  height={160}
                  className="size-full object-cover"
                />
              ) : (
                <span aria-hidden="true">{entry.initials}</span>
              )}
            </div>
            <p className="mt-5 text-base font-semibold">{entry.company}</p>
            <p className="mt-1 text-sm text-ink/80">{entry.role}</p>
            <p className="mx-auto mt-2 max-w-[16rem] text-sm leading-snug text-ink/55">{entry.note}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
