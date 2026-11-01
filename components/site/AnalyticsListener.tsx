"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackEvent, trackPageView } from "@/lib/analytics";

const scrollMarks = [25, 50, 75, 100] as const;

function pagePath() {
  const query = window.location.search;
  return `${window.location.pathname}${query}`;
}

function projectSlug(pathname: string, search = "") {
  const match = pathname.match(/^\/portfolio\/([^/]+)$/);
  if (match?.[1]) return match[1];
  if (pathname === "/about" && search) {
    const work = new URLSearchParams(search).get("work");
    if (work) return work;
  }
  return undefined;
}

function importantPage(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/about" ||
    pathname === "/services" ||
    pathname === "/portfolio" ||
    pathname === "/contact" ||
    pathname.startsWith("/portfolio/")
  );
}

function buttonLocation(anchor: HTMLAnchorElement) {
  if (anchor.closest(".project-overlay, .project-rail, .project-sheet")) return "project";
  if (anchor.closest(".home-social")) return "home";
  if (anchor.closest(".contact-details, .contact-social, .contact-form")) return "contact";
  if (anchor.closest("footer")) return "footer";
  return "page";
}

function platformFor(url: URL) {
  const host = url.hostname.replace(/^www\./, "");
  if (host === "behance.net" || host.endsWith(".behance.net")) return "behance";
  if (host === "linkedin.com" || host.endsWith(".linkedin.com")) return "linkedin";
  if (host === "wa.me" || host === "whatsapp.com" || host.endsWith(".whatsapp.com")) return "whatsapp";
  if (host === "instagram.com" || host.endsWith(".instagram.com")) return "instagram";
  if (host === "facebook.com" || host.endsWith(".facebook.com")) return "facebook";
  return null;
}

function publicDestination(url: URL) {
  const host = url.hostname.replace(/^www\./, "");
  if (host === "wa.me" || host === "whatsapp.com" || host.endsWith(".whatsapp.com")) return "https://wa.me/";
  return url.toString().slice(0, 500);
}

export function AnalyticsListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const seenScroll = useRef(new Set<number>());

  useEffect(() => {
    const path = search ? `${pathname}?${search}` : pathname;
    const slug = projectSlug(pathname, search);
    let cancelled = false;
    let tries = 0;
    const send = () => {
      if (cancelled) return;
      if (typeof window.gtag !== "function") {
        if (tries < 20) {
          tries += 1;
          window.setTimeout(send, 250);
        }
        return;
      }
      trackPageView(path, slug ? { project_slug: slug } : {});
      if (pathname === "/contact") {
        trackEvent("contact_page_view", { source_page: pathname, page_path: path });
      }
    };
    send();
    return () => {
      cancelled = true;
    };
  }, [pathname, search]);

  useEffect(() => {
    if (!importantPage(pathname)) return;
    seenScroll.current = new Set();
    const slug = projectSlug(pathname, search);
    let frame = 0;
    const scroller = document.querySelector(".project-scroller");
    const target = scroller instanceof HTMLElement ? scroller : null;

    const measure = () => {
      const scrollTop = target ? target.scrollTop : window.scrollY;
      const viewport = target ? target.clientHeight : window.innerHeight;
      const scrollHeight = target ? target.scrollHeight : document.documentElement.scrollHeight;
      const height = scrollHeight - viewport;
      const depth = height <= 0 ? 100 : Math.min(100, Math.round((scrollTop / height) * 100));
      for (const mark of scrollMarks) {
        if (depth < mark || seenScroll.current.has(mark)) continue;
        const sent = trackEvent("scroll_depth", {
          percentage: mark,
          page_path: pagePath(),
          ...(slug ? { project_slug: slug } : {}),
        });
        if (sent) seenScroll.current.add(mark);
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        measure();
      });
    };

    measure();
    const scrollTarget: HTMLElement | Window = target ?? window;
    scrollTarget.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scrollTarget.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pathname, search]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement) || !anchor.href) return;

      const location = buttonLocation(anchor);
      const source = window.location.pathname;

      if (anchor.protocol === "mailto:") {
        trackEvent("email_click", { source_page: source, button_location: location });
        return;
      }
      if (anchor.protocol === "tel:") {
        trackEvent("phone_click", { source_page: source, button_location: location });
        return;
      }

      let url: URL;
      try {
        url = new URL(anchor.href);
      } catch {
        return;
      }
      if (url.protocol !== "http:" && url.protocol !== "https:") return;
      if (url.hostname === window.location.hostname) return;

      const platform = platformFor(url);
      if (platform === "whatsapp") {
        trackEvent("whatsapp_click", { source_page: source, button_location: location });
      }
      if (platform) {
        trackEvent("social_link_click", { platform, source_page: source, button_location: location });
      }
      trackEvent("outbound_link_click", {
        destination_url: publicDestination(url),
        link_text: (anchor.textContent || anchor.getAttribute("aria-label") || "").trim().slice(0, 120),
        source_page: source,
      });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
