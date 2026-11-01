"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

function isPortfolioSurface(path: string) {
  return path === "/portfolio" || path.startsWith("/portfolio/");
}

export function ScrollToTop() {
  const pathname = usePathname();
  const previous = useRef<string | null>(null);

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  }, []);

  useEffect(() => {
    const prior = previous.current;
    previous.current = pathname;
    if (prior && isPortfolioSurface(prior) && isPortfolioSurface(pathname)) return;
    if (window.location.hash) return;
    const frame = requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
