"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft, ChevronRight, Phone, X } from "lucide-react";
import { FaBehance, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import { type PortfolioGalleryImage, type PortfolioProject } from "@/data/portfolio";
import type { PublicSocial } from "@/lib/content/site-shape";
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

export function ProjectDetail({
  project,
  previous,
  next,
  categories,
  contact,
  ctaHref,
}: {
  project: PortfolioProject;
  previous: { slug: string; title: string };
  next: { slug: string; title: string };
  categories: string[];
  contact: {
    profiles: PublicSocial[];
    callHref: string | null;
  };
  ctaHref: string;
}) {
  const router = useRouter();
  const routerRef = useRef(router);
  const shellRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closingRef = useRef(false);
  const [closing, setClosing] = useState(false);
  const titleId = `project-${project.slug}-title`;
  const tools = project.software;
  const categoryNames = project.categories?.length ? project.categories : project.category ? [project.category] : [];
  const boards = project.galleryImages;

  const closeHandlerRef = useRef<() => void>(() => {});

  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  function close() {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    const href = portfolioReturnHref(categories);
    requestAnimationFrame(() => {
      routerRef.current.push(href, { scroll: false });
    });
  }

  useEffect(() => {
    closeHandlerRef.current = close;
  });

  function openProject(event: MouseEvent<HTMLAnchorElement>, slug: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    router.push(projectPath(slug, categories), { scroll: false });
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
        closeHandlerRef.current();
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
  }, [categories]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 60rem)").matches;
    const button = shellRef.current?.querySelector<HTMLButtonElement>(
      desktop ? "[data-close='desktop']" : "[data-close='mobile']",
    );
    (button ?? closeRef.current)?.focus();
  }, [project.slug]);

  return (
    <div className="project-overlay fixed inset-0 z-50 overflow-y-scroll" data-closing={closing ? "true" : "false"}>
      <button
        type="button"
        tabIndex={-1}
        className="fixed inset-0 bg-[rgba(0,0,0,0.76)] backdrop-blur-[2px]"
        aria-label="Close project"
        onClick={close}
      />
      <div
        ref={shellRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="project-stage pointer-events-none relative z-10 mx-auto flex min-h-full w-full justify-center split:items-start split:gap-4 split:py-6"
      >
        <div className="project-sheet pointer-events-auto relative w-full min-w-0 bg-[#fffdfb] text-ink split:max-w-[1400px] split:flex-1 split:rounded-[1.375rem] split:shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
          <div className="pointer-events-none sticky top-6 z-30 hidden h-0 split:block">
            <button
              data-close="desktop"
              type="button"
              onClick={close}
              aria-label="Close project"
              className="pointer-events-auto absolute top-5 right-5 grid size-11 place-items-center rounded-full border border-ink/10 bg-[#fffdfb] text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <X className="size-5" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
          <div className="sticky top-0 z-20 flex justify-end bg-[#fffdfb] px-3 py-2 split:hidden">
            <button
              ref={closeRef}
              data-close="mobile"
              type="button"
              onClick={close}
              aria-label="Close project"
              className="grid size-11 place-items-center rounded-full text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <X className="size-5" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
          <header className="project-case-header px-5 sm:px-8 split:pr-20">
            <h1 id={titleId} className="text-[clamp(2.15rem,3.6vw,3.25rem)] leading-[1.02] font-semibold tracking-tight">
              {project.title}
            </h1>
            {categoryNames.length > 0 || project.role ? (
              <div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:flex-row sm:gap-12">
                {categoryNames.length > 0 ? (
                  <div>
                    <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-ink/45 uppercase">Category</p>
                    <p className="mt-1 text-base leading-snug text-ink">{categoryNames.join(" · ")}</p>
                  </div>
                ) : null}
                {project.role ? (
                  <div>
                    <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-ink/45 uppercase">Role</p>
                    <p className="mt-1 text-base leading-snug text-ink">{project.role}</p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </header>
          {boards.length > 0 ? (
            <ul className="presentation-stream">
              {boards.map((image, index) => (
                <li key={`${image.src}-${index}`}>
                  <Board image={image} title={project.title} priority={index === 0} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-base text-ink/55 sm:px-8">Project presentation coming soon.</p>
          )}
          <MobileActions tools={tools} profiles={contact.profiles} callHref={contact.callHref} />
          <ProjectCta href={ctaHref} className="border-t border-ink/12 px-5 py-5 split:hidden" />
          <nav aria-label="Adjacent projects" className="project-footer-navigation">
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-8">
              <Link
                href={`/portfolio/${previous.slug}`}
                scroll={false}
                onClick={(event) => openProject(event, previous.slug)}
                aria-label={`Previous project: ${previous.title}`}
                className="project-neighbor group flex min-h-28 items-center gap-4 rounded-sm px-1 py-3 hover:bg-ink/5 focus-visible:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
              >
                <ChevronLeft className="project-neighbor-icon size-10 shrink-0 [--neighbor-shift:-0.3rem]" strokeWidth={2.25} aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block text-[0.68rem] font-semibold tracking-[0.16em] text-ink/45 uppercase">Previous project</span>
                  <span className="mt-1 block text-xl leading-tight font-semibold tracking-tight">{previous.title}</span>
                </span>
              </Link>
              <Link
                href={`/portfolio/${next.slug}`}
                scroll={false}
                onClick={(event) => openProject(event, next.slug)}
                aria-label={`Next project: ${next.title}`}
                className="project-neighbor group flex min-h-28 items-center justify-end gap-4 rounded-sm px-1 py-3 text-right hover:bg-ink/5 focus-visible:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
              >
                <span className="min-w-0">
                  <span className="block text-[0.68rem] font-semibold tracking-[0.16em] text-ink/45 uppercase">Next project</span>
                  <span className="mt-1 block text-xl leading-tight font-semibold tracking-tight">{next.title}</span>
                </span>
                <ChevronRight className="project-neighbor-icon size-10 shrink-0 [--neighbor-shift:0.3rem]" strokeWidth={2.25} aria-hidden="true" />
              </Link>
            </div>
          </nav>
        </div>
        <ActionRail tools={tools} profiles={contact.profiles} callHref={contact.callHref} ctaHref={ctaHref} />
      </div>
    </div>
  );
}

function Board({ image, title, priority }: { image: PortfolioGalleryImage; title: string; priority: boolean }) {
  const kind = mediaKind(image);
  const ratio = image.width && image.height ? { aspectRatio: `${image.width} / ${image.height}` } : undefined;

  if (kind === "VIDEO") {
    const label = image.alt || `${title} video`;
    return (
      <video
        controls
        playsInline
        preload="metadata"
        aria-label={label}
        title={label}
        width={image.width ?? undefined}
        height={image.height ?? undefined}
        style={ratio}
        className="presentation-media"
      >
        <source src={image.src} type={image.mimeType ?? undefined} />
      </video>
    );
  }

  if (kind === "GIF") {
    return (
      // GIFs stay on a plain image element so the animation is not frozen by the optimizer.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image.src}
        alt={image.alt}
        width={image.width ?? undefined}
        height={image.height ?? undefined}
        style={ratio}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className="presentation-media"
      />
    );
  }

  if (image.width && image.height) {
    return (
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        sizes="(min-width: 960px) 1400px, 100vw"
        className="presentation-media"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image.src}
      alt={image.alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      className="presentation-media"
    />
  );
}

function mediaKind(image: PortfolioGalleryImage) {
  const path = image.src.split("?")[0]?.toLowerCase() ?? "";
  if (image.kind === "GIF" || image.mimeType === "image/gif" || path.endsWith(".gif")) return "GIF";
  if (image.kind === "VIDEO" || image.mimeType?.startsWith("video/") || path.endsWith(".mp4") || path.endsWith(".webm")) return "VIDEO";
  return "IMAGE";
}

function MobileActions({
  tools,
  profiles,
  callHref,
}: {
  tools: SoftwareId[];
  profiles: PublicSocial[];
  callHref: string | null;
}) {
  const contacts = orderedContacts(profiles);
  if (tools.length === 0 && contacts.length === 0 && !callHref) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-ink/12 px-5 py-5 split:hidden">
      {tools.map((id) => (
        <ToolButton key={id} id={id} />
      ))}
      {tools.length > 0 ? <span className="mx-1 h-7 w-px bg-ink/15" aria-hidden="true" /> : null}
      {contacts.map((item) => (
        <ContactLink key={item.id} item={item} />
      ))}
      {callHref ? <CallLink href={callHref} /> : null}
    </div>
  );
}

function ActionRail({
  tools,
  profiles,
  callHref,
  ctaHref,
}: {
  tools: SoftwareId[];
  profiles: PublicSocial[];
  callHref: string | null;
  ctaHref: string;
}) {
  const contacts = orderedContacts(profiles);

  return (
    <aside className="project-rail pointer-events-auto sticky top-6 z-20 hidden h-[calc(100dvh-3rem)] shrink-0 split:block" aria-label="Project actions">
      <div className="absolute top-1/2 left-0 flex w-max -translate-y-1/2 flex-col items-center gap-4">
        {tools.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {tools.map((id) => (
              <li key={id}>
                <ToolButton id={id} tooltip />
              </li>
            ))}
          </ul>
        ) : null}
        {tools.length > 0 ? <div className="h-px w-7 bg-white/40" aria-hidden="true" /> : null}
        <ul className="flex flex-col items-center gap-4">
          {contacts.map((item) => (
            <li key={item.id}>
              <ContactLink item={item} labeled />
            </li>
          ))}
          {callHref ? (
            <li>
              <CallLink href={callHref} labeled />
            </li>
          ) : null}
        </ul>
      </div>
      <ProjectCta href={ctaHref} dock />
    </aside>
  );
}

function ProjectCta({ href, className, dock = false }: { href: string; className?: string; dock?: boolean }) {
  return (
    <a
      href={href}
      className={
        dock
          ? "project-cta absolute inset-x-0 bottom-0 z-30 block rounded-2xl bg-[#2e211c] px-2 py-3 text-center text-[#f7f1ea] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          : `project-cta group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink ${className ?? ""}`
      }
    >
      <span className={`block text-[0.62rem] font-semibold tracking-[0.12em] uppercase ${dock ? "text-white/70" : "text-ink/45"}`}>
        Available for a project?
      </span>
      <span className={`mt-1.5 text-sm leading-tight font-semibold tracking-tight ${dock ? "block text-[#f7f1ea]" : "inline-flex items-center gap-1.5 text-ink"}`}>
        Start Something
        <ArrowRight className={`project-cta-arrow size-4 ${dock ? "ml-1 inline align-[-0.2em]" : "shrink-0"}`} strokeWidth={1.75} aria-hidden="true" />
      </span>
    </a>
  );
}

function ToolButton({ id, tooltip = false }: { id: SoftwareId; tooltip?: boolean }) {
  const tool = softwareRegistry[id];
  const Icon = tool.Icon;

  return (
    <button type="button" aria-label={tool.label} className={`group relative ${circleClass}`}>
      <Icon className="size-6" aria-hidden="true" />
      {tooltip ? <Tooltip label={tool.label} /> : null}
    </button>
  );
}

function ContactLink({ item, labeled = false }: { item: PublicSocial; labeled?: boolean }) {
  const Icon = contactIcons[item.id];

  if (labeled) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={contactLabel(item)}
        className="flex flex-col items-center gap-1.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <span className={circleClass}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className="text-center text-[0.7rem] leading-tight text-[#f7f1ea]">{item.label}</span>
      </a>
    );
  }

  return (
    <a href={item.href} target="_blank" rel="noopener noreferrer" aria-label={contactLabel(item)} className={circleClass}>
      <Icon className="size-5" aria-hidden="true" />
    </a>
  );
}

function CallLink({ href, labeled = false }: { href: string; labeled?: boolean }) {
  if (labeled) {
    return (
      <a
        href={href}
        aria-label="Call Edrisa"
        className="flex flex-col items-center gap-1.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <span className={circleClass}>
          <Phone className="size-5" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span className="text-center text-[0.7rem] leading-tight text-[#f7f1ea]">Call Now</span>
      </a>
    );
  }

  return (
    <a href={href} aria-label="Call Edrisa" className={circleClass}>
      <Phone className="size-5" strokeWidth={1.75} aria-hidden="true" />
    </a>
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

function orderedContacts(profiles: PublicSocial[]) {
  return contactOrder.flatMap((id) => {
    const item = profiles.find((profile) => profile.id === id);
    return item ? [item] : [];
  });
}

function contactLabel(item: PublicSocial) {
  return "iconLabel" in item ? item.iconLabel : item.label;
}

function portfolioReturnHref(categories: string[]) {
  const category = new URLSearchParams(window.location.search).get("category");
  if (category && categories.includes(category)) return `/portfolio?category=${encodeURIComponent(category)}`;
  const stored = sessionStorage.getItem(returnKey);
  if (stored === "/portfolio" || stored?.startsWith("/portfolio?")) return stored;
  return "/portfolio";
}

function projectPath(slug: string, categories: string[]) {
  const back = portfolioReturnHref(categories);
  const query = back.startsWith("/portfolio?") ? back.slice("/portfolio".length) : "";
  return `/portfolio/${slug}${query}`;
}

function focusable(root: HTMLElement) {
  return [...root.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")].filter(
    (node) => !node.hasAttribute("disabled") && node.getClientRects().length > 0,
  );
}
