"use client";

import Link from "next/link";
import { ProjectCard, portfolioSizeClass } from "@/components/portfolio/PortfolioBrowser";
import type { PortfolioProject } from "@/data/portfolio";

export function SelectedWork({
  projects,
  returnTo,
  heading,
  note,
  headingId,
  className = "mt-16 sm:mt-20",
  cue = false,
  uniform = false,
}: {
  projects: PortfolioProject[];
  returnTo: "/about" | "/services";
  heading: string;
  note?: string;
  headingId: string;
  className?: string;
  cue?: boolean;
  uniform?: boolean;
}) {
  const shown = projects.slice(0, 3);
  if (shown.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className={className}>
      <h2 id={headingId} className="about-chapter-title">
        {heading}
      </h2>
      {note ? <p className="mt-3 max-w-[32rem] text-sm leading-relaxed text-ink/65">{note}</p> : null}
      <ul
        className={
          uniform
            ? "mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
            : "mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 xl:auto-rows-[18rem]"
        }
      >
        {shown.map((project) => (
          <li key={project.slug} className={uniform ? "h-[17rem] sm:h-[20rem]" : portfolioSizeClass[project.size]}>
            <ProjectCard
              project={project}
              href={`${returnTo}?work=${encodeURIComponent(project.slug)}`}
              onOpen={() => {
                sessionStorage.setItem("edrisa-portfolio-return", returnTo);
                sessionStorage.setItem("edrisa-portfolio-scroll", String(window.scrollY));
                sessionStorage.setItem("edrisa-portfolio-focus", project.slug);
              }}
            />
          </li>
        ))}
      </ul>
      <Link
        href="/portfolio"
        className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold tracking-tight text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
      >
        View all projects
        {cue ? <span aria-hidden="true">→</span> : null}
      </Link>
    </section>
  );
}
