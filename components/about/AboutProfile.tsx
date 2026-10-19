import Image from "next/image";
import Link from "next/link";
import { FaBehance, FaLinkedinIn, FaPhone, FaWhatsapp } from "react-icons/fa";
import { aboutCopy, aboutProfile } from "@/data/about";
import type { PortfolioProject } from "@/data/portfolio";
import { softwareIds, softwareRegistry } from "@/data/software";
import type { PublicSocial } from "@/lib/content/site-shape";

const presenceIcons = {
  behance: FaBehance,
  linkedin: FaLinkedinIn,
  whatsapp: FaWhatsapp,
} as const;

type ProfileImage = { src: string; width: number; height: number; alt: string };

export function AboutHeroBleed({ image }: { image: ProfileImage }) {
  return (
    <div className="about-hero-bleed" aria-hidden="true">
      <Image
        src={image.src}
        alt=""
        fill
        priority
        sizes="100vw"
        className="about-hero-bleed-image"
      />
      <div className="about-hero-veil" />
    </div>
  );
}

export function AboutProfile({
  image,
  socials,
  callHref,
  projects,
}: {
  image: ProfileImage | null;
  socials: PublicSocial[];
  callHref: string | null;
  projects: PortfolioProject[];
}) {
  const presence = socials.filter(
    (item): item is PublicSocial & { id: keyof typeof presenceIcons } =>
      item.id === "behance" || item.id === "linkedin" || item.id === "whatsapp",
  );

  return (
    <>
      {image ? (
        <figure className="mb-10 overflow-hidden rounded-[1.25rem] split:hidden">
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            priority
            className="aspect-[4/5] w-full object-cover object-[50%_12%] sm:aspect-[5/4]"
          />
        </figure>
      ) : null}

      <div className="about-summary grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-x-10 xl:grid-cols-12 xl:gap-x-12">
        <header className="md:col-span-2 xl:col-span-5">
          <p className="text-[0.72rem] font-semibold tracking-[0.22em] text-ink/45 uppercase">
            {aboutProfile.introLabel}
          </p>
          <h1 className="mt-3 text-balance font-display text-[clamp(2.4rem,4.2vw,3.6rem)] leading-[0.98] font-semibold tracking-tight">
            {aboutProfile.name}
          </h1>
          <p className="mt-4 text-[clamp(1.02rem,1.35vw,1.2rem)] leading-snug font-medium text-ink/80">
            {aboutProfile.title}
          </p>
          <p className="mt-3 text-sm font-medium tracking-wide text-ink/55">{aboutProfile.facts}</p>
          <div className="mt-6 max-w-[34rem] space-y-4 text-[1.02rem] leading-relaxed text-ink/78">
            {aboutProfile.bio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {presence.length > 0 || callHref ? (
            <section aria-labelledby="about-contact-title" className="mt-8">
              <h2 id="about-contact-title" className="text-[0.72rem] font-semibold tracking-[0.2em] text-ink/45 uppercase">
                {aboutProfile.contactHeading}
              </h2>
              <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-4">
                {presence.map((item) => {
                  const Icon = presenceIcons[item.id];
                  return (
                    <li key={item.id}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm font-medium text-ink/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                      >
                        <Icon className="size-4" aria-hidden="true" />
                        {item.label}
                      </a>
                    </li>
                  );
                })}
                {callHref ? (
                  <li>
                    <a
                      href={callHref}
                      aria-label="Call Edrisa"
                      className="flex items-center gap-2 text-sm font-medium text-ink/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                    >
                      <FaPhone className="size-3.5" aria-hidden="true" />
                      Call
                    </a>
                  </li>
                ) : null}
              </ul>
            </section>
          ) : null}

          <section aria-labelledby="about-software-title" className="mt-8">
            <h2 id="about-software-title" className="text-[0.72rem] font-semibold tracking-[0.2em] text-ink/45 uppercase">
              {aboutProfile.softwareHeading}
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {softwareIds.map((id) => {
                const tool = softwareRegistry[id];
                const Icon = tool.Icon;
                return (
                  <li
                    key={id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-[0.78rem] font-medium text-ink/75"
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                    {tool.shortLabel}
                  </li>
                );
              })}
            </ul>
          </section>
        </header>

        <section aria-labelledby="about-experience-title" className="xl:col-span-4">
          <h2 id="about-experience-title" className="text-[0.72rem] font-semibold tracking-[0.2em] text-ink/45 uppercase">
            {aboutCopy.journeyTitle}
          </h2>
          <ol className="mt-5 space-y-6">
            {aboutProfile.experience.map((entry) => (
              <li key={entry.company}>
                <h3 className="text-lg font-semibold tracking-tight">{entry.company}</h3>
                <ul className="mt-2 space-y-1">
                  {entry.steps.map((step) => (
                    <li key={step} className="text-sm font-medium text-ink/75">
                      {step}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 max-w-[28rem] text-sm leading-relaxed text-ink/58">{entry.note}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="flex flex-col gap-10 xl:col-span-3">
          <section aria-labelledby="about-education-title">
            <h2 id="about-education-title" className="text-[0.72rem] font-semibold tracking-[0.2em] text-ink/45 uppercase">
              {aboutProfile.educationHeading}
            </h2>
            <h3 className="mt-5 text-lg font-semibold tracking-tight">{aboutProfile.education.credential}</h3>
            <p className="mt-2 text-sm font-medium text-ink/75">{aboutProfile.education.school}</p>
            <p className="mt-1 text-sm text-ink/58">{aboutProfile.education.detail}</p>
          </section>

          <section aria-labelledby="about-skills-title">
            <h2 id="about-skills-title" className="text-[0.72rem] font-semibold tracking-[0.2em] text-ink/45 uppercase">
              {aboutProfile.coreSkillsHeading}
            </h2>
            <ul className="mt-5 space-y-2">
              {aboutProfile.coreSkills.map((skill) => (
                <li key={skill} className="text-sm font-medium tracking-tight text-ink/78">
                  {skill}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <section aria-labelledby="about-credentials-title" className="mt-20 sm:mt-24">
        <h2 id="about-credentials-title" className="text-[clamp(1.35rem,1.8vw,1.7rem)] font-semibold tracking-tight">
          {aboutProfile.credentialsHeading}
        </h2>
        <p className="mt-4 max-w-[34rem] text-sm leading-relaxed text-ink/65">{aboutProfile.credentialsNote}</p>
      </section>

      {projects.length > 0 ? (
        <section aria-labelledby="about-work-title" className="mt-16 sm:mt-20">
          <h2 id="about-work-title" className="text-[clamp(1.35rem,1.8vw,1.7rem)] font-semibold tracking-tight">
            {aboutProfile.selectedHeading}
          </h2>
          <p className="mt-3 max-w-[32rem] text-sm leading-relaxed text-ink/65">{aboutProfile.selectedNote}</p>
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
