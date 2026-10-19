"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft, ChevronRight, Phone, X } from "lucide-react";
import { FaBehance, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import { projectCta } from "@/data/project-cta";
import { EdrisaLogo } from "@/components/site/EdrisaLogo";
import { type PortfolioGalleryImage, type PortfolioProject } from "@/data/portfolio";
import type { PublicSocial } from "@/lib/content/site-shape";
import { softwareRegistry, type SoftwareId } from "@/data/software";

const returnKey = "edrisa-portfolio-return";
const focusKey = "edrisa-portfolio-focus";
const contactOrder = ["whatsapp", "behance", "linkedin"] as const;

const contactIcons = {
  behance: FaBehance,
  linkedin: FaLinkedinIn,
  whatsapp: FaWhatsapp,
} as const;

export function ProjectDetail({
  project,
  previous,
  next,
  categories,
  contact,
  ctaHref,
  source = "portfolio",
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
  source?: "portfolio" | "about";
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
  const releaseRef = useRef<() => void>(() => {});
  const scrollbarPointerRef = useRef(false);

  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  function close() {
    if (closingRef.current) return;
    closingRef.current = true;
    releaseRef.current();
    setClosing(true);
    const href = source === "about" ? "/about" : portfolioReturnHref(categories);
    requestAnimationFrame(() => {
      routerRef.current.push(href, { scroll: false });
    });
  }

  useEffect(() => {
    closeHandlerRef.current = close;
  });

  function pointerInScrollbar(scroller: HTMLDivElement, clientX: number) {
    const gutter = scroller.offsetWidth - scroller.clientWidth;
    if (gutter <= 0) return false;
    return clientX >= scroller.getBoundingClientRect().right - gutter;
  }

  function onScrollerPointerDown(event: MouseEvent<HTMLDivElement>) {
    scrollbarPointerRef.current = pointerInScrollbar(event.currentTarget, event.clientX);
  }

  function onScrollerClick(event: MouseEvent<HTMLDivElement>) {
    if (scrollbarPointerRef.current || pointerInScrollbar(event.currentTarget, event.clientX)) {
      scrollbarPointerRef.current = false;
      return;
    }
    const target = event.target;
    if (target instanceof Element && target.closest(".project-sheet, .project-rail")) return;
    close();
  }

  function openProject(event: MouseEvent<HTMLAnchorElement>, slug: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    router.push(source === "about" ? aboutWorkPath(slug) : projectPath(slug, categories), { scroll: false });
  }

  useEffect(() => {
    const page = document.getElementById("internal-page");
    const scrollY = window.scrollY;
    let released = false;

    if (page) page.setAttribute("inert", "");
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";

    function releasePortfolio() {
      if (released) return;
      released = true;
      page?.removeAttribute("inert");
      document.querySelector(".project-overlay")?.setAttribute("data-closing", "true");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      window.scrollTo(0, scrollY);
      const slug = sessionStorage.getItem(focusKey);
      const card = slug ? document.getElementById(`project-card-${slug}`) : null;
      if (card instanceof HTMLElement) card.focus({ preventScroll: true });
      else if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    }

    releaseRef.current = releasePortfolio;

    function onKeyDown(event: KeyboardEvent) {
      if (closingRef.current) return;
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

    function onTraverse(event: Event) {
      if ("navigationType" in event && event.navigationType !== "traverse") return;
      releasePortfolio();
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("popstate", releasePortfolio, true);
    const navigation = (window as Window & { navigation?: EventTarget }).navigation;
    navigation?.addEventListener("navigate", onTraverse);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("popstate", releasePortfolio, true);
      navigation?.removeEventListener("navigate", onTraverse);
      releaseRef.current = () => {};
      if (released) {
        page?.removeAttribute("inert");
        return;
      }
      page?.removeAttribute("inert");
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
    <div className="project-overlay fixed inset-0 z-50 overflow-hidden" data-closing={closing ? "true" : "false"}>
      <button
        type="button"
        tabIndex={-1}
        className="project-backdrop fixed inset-0 z-0"
        aria-label="Close project"
        onClick={close}
      />
      <div
        className="project-scroller absolute inset-0 z-10 overflow-y-scroll"
        onMouseDown={onScrollerPointerDown}
        onClick={onScrollerClick}
      >
      <div
        ref={shellRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="project-stage pointer-events-none relative z-10 mx-auto flex min-h-full w-full justify-center split:items-start split:gap-4 split:py-6"
      >
        <div
          className="project-sheet pointer-events-auto relative w-full min-w-0 bg-[#070709] text-ink split:max-w-[1400px] split:flex-1 split:rounded-[1.375rem] split:shadow-[0_24px_70px_rgba(0,0,0,0.28)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="pointer-events-none sticky top-6 z-30 hidden h-0 split:block">
            <button
              data-close="desktop"
              type="button"
              onClick={close}
              aria-label="Close project"
              className="pointer-events-auto absolute top-5 right-5 grid size-11 place-items-center rounded-full bg-[#f4efe8] text-[#070709] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <X className="size-5" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
          <div className="sticky top-0 z-20 flex justify-end bg-[#070709] px-3 py-2 split:hidden">
            <button
              ref={closeRef}
              data-close="mobile"
              type="button"
              onClick={close}
              aria-label="Close project"
              className="grid size-11 place-items-center rounded-full bg-[#f4efe8] text-[#070709] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <X className="size-5" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
          <header className="project-case-header bg-[#070709] px-5 text-white sm:px-8 split:rounded-t-[1.375rem] split:pr-20">
            <h1 id={titleId} className="text-[clamp(2.15rem,3.6vw,3.25rem)] leading-[1.02] font-semibold tracking-tight text-white">
              {project.title}
            </h1>
            <p className="mt-3 text-base leading-snug text-white/72">By Kasibante Edrisa · Edrisa Studio</p>
            {categoryNames.length > 0 || project.role ? (
              <div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:flex-row sm:gap-12">
                {categoryNames.length > 0 ? (
                  <div>
                    <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-white/58 uppercase">Category</p>
                    <p className="mt-1 text-base leading-snug text-[#f7f4ff]">{categoryNames.join(" · ")}</p>
                  </div>
                ) : null}
                {project.role ? (
                  <div>
                    <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-white/58 uppercase">Role</p>
                    <p className="mt-1 text-base leading-snug text-[#f7f4ff]">{project.role}</p>
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
            <p className="px-5 py-10 text-center text-base text-white/70 sm:px-8">Project presentation coming soon.</p>
          )}
          <ProjectClose
            tools={tools}
            profiles={contact.profiles}
            callHref={contact.callHref}
            ctaHref={ctaHref}
            previous={previous}
            next={next}
            source={source}
            onOpen={openProject}
          />
        </div>
        <ActionRail tools={tools} profiles={contact.profiles} callHref={contact.callHref} />
      </div>
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

function ProjectClose({
  tools,
  profiles,
  callHref,
  ctaHref,
  previous,
  next,
  source,
  onOpen,
}: {
  tools: SoftwareId[];
  profiles: PublicSocial[];
  callHref: string | null;
  ctaHref: string;
  previous: { slug: string; title: string };
  next: { slug: string; title: string };
  source: "portfolio" | "about";
  onOpen: (event: MouseEvent<HTMLAnchorElement>, slug: string) => void;
}) {
  const contacts = orderedContacts(profiles);
  const hasActions = tools.length > 0 || contacts.length > 0 || Boolean(callHref);

  return (
    <div className="project-end">
      {hasActions ? (
        <section aria-label="Contact" className="project-contact split:hidden">
          <p className="project-contact-kicker">Elsewhere on the internet</p>
          <div className="project-contact-rule" aria-hidden="true" />
          <ul className="project-contact-list">
            {contacts.map((item) => (
              <li key={item.id}>
                <ContactLink item={item} />
              </li>
            ))}
            {callHref ? (
              <li>
                <CallLink href={callHref} />
              </li>
            ) : null}
          </ul>
          {tools.length > 0 ? (
            <ul className="mt-4 flex flex-wrap justify-center gap-2">
              {tools.map((id) => (
                <li key={id}>
                  <ToolButton id={id} />
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}
      <ProjectCta href={ctaHref} />
      <nav aria-label="Adjacent projects" className="project-footer-navigation">
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <Link
            href={source === "about" ? aboutWorkPath(previous.slug) : `/portfolio/${previous.slug}`}
            scroll={false}
            onClick={(event) => onOpen(event, previous.slug)}
            aria-label={`Previous project: ${previous.title}`}
            className="project-neighbor group flex min-h-32 items-center gap-4 rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-5 text-white hover:border-white/28 hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:min-h-36 sm:px-6"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#5446DF,#B52EE5)] text-white">
              <ChevronLeft className="project-neighbor-icon size-7 [--neighbor-shift:-0.3rem]" strokeWidth={2.25} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[0.72rem] font-semibold tracking-[0.16em] text-white/55 uppercase">Previous project</span>
              <span className="mt-1.5 block text-[1.35rem] leading-tight font-semibold tracking-tight sm:text-[1.6rem]">{previous.title}</span>
            </span>
          </Link>
          <Link
            href={source === "about" ? aboutWorkPath(next.slug) : `/portfolio/${next.slug}`}
            scroll={false}
            onClick={(event) => onOpen(event, next.slug)}
            aria-label={`Next project: ${next.title}`}
            className="project-neighbor group flex min-h-32 items-center justify-between gap-4 rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-5 text-right text-white hover:border-white/28 hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:min-h-36 sm:px-6"
          >
            <span className="min-w-0 flex-1 text-right">
              <span className="block text-[0.72rem] font-semibold tracking-[0.16em] text-white/55 uppercase">Next project</span>
              <span className="mt-1.5 block text-[1.35rem] leading-tight font-semibold tracking-tight sm:text-[1.6rem]">{next.title}</span>
            </span>
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#5446DF,#B52EE5)] text-white">
              <ChevronRight className="project-neighbor-icon size-7 [--neighbor-shift:0.3rem]" strokeWidth={2.25} aria-hidden="true" />
            </span>
          </Link>
        </div>
      </nav>
      <div className="project-end-mark" aria-hidden="true">
        <div className="project-end-logo">
          <EdrisaLogo className="project-end-logo-image" />
        </div>
      </div>
    </div>
  );
}

function ActionRail({
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
    <aside
      className="project-rail pointer-events-auto sticky top-6 z-20 hidden h-[calc(100dvh-3rem)] shrink-0 split:block"
      aria-label="Contact"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="absolute top-1/2 left-0 flex w-max -translate-y-1/2 flex-col items-center gap-3">
        {tools.length > 0 ? (
          <ul className="flex flex-col items-center gap-2">
            {tools.map((id) => (
              <li key={id}>
                <ToolButton id={id} compact />
              </li>
            ))}
          </ul>
        ) : null}
        {tools.length > 0 ? <div className="h-px w-7 bg-white/30" aria-hidden="true" /> : null}
        <ul className="flex flex-col items-center gap-3">
          {contacts.map((item) => (
            <li key={item.id}>
              <ContactLink item={item} rail />
            </li>
          ))}
          {callHref ? (
            <li>
              <CallLink href={callHref} rail />
            </li>
          ) : null}
        </ul>
      </div>
    </aside>
  );
}

function ProjectCta({ href }: { href: string }) {
  return (
    <section aria-labelledby="project-cta-title" className="project-cta mx-auto w-full max-w-[34rem] rounded-[1.35rem] bg-[linear-gradient(112deg,#5446DF_0%,#6A3AE6_28%,#8A3AE9_54%,#A23DEB_78%,#B52EE5_100%)] px-6 py-10 text-center text-white sm:px-10 sm:py-12">
      <p id="project-cta-title" className="text-[clamp(1.45rem,2.6vw,2rem)] leading-tight font-bold tracking-tight text-white">
        {projectCta.heading}
      </p>
      <a href={href} className="project-cta-button mt-6 inline-flex items-center gap-2 rounded-full bg-[#f6f3ff] px-7 py-3.5 text-lg font-semibold tracking-tight text-[#2a1868] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
        {projectCta.label}
        <ArrowRight className="project-cta-arrow size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
      </a>
    </section>
  );
}

const railCircleClass = "grid size-12 place-items-center rounded-full bg-[#f4efe8] text-[#2e211c]";
const railLinkClass =
  "flex flex-col items-center gap-1 rounded-md text-[#f7f1ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

function ToolButton({ id, compact = false }: { id: SoftwareId; compact?: boolean }) {
  const tool = softwareRegistry[id];
  const Icon = tool.Icon;

  if (compact) {
    return (
      <button type="button" aria-label={tool.label} className={railCircleClass}>
        <Icon className="size-5" aria-hidden="true" />
      </button>
    );
  }

  return (
    <button type="button" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-sm font-medium text-white hover:border-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
      <Icon className="size-4" aria-hidden="true" />
      {tool.label}
    </button>
  );
}

function ContactLink({ item, rail = false }: { item: PublicSocial; rail?: boolean }) {
  const Icon = contactIcons[item.id];

  if (rail) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" aria-label={contactLabel(item)} className={railLinkClass}>
        <span className={railCircleClass}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className="text-center text-[0.68rem] leading-tight text-white/75">{item.label}</span>
      </a>
    );
  }

  return (
    <a href={item.href} target="_blank" rel="noopener noreferrer" aria-label={contactLabel(item)} className="project-contact-action">
      <Icon className="project-contact-icon" aria-hidden="true" />
      <span>{item.label}</span>
    </a>
  );
}

function CallLink({ href, rail = false }: { href: string; rail?: boolean }) {
  if (rail) {
    return (
      <a href={href} aria-label="Call Edrisa" className={railLinkClass}>
        <span className={railCircleClass}>
          <Phone className="size-5" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span className="text-center text-[0.68rem] leading-tight text-white/75">Call Now</span>
      </a>
    );
  }

  return (
    <a href={href} aria-label="Call Edrisa" className="project-contact-action">
      <Phone className="project-contact-icon" strokeWidth={1.75} aria-hidden="true" />
      <span>Call Now</span>
    </a>
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

function aboutWorkPath(slug: string) {
  return `/about?work=${encodeURIComponent(slug)}`;
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
