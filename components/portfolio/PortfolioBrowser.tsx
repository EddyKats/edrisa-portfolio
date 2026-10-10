"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { projectTones } from "@/components/portfolio/projectTones";
import { portfolioCopy, type PortfolioCategory, type PortfolioProject, type ProjectSize } from "@/data/portfolio";

const scrollKey = "edrisa-portfolio-scroll";
const returnKey = "edrisa-portfolio-return";
const focusKey = "edrisa-portfolio-focus";

function toneFor(category: string) {
  if (category in projectTones) return projectTones[category as PortfolioCategory];
  return "bg-[#2e211c]";
}

function isFilter(value: string | null, categories: string[]): value is string {
  return Boolean(value && categories.includes(value));
}

const sizeClass: Record<ProjectSize, string> = {
  large: "h-[26rem] sm:h-[30rem] xl:h-auto xl:row-span-2",
  wide: "h-[17rem] sm:col-span-2 xl:col-span-2 xl:h-auto",
  tall: "h-[24rem] sm:h-[28rem] xl:h-auto xl:row-span-2",
  standard: "h-[17rem] sm:h-[18rem] xl:h-auto",
};

export function PortfolioBrowser({
  projects,
  categories,
}: {
  projects: PortfolioProject[];
  categories: string[];
}) {
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requested = searchParams.get("category");
  const filter = isFilter(requested, categories) ? requested : "All";
  const visible = filter === "All" ? projects : projects.filter((project) => project.category === filter);

  useEffect(() => {
    if (pathname !== "/portfolio") return;
    const y = Number(sessionStorage.getItem(scrollKey));
    const slug = sessionStorage.getItem(focusKey);
    requestAnimationFrame(() => {
      if (y > 0) window.scrollTo(0, y);
      if (!slug) return;
      document.getElementById(`project-card-${slug}`)?.focus({ preventScroll: true });
      sessionStorage.removeItem(focusKey);
    });
  }, [pathname]);

  function choose(category: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "All") params.delete("category");
    else params.set("category", category);
    const query = params.toString();
    router.replace(query ? `/portfolio?${query}` : "/portfolio", { scroll: false });
  }

  function remember(slug: string) {
    if (document.body.style.position === "fixed") return;
    sessionStorage.setItem(scrollKey, String(window.scrollY));
    sessionStorage.setItem(returnKey, `${window.location.pathname}${window.location.search}`);
    sessionStorage.setItem(focusKey, slug);
  }

  return (
    <div className="mt-14 sm:mt-16">
      <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const selected = filter === category;

          return (
            <button
              key={category}
              type="button"
              aria-pressed={selected}
              onClick={() => choose(category)}
              className={`rounded-full px-3.5 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                selected ? "bg-ink text-white" : "text-ink/70 hover:text-ink"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
      {visible.length === 0 ? (
        <p role="status" className="mt-8 text-ink/60">
          {portfolioCopy.emptyLabel}
        </p>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 xl:auto-rows-[18rem]">
          <AnimatePresence mode="popLayout">
            {visible.map((project) => (
              <motion.li
                key={project.slug}
                className={sizeClass[project.size]}
                layout={reduce ? false : true}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.35 }}
              >
                <ProjectCard project={project} filter={filter} onOpen={() => remember(project.slug)} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

function ProjectCard({
  project,
  filter,
  onOpen,
}: {
  project: PortfolioProject;
  filter: string;
  onOpen: () => void;
}) {
  const image = project.coverImage;

  return (
    <article className="h-full">
      <Link
        id={`project-card-${project.slug}`}
        href={
          filter === "All"
            ? `/portfolio/${project.slug}`
            : `/portfolio/${project.slug}?category=${encodeURIComponent(filter)}`
        }
        scroll={false}
        onClick={onOpen}
        className="group relative block h-full min-h-full overflow-hidden rounded-[1.05rem] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
      >
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 1280px) 34vw, (min-width: 640px) 46vw, 100vw"
            className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out motion-safe:group-hover:scale-[1.03]"
          />
        ) : (
          <div className={`absolute inset-0 ${toneFor(project.category)}`} aria-hidden="true" />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-[#1c120e]/62 via-[#1c120e]/18 to-transparent motion-safe:transition-all motion-safe:duration-500 motion-safe:group-hover:from-[#1c120e]/72" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 sm:p-5">
          <div className="motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:-translate-y-1.5">
            <h2 className="text-[1.05rem] font-semibold tracking-tight text-white/85 motion-safe:transition-colors motion-safe:duration-500 motion-safe:group-hover:text-white">
              {project.title}
            </h2>
            <p className="mt-0.5 text-sm text-white/55 motion-safe:transition-colors motion-safe:duration-500 motion-safe:group-hover:text-white/90">
              {project.category}
            </p>
          </div>
          <span
            aria-hidden="true"
            className="mb-0.5 inline-flex items-center gap-1 text-xs font-medium tracking-wide text-white opacity-0 motion-safe:transition-opacity motion-safe:duration-500 motion-safe:group-hover:opacity-100"
          >
            View
            <ArrowUpRight className="size-3.5" strokeWidth={1.75} />
          </span>
        </div>
      </Link>
    </article>
  );
}
