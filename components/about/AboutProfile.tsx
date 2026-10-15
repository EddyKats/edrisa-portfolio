import Image from "next/image";
import Link from "next/link";
import { FaBehance, FaLinkedinIn } from "react-icons/fa";
import { Fingerprint, Monitor, PenTool, Smartphone } from "lucide-react";
import { aboutCopy, aboutProfile } from "@/data/about";
import type { PortfolioProject } from "@/data/portfolio";
import type { PublicSocial } from "@/lib/content/site-shape";

const disciplineIcons = [PenTool, Fingerprint, Monitor, Smartphone] as const;

const presenceIcons = {
  behance: FaBehance,
  linkedin: FaLinkedinIn,
} as const;

export function AboutProfile({
  image,
  socials,
  projects,
}: {
  image: { src: string; width: number; height: number; alt: string } | null;
  socials: PublicSocial[];
  projects: PortfolioProject[];
}) {
  const presence = socials.filter(
    (item): item is PublicSocial & { id: keyof typeof presenceIcons } => item.id === "behance" || item.id === "linkedin",
  );

  return (
    <>
      <header className="text-center">
        {image ? (
          <figure className="mx-auto mb-8 w-36 overflow-hidden rounded-[1.15rem] sm:w-44">
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              priority
              className="aspect-[4/5] w-full object-cover"
            />
          </figure>
        ) : null}
        <h1 className="text-balance font-display text-[clamp(2.35rem,3.4vw,3.35rem)] leading-[1.02] font-semibold tracking-tight">
          {aboutProfile.name}
        </h1>
        <p className="mx-auto mt-4 max-w-[28rem] text-[clamp(1.05rem,1.5vw,1.25rem)] leading-snug font-medium text-ink/80">
          {aboutProfile.title}
        </p>
        <p className="mx-auto mt-5 max-w-[38rem] text-[1.05rem] leading-relaxed text-ink/75">{aboutProfile.summary}</p>
        <p className="mx-auto mt-5 max-w-[36rem] text-sm font-medium tracking-wide text-ink/60">{aboutProfile.facts}</p>
      </header>

      <section aria-labelledby="about-bio-title" className="mt-20 sm:mt-24">
        <h2 id="about-bio-title" className="text-center text-[clamp(1.7rem,2.2vw,2.15rem)] font-semibold tracking-tight">
          {aboutProfile.bioHeading}
        </h2>
        <div className="mx-auto mt-8 max-w-[40rem] space-y-5 text-center text-[1.05rem] leading-relaxed text-ink/85">
          {aboutProfile.bio.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section aria-labelledby="about-disciplines-title" className="mt-20 sm:mt-24">
        <h2
          id="about-disciplines-title"
          className="text-center text-[clamp(1.7rem,2.2vw,2.15rem)] font-semibold tracking-tight"
        >
          {aboutProfile.disciplinesHeading}
        </h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {aboutProfile.disciplines.map((item, index) => {
            const Icon = disciplineIcons[index] ?? PenTool;
            return (
              <li key={item.title} className="rounded-[1.15rem] bg-white/55 px-5 py-5">
                <Icon className="size-5 text-ink/70" strokeWidth={1.75} aria-hidden="true" />
                <h3 className="mt-3 text-lg font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/70">{item.text}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="about-experience-title" className="mt-20 sm:mt-24">
        <h2
          id="about-experience-title"
          className="text-center text-[clamp(1.7rem,2.2vw,2.15rem)] font-semibold tracking-tight"
        >
          {aboutCopy.journeyTitle}
        </h2>
        <ol className="mt-10 grid gap-4">
          {aboutProfile.experience.map((entry) => (
            <li key={entry.company} className="rounded-[1.15rem] bg-white/55 px-5 py-5 sm:px-6">
              <h3 className="text-lg font-semibold tracking-tight">{entry.company}</h3>
              <ul className="mt-3 space-y-1">
                {entry.steps.map((step) => (
                  <li key={step} className="text-sm font-medium text-ink/80">
                    {step}
                  </li>
                ))}
              </ul>
              <p className="mt-3 max-w-[36rem] text-sm leading-relaxed text-ink/65">{entry.note}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="about-education-title" className="mt-20 sm:mt-24">
        <h2
          id="about-education-title"
          className="text-center text-[clamp(1.7rem,2.2vw,2.15rem)] font-semibold tracking-tight"
        >
          {aboutProfile.educationHeading}
        </h2>
        <div className="mt-10 rounded-[1.15rem] bg-white/55 px-5 py-5 sm:px-6">
          <h3 className="text-lg font-semibold tracking-tight">{aboutProfile.education.credential}</h3>
          <p className="mt-2 text-sm font-medium text-ink/80">{aboutProfile.education.school}</p>
          <p className="mt-1 text-sm text-ink/65">{aboutProfile.education.detail}</p>
        </div>
      </section>

      <section aria-labelledby="about-credentials-title" className="mt-20 sm:mt-24">
        <h2
          id="about-credentials-title"
          className="text-center text-[clamp(1.7rem,2.2vw,2.15rem)] font-semibold tracking-tight"
        >
          {aboutProfile.credentialsHeading}
        </h2>
        <p className="mx-auto mt-6 max-w-[34rem] text-center text-sm leading-relaxed text-ink/65">
          {aboutProfile.credentialsNote}
        </p>
      </section>

      {presence.length > 0 ? (
        <section aria-labelledby="about-presence-title" className="mt-20 sm:mt-24">
          <h2
            id="about-presence-title"
            className="text-center text-[clamp(1.7rem,2.2vw,2.15rem)] font-semibold tracking-tight"
          >
            {aboutProfile.presenceHeading}
          </h2>
          <ul className="mt-8 flex flex-wrap items-start justify-center gap-8">
            {presence.map((item) => {
              const Icon = presenceIcons[item.id];
              return (
                <li key={item.id}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-16 min-w-24 flex-col items-center gap-2 text-sm font-medium text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                  >
                    <Icon className="size-7" aria-hidden="true" />
                    <span>{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {projects.length > 0 ? (
        <section aria-labelledby="about-work-title" className="mt-20 sm:mt-24">
          <h2 id="about-work-title" className="text-center text-[clamp(1.7rem,2.2vw,2.15rem)] font-semibold tracking-tight">
            {aboutProfile.selectedHeading}
          </h2>
          <p className="mx-auto mt-4 max-w-[32rem] text-center text-sm leading-relaxed text-ink/65">
            {aboutProfile.selectedNote}
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <li key={project.slug}>
                <Link
                  href={`/portfolio/${project.slug}`}
                  className="group block overflow-hidden rounded-[1.05rem] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                >
                  <span className="relative block aspect-[16/10] bg-[#2e211c]">
                    {project.coverImage ? (
                      <Image
                        src={project.coverImage}
                        alt=""
                        fill
                        sizes="(min-width: 960px) 36vw, 100vw"
                        className="object-cover"
                      />
                    ) : null}
                  </span>
                  <span className="mt-3 block text-base font-semibold tracking-tight">{project.title}</span>
                  <span className="mt-0.5 block text-sm text-ink/60">{project.category}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
