"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ProjectCard, portfolioSizeClass } from "@/components/portfolio/PortfolioBrowser";
import { FaBehance, FaLinkedinIn, FaPhone, FaWhatsapp } from "react-icons/fa";
import { TbBrandAdobeIllustrator } from "react-icons/tb";
import { SiGoogleanalytics, SiGoogle, SiHubspot, SiMeta } from "react-icons/si";
import { aboutCopy, aboutProfile } from "@/data/about";
import type { PortfolioProject } from "@/data/portfolio";
import { softwareIds, softwareRegistry } from "@/data/software";
import type { PublicSocial } from "@/lib/content/site-shape";

const credentialMarks = {
  adobe: TbBrandAdobeIllustrator,
  google: SiGoogle,
  meta: SiMeta,
  analytics: SiGoogleanalytics,
  hubspot: SiHubspot,
} as const;

const presenceIcons = {
  behance: FaBehance,
  linkedin: FaLinkedinIn,
  whatsapp: FaWhatsapp,
} as const;

type ProfileImage = { src: string; width: number; height: number; alt: string };

export function AboutHeroBleed({ image }: { image: ProfileImage }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const span = Math.max(window.innerHeight * 1.35, 1);
      const t = Math.min(1, Math.max(0, window.scrollY / span));
      root.style.setProperty("--about-zoom", String(1.42 + t * 0.32));
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <div ref={rootRef} className="about-hero-bleed" aria-hidden="true">
        <Image
          src={image.src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="about-hero-bleed-image"
        />
      </div>
      <div className="about-hero-veil" aria-hidden="true" />
      <div className="about-hero-wash" aria-hidden="true" />
    </>
  );
}

export function AboutProfile({
  socials,
  callHref,
  projects,
}: {
  socials: PublicSocial[];
  callHref: string | null;
  projects: PortfolioProject[];
}) {
  const presence = socials.filter(
    (item): item is PublicSocial & { id: keyof typeof presenceIcons } =>
      item.id === "behance" || item.id === "linkedin" || item.id === "whatsapp",
  );
  const [lead, support] = aboutProfile.bio;

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("work")) return;
    const y = Number(sessionStorage.getItem("edrisa-portfolio-scroll"));
    if (y > 0) {
      requestAnimationFrame(() => {
        if (window.scrollY === 0) window.scrollTo(0, y);
      });
    }
  }, []);

  return (
    <>
      <div className="about-summary grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-x-10 xl:grid-cols-12 xl:gap-x-14">
        <header className="md:col-span-2 xl:col-span-5">
          <h1 className="about-name font-display tracking-tight">
            {aboutProfile.name.split(" ").map((part) => (
              <span key={part} className="block">
                {part}
              </span>
            ))}
          </h1>
          <p className="about-title max-w-[22rem] text-[clamp(1.05rem,1.4vw,1.28rem)] leading-snug font-medium text-ink/82">
            {aboutProfile.title}
          </p>
          <p className="about-facts mt-3 text-sm tracking-wide text-ink/60">{aboutProfile.facts}</p>
          <p className="about-lead mt-8">{lead}</p>
          <p className="about-support mt-4">{support}</p>
        </header>

        <section aria-labelledby="about-experience-title" className="about-proof xl:col-span-4">
          <h2 id="about-experience-title" className="about-kicker">
            {aboutCopy.journeyTitle}
          </h2>
          <ol className="about-timeline">
            {aboutProfile.experience.map((entry) => (
              <li key={entry.company}>
                <h3 className="text-[1.05rem] leading-tight font-semibold tracking-tight">{entry.company}</h3>
                <ul className="mt-1.5 space-y-0.5">
                  {entry.steps.map((step) => (
                    <li key={step} className="text-sm font-medium text-ink/72">
                      {step}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">{entry.note}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="about-proof flex flex-col gap-12 xl:col-span-3">
          <section aria-labelledby="about-education-title" className="about-education">
            <div className="about-education-body">
              <h2 id="about-education-title" className="about-kicker">
                {aboutProfile.educationHeading}
              </h2>
              <h3 className="about-education-title mt-5 max-w-[12.5rem] text-[1.35rem] leading-[1.1] font-semibold tracking-tight">
                {aboutProfile.education.credential}
              </h3>
              <p className="mt-3 text-sm font-medium text-ink/72">{aboutProfile.education.school}</p>
              <p className="mt-1 text-sm text-ink/65">{aboutProfile.education.detail}</p>
            </div>
          </section>

          <section aria-labelledby="about-skills-title">
            <h2 id="about-skills-title" className="about-kicker">
              {aboutProfile.coreSkillsHeading}
            </h2>
            <ol className="about-skills mt-4">
              {aboutProfile.coreSkills.map((skill, index) => (
                <li key={skill}>
                  <span className="about-skills-index">{String(index + 1).padStart(2, "0")}</span>
                  {skill}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      <div className="about-sheet">
      <div className="about-rail">
        {presence.length > 0 || callHref ? (
          <section aria-labelledby="about-contact-title">
            <h2 id="about-contact-title" className="about-kicker">
              {aboutProfile.contactHeading}
            </h2>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
              {presence.map((item) => {
                const Icon = presenceIcons[item.id];
                return (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                    >
                      <Icon className="size-3.5" aria-hidden="true" />
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
                    className="text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                  >
                    <FaPhone className="size-3" aria-hidden="true" />
                    Call
                  </a>
                </li>
              ) : null}
            </ul>
          </section>
        ) : null}

        <section aria-labelledby="about-software-title">
          <h2 id="about-software-title" className="about-kicker">
            {aboutProfile.softwareHeading}
          </h2>
          <p className="mt-4 text-[0.68rem] font-semibold tracking-[0.18em] text-ink/55 uppercase">
            {aboutProfile.softwareDesignHeading}
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {softwareIds.map((id) => {
              const tool = softwareRegistry[id];
              const Icon = tool.Icon;
              return (
                <li
                  key={id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink/[0.04] px-3 py-1.5 text-[0.78rem] font-medium text-ink/80"
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {tool.shortLabel}
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-[0.68rem] font-semibold tracking-[0.18em] text-ink/55 uppercase">
            {aboutProfile.softwareDevHeading}
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {aboutProfile.developmentTools.map((tool) => (
              <li
                key={tool}
                className="inline-flex items-center rounded-full bg-ink/[0.04] px-3 py-1.5 text-[0.78rem] font-medium text-ink/80"
              >
                {tool}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="about-credentials-title" className="mt-16 sm:mt-20">
        <h2 id="about-credentials-title" className="about-chapter-title">
          {aboutProfile.credentialsHeading}
        </h2>
        <p className="mt-3 max-w-[36rem] text-sm leading-relaxed text-ink/65">{aboutProfile.credentialsNote}</p>
        <ol className="about-credentials mt-8">
          {aboutProfile.credentials
            .filter((item) => item.published)
            .map((item) => (
              <li key={item.name} className="about-credential">
                <span className={`about-credential-mark is-${item.mark}`} aria-hidden="true">
                  {(() => {
                    const Mark = credentialMarks[item.mark];
                    return <Mark />;
                  })()}
                </span>
                <div>
                  <p className="about-kicker">{item.track}</p>
                  <h3 className="mt-3 text-[1.12rem] leading-snug font-semibold tracking-tight">{item.name}</h3>
                  <p className="mt-1.5 text-sm font-medium text-ink/68">{item.issuer}</p>
                  <p className="mt-2 max-w-[38rem] text-sm leading-relaxed text-ink/65">{item.note}</p>
                  <p className="mt-3 text-xs font-semibold tracking-[0.14em] text-ink/55 uppercase">
                    {item.completed ? "Certified" : "Not yet certified"}
                  </p>
                  {item.credentialUrl || item.programUrl ? (
                    <a
                      href={item.credentialUrl ?? item.programUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex text-sm font-semibold text-ink/80 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                    >
                      {item.programLabel}
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
        </ol>
      </section>

      {projects.length > 0 ? (
        <section aria-labelledby="about-work-title" className="mt-16 sm:mt-20">
          <h2 id="about-work-title" className="about-chapter-title">
            {aboutProfile.selectedHeading}
          </h2>
          <p className="mt-3 max-w-[32rem] text-sm leading-relaxed text-ink/65">{aboutProfile.selectedNote}</p>
          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 xl:auto-rows-[18rem]">
            {projects.map((project) => (
              <li key={project.slug} className={portfolioSizeClass[project.size]}>
                <ProjectCard
                  project={project}
                  href={`/about?work=${encodeURIComponent(project.slug)}`}
                  onOpen={() => {
                    sessionStorage.setItem("edrisa-portfolio-return", "/about");
                    sessionStorage.setItem("edrisa-portfolio-scroll", String(window.scrollY));
                    sessionStorage.setItem("edrisa-portfolio-focus", project.slug);
                  }}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      </div>
    </>
  );
}
