"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { FaBehance, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import { projectTones } from "@/components/portfolio/projectTones";
import { getProjectNeighbors, portfolioCategories, type PortfolioCategory, type PortfolioProject } from "@/data/portfolio";
import { site, socialLinks, socialProfiles } from "@/data/site";
import { softwareRegistry, type SoftwareId } from "@/data/software";

const returnKey = "edrisa-portfolio-return";
const contactOrder = ["whatsapp", "behance", "linkedin"] as const;

const contactIcons = {
  behance: FaBehance,
  linkedin: FaLinkedinIn,
  whatsapp: FaWhatsapp,
} as const;

const circleClass =
  "grid size-12 shrink-0 place-items-center rounded-full bg-[#f7f1ea] text-mocha-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink split:focus-visible:outline-white";

export function ProjectDetail({ project }: { project: PortfolioProject }) {
  const router = useRouter();
  const routerRef = useRef(router);
  const shellRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [hireVisible, setHireVisible] = useState(true);
  const { previous, next } = getProjectNeighbors(project.slug);
  const hero = project.heroImage ?? project.coverImage;
  const titleId = `project-${project.slug}-title`;
  const tools = project.software;
  const subtitle = [project.category, project.role].filter(Boolean).join(" · ");
  const facts = projectFacts(project);

  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  function close() {
    router.push(portfolioReturnHref());
  }

  function openProject(event: MouseEvent<HTMLAnchorElement>, slug: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    router.push(projectPath(slug), { scroll: false });
  }

  useEffect(() => {
    const page = document.getElementById("internal-page");
    const scrollY = window.scrollY;

    if (page) page.setAttribute("inert", "");
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        routerRef.current.push(portfolioReturnHref());
        return;
      }

      if (event.key !== "Tab") return;
      const shell = shellRef.current;
      if (!shell) return;
      const nodes = focusable(shell);
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      if (!active || !shell.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first)?.focus();
        return;
      }

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (page) page.removeAttribute("inert");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  useEffect(() => {
    closeRef.current?.focus();
  }, [project.slug]);

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        tabIndex={-1}
        className="absolute inset-0 bg-[rgba(0,0,0,0.76)] backdrop-blur-[2px]"
        aria-label="Close project"
        onClick={close}
      />
      <div className="pointer-events-none absolute inset-0 flex justify-center split:items-center split:px-5 split:py-5">
        <div
          ref={shellRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="pointer-events-auto relative flex h-full w-full split:h-auto split:w-auto split:max-w-full split:items-stretch split:gap-3.5"
        >
          <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#fffdfb] text-ink split:h-auto split:max-h-[calc(100dvh-2.5rem)] split:w-[min(77.5rem,calc(100vw-8.5rem))] split:rounded-[1.375rem] split:shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
            <header className="z-20 flex shrink-0 items-center justify-between gap-3 bg-[#fffdfb] px-4 py-3 split:absolute split:top-3 split:right-3 split:bg-transparent split:p-0">
              <p className="min-w-0 truncate text-sm font-semibold tracking-wide split:hidden">{project.title}</p>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close project"
                className="ml-auto grid size-11 shrink-0 place-items-center rounded-full text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink split:bg-[#f6f3ef]"
              >
                <X className="size-5" strokeWidth={1.75} aria-hidden="true" />
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <article className={`px-5 pt-2 sm:px-10 ${hireVisible ? "pb-8 split:pb-36" : "pb-12 split:pb-14"}`}>
                <Creator />
                <h1 id={titleId} className="mt-8 text-[clamp(2.1rem,4vw,3.4rem)] font-medium tracking-tight">
                  {project.title}
                </h1>
                <p className="mt-3 text-base text-ink/60">{subtitle}</p>
                <Hero src={hero} category={project.category} />
                {project.shortDescription ? (
                  <p className="mt-8 max-w-2xl text-[1.05rem] leading-relaxed text-ink/75">{project.shortDescription}</p>
                ) : null}
                {facts.length > 0 ? (
                  <dl className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {facts.map((fact) => (
                      <div key={fact.label}>
                        <dt className="text-xs font-semibold tracking-[0.16em] text-ink/45 uppercase">{fact.label}</dt>
                        <dd className="mt-2 text-base">{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                {project.fullDescription ? (
                  <section className="mt-12" aria-labelledby={`${titleId}-story`}>
                    <h2 id={`${titleId}-story`} className="text-sm font-semibold tracking-[0.16em] uppercase">
                      The brief
                    </h2>
                    <p className="mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-ink/75">{project.fullDescription}</p>
                  </section>
                ) : null}
                {tools.length > 0 ? (
                  <section className="mt-12 split:hidden" aria-labelledby={`${titleId}-tools`}>
                    <h2 id={`${titleId}-tools`} className="text-sm font-semibold tracking-[0.16em] uppercase">
                      Used to make this
                    </h2>
                    <ul className="mt-4 flex flex-wrap gap-4">
                      {tools.map((id) => (
                        <ToolItem key={id} id={id} />
                      ))}
                    </ul>
                  </section>
                ) : null}
                <section className="mt-12 split:hidden" aria-labelledby={`${titleId}-find`}>
                  <h2 id={`${titleId}-find`} className="text-sm font-semibold tracking-[0.16em] uppercase">
                    Find me
                  </h2>
                  <ul className="mt-4 flex flex-wrap gap-4">
                    {contactLinks().map((item) => (
                      <ContactItem key={item.id} item={item} />
                    ))}
                  </ul>
                </section>
                {project.galleryImages.length > 0 ? (
                  <ul className="mt-12 grid gap-4">
                    {project.galleryImages.map((src) => (
                      <li key={src}>
                        <Artwork src={src} />
                      </li>
                    ))}
                  </ul>
                ) : null}
                {project.credits.length > 0 ? (
                  <section className="mt-12" aria-labelledby={`${titleId}-credits`}>
                    <h2 id={`${titleId}-credits`} className="text-sm font-semibold tracking-[0.16em] uppercase">
                      Credits
                    </h2>
                    <ul className="mt-4 space-y-2 text-[1.02rem] text-ink/75">
                      {project.credits.map((credit) => (
                        <li key={`${credit.role}-${credit.name}`}>
                          <span className="text-ink">{credit.role}. </span>
                          {credit.name}
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
                <nav aria-label="Adjacent projects" className="mt-14 flex items-center justify-between gap-4 text-sm">
                  <Link
                    href={`/portfolio/${previous.slug}`}
                    scroll={false}
                    onClick={(event) => openProject(event, previous.slug)}
                    className="rounded-sm text-ink/70 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                  >
                    <span aria-hidden="true">← </span>
                    <span className="sr-only">Previous project: </span>
                    {previous.title}
                  </Link>
                  <Link
                    href={`/portfolio/${next.slug}`}
                    scroll={false}
                    onClick={(event) => openProject(event, next.slug)}
                    className="rounded-sm text-right text-ink/70 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                  >
                    <span className="sr-only">Next project: </span>
                    {next.title}
                    <span aria-hidden="true"> →</span>
                  </Link>
                </nav>
              </article>
            </div>
            {hireVisible ? (
              <div className="shrink-0 border-t border-ink/10 bg-[#fffdfb] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] split:hidden">
                <HireCard compact onDismiss={() => setHireVisible(false)} />
              </div>
            ) : null}
            {hireVisible ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 hidden justify-center px-8 split:flex">
                <div className="pointer-events-auto">
                  <HireCard onDismiss={() => setHireVisible(false)} />
                </div>
              </div>
            ) : null}
          </div>
          <ActionRail tools={tools} />
        </div>
      </div>
    </div>
  );
}

function Creator() {
  return (
    <div className="flex items-center gap-3 pr-12">
      <Image
        src={site.portraitSrc}
        alt=""
        width={site.portraitWidth}
        height={site.portraitHeight}
        className="size-10 rounded-full object-cover"
      />
      <div>
        <p className="text-sm font-semibold leading-none">Edrisa</p>
        <p className="mt-1 text-xs text-ink/55">Creative Director & Designer</p>
      </div>
    </div>
  );
}

function Hero({ src, category }: { src: string | null; category: PortfolioProject["category"] }) {
  if (!src) {
    return <div className={`mt-8 aspect-[16/10] rounded-2xl ${projectTones[category]}`} aria-hidden="true" />;
  }

  return (
    <figure className="mt-8 overflow-hidden rounded-2xl">
      <Artwork src={src} priority />
    </figure>
  );
}

function Artwork({ src, priority = false }: { src: string; priority?: boolean }) {
  return (
    // Dimensions are unknown until the file is supplied, so the image keeps its own ratio.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="block h-auto w-full" fetchPriority={priority ? "high" : "auto"} />
  );
}

function ActionRail({ tools }: { tools: SoftwareId[] }) {
  const contacts = contactLinks();

  return (
    <aside className="hidden shrink-0 flex-col items-center justify-center gap-2.5 self-center split:flex" aria-label="Project actions">
      {tools.length > 0 ? (
        <ul className="flex flex-col gap-2.5">
          {tools.map((id) => {
            const tool = softwareRegistry[id];
            const Icon = tool.Icon;

            return (
              <li key={id}>
                <button type="button" aria-label={tool.label} className={`group relative ${circleClass}`}>
                  <Icon className="size-6" aria-hidden="true" />
                  <Tooltip label={tool.label} />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      {tools.length > 0 ? <div className="my-1 h-px w-7 bg-white/40" aria-hidden="true" /> : null}
      <ul className="flex flex-col gap-2.5">
        {contacts.map((item) => {
          const Icon = contactIcons[item.id];

          return (
            <li key={item.id}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={contactLabel(item)}
                className={`group relative ${circleClass}`}
              >
                <Icon className="size-5" aria-hidden="true" />
                <Tooltip label={item.label} />
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

function ToolItem({ id }: { id: SoftwareId }) {
  const tool = softwareRegistry[id];
  const Icon = tool.Icon;

  return (
    <li className="flex w-[4.5rem] flex-col items-center gap-1.5">
      <button type="button" aria-label={tool.label} className={circleClass}>
        <Icon className="size-6" aria-hidden="true" />
      </button>
      <span className="text-center text-xs leading-tight text-ink/70">{tool.shortLabel}</span>
    </li>
  );
}

function ContactItem({ item }: { item: ContactProfile }) {
  const Icon = contactIcons[item.id];

  return (
    <li className="flex w-[4.5rem] flex-col items-center gap-1.5">
      <a href={item.href} target="_blank" rel="noopener noreferrer" aria-label={contactLabel(item)} className={circleClass}>
        <Icon className="size-5" aria-hidden="true" />
      </a>
      <span className="text-center text-xs leading-tight text-ink/70">{item.label}</span>
    </li>
  );
}

function HireCard({ compact = false, onDismiss }: { compact?: boolean; onDismiss: () => void }) {
  return (
    <div className="relative flex items-center gap-3 rounded-2xl bg-mocha-deep py-3 pr-10 pl-3 text-[#f7f1ea] shadow-[0_12px_36px_rgba(28,18,14,0.22)]">
      <Image
        src={site.portraitSrc}
        alt=""
        width={site.portraitWidth}
        height={site.portraitHeight}
        className="size-10 shrink-0 rounded-full object-cover"
      />
      <p className={`min-w-0 flex-1 text-sm leading-snug ${compact ? "max-w-[11rem]" : "max-w-[14rem]"}`}>
        {compact ? "Available for the right project." : "Edrisa is available for the right project."}
      </p>
      <a
        href={socialLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded-full bg-[#f7f1ea] px-3.5 py-2 text-sm font-semibold text-mocha-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Hire Edrisa
      </a>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss availability"
        className="absolute top-2 right-2 grid size-6 place-items-center rounded-full text-white/70 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <X className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
      </button>
    </div>
  );
}

function Tooltip({ label }: { label: string }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute top-1/2 right-[calc(100%+0.6rem)] -translate-y-1/2 rounded-md bg-[#1c120e] px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      {label}
    </span>
  );
}

type ContactProfile = (typeof socialProfiles)[number];

function contactLinks() {
  return contactOrder.flatMap((id) => {
    const item = socialProfiles.find((profile) => profile.id === id);
    return item ? [item] : [];
  });
}

function contactLabel(item: ContactProfile) {
  return "iconLabel" in item ? item.iconLabel : item.label;
}

function projectFacts(project: PortfolioProject) {
  return [
    project.client ? { label: "Client", value: project.client } : null,
    project.year ? { label: "Year", value: String(project.year) } : null,
    project.role ? { label: "Role", value: project.role } : null,
    project.services.length > 0 ? { label: "Services", value: project.services.join(" / ") } : null,
  ].filter((fact): fact is { label: string; value: string } => fact !== null);
}

function portfolioReturnHref() {
  const category = new URLSearchParams(window.location.search).get("category");
  if (isCategory(category)) return `/portfolio?category=${encodeURIComponent(category)}`;
  const stored = sessionStorage.getItem(returnKey);
  if (stored === "/portfolio" || stored?.startsWith("/portfolio?")) return stored;
  return "/portfolio";
}

function projectPath(slug: string) {
  const back = portfolioReturnHref();
  const query = back.startsWith("/portfolio?") ? back.slice("/portfolio".length) : "";
  return `/portfolio/${slug}${query}`;
}

function isCategory(value: string | null): value is PortfolioCategory {
  return portfolioCategories.some((category) => category === value && category !== "All");
}

function focusable(root: HTMLElement) {
  return [...root.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")].filter(
    (node) => !node.hasAttribute("disabled") && node.getClientRects().length > 0,
  );
}
