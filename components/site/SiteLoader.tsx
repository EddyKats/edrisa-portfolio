"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const settleMs = 12000;

function waitForWindowLoad() {
  if (document.readyState === "complete") return Promise.resolve();
  return new Promise<void>((resolve) => {
    window.addEventListener("load", () => resolve(), { once: true });
  });
}

function waitForElement(el: HTMLImageElement | HTMLVideoElement) {
  if (el instanceof HTMLImageElement) {
    if (el.complete && el.naturalWidth > 0) return el.decode?.().catch(() => undefined) ?? Promise.resolve();
    return new Promise<void>((resolve) => {
      el.addEventListener("load", () => resolve(), { once: true });
      el.addEventListener("error", () => resolve(), { once: true });
    });
  }
  if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return Promise.resolve();
  return new Promise<void>((resolve) => {
    el.addEventListener("loadeddata", () => resolve(), { once: true });
    el.addEventListener("error", () => resolve(), { once: true });
  });
}

async function waitForPageMedia() {
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  const media = [...document.querySelectorAll("img, video")] as (HTMLImageElement | HTMLVideoElement)[];
  await Promise.all(media.map((item) => waitForElement(item)));
  if (document.fonts?.ready) await document.fonts.ready;
}

export function SiteLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (pathname.startsWith("/studio")) {
      setVisible(false);
      return;
    }

    let cancelled = false;
    setVisible(true);

    const timeout = window.setTimeout(() => {
      if (!cancelled) setVisible(false);
    }, settleMs);

    void (async () => {
      await waitForWindowLoad();
      await waitForPageMedia();
      if (!cancelled) setVisible(false);
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [pathname]);

  if (pathname.startsWith("/studio") || !visible) return null;

  return (
    <div className="site-route-loader" role="status">
      <span className="sr-only">Loading</span>
      <div className="loader" aria-hidden="true" />
    </div>
  );
}
