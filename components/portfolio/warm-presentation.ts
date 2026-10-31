import { getImageProps } from "next/image";

export const presentationImageSizes = "(min-width: 960px) 1400px, 100vw";
export const presentationImageQuality = 90;

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

export function warmPresentationImages(sources: string[], isCancelled: () => boolean) {
  const pending: Array<() => void> = [];
  let stopped = false;
  let active = 0;
  let cursor = 0;
  let idleId = 0;
  const idleWindow = window as IdleWindow;
  const urgentCount = Math.min(3, sources.length);

  function stop() {
    stopped = true;
    if (idleId && idleWindow.cancelIdleCallback) idleWindow.cancelIdleCallback(idleId);
    idleId = 0;
    for (const cancel of pending) cancel();
    pending.length = 0;
  }

  function launch(src: string) {
    if (stopped || isCancelled()) return;
    let srcSet = "";
    try {
      const prepared = getImageProps({
        alt: "",
        src,
        fill: true,
        sizes: presentationImageSizes,
        quality: presentationImageQuality,
      }).props;
      srcSet = prepared.srcSet ?? "";
      if (!srcSet && prepared.src) srcSet = prepared.src;
    } catch {
      return;
    }
    if (!srcSet) return;

    const image = new Image();
    const chosen = chosenCandidate(srcSet);
    active += 1;
    const finish = () => {
      image.onload = null;
      image.onerror = null;
      active = Math.max(0, active - 1);
      pump();
    };
    image.onload = finish;
    image.onerror = finish;
    image.src = chosen || srcSet.split(",")[0]?.trim().split(/\s+/)[0] || "";
    if (!image.src) {
      active -= 1;
      return;
    }
    pending.push(() => {
      image.onload = null;
      image.onerror = null;
      image.src = "";
    });
  }

  function pump() {
    if (stopped || isCancelled()) return;
    const limit = cursor < urgentCount ? 2 : 1;
    while (active < limit && cursor < sources.length) {
      if (cursor >= urgentCount) {
        if (idleId) return;
        const startRest = () => {
          idleId = 0;
          if (stopped || isCancelled()) return;
          const src = sources[cursor];
          cursor += 1;
          if (src) launch(src);
        };
        if (idleWindow.requestIdleCallback) {
          idleId = idleWindow.requestIdleCallback(startRest, { timeout: 1200 });
        } else {
          const timeout = window.setTimeout(startRest, 280);
          pending.push(() => window.clearTimeout(timeout));
        }
        return;
      }
      const src = sources[cursor];
      cursor += 1;
      if (src) launch(src);
    }
  }

  pump();
  return stop;
}

function chosenCandidate(srcSet: string) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const target = (window.innerWidth >= 960 ? 1400 : window.innerWidth) * dpr;
  const candidates = srcSet
    .split(",")
    .map((part) => {
      const [url, descriptor] = part.trim().split(/\s+/);
      return { url, width: Number.parseInt(descriptor ?? "", 10) };
    })
    .filter((item): item is { url: string; width: number } => Boolean(item.url) && Number.isFinite(item.width))
    .sort((a, b) => a.width - b.width);
  return (candidates.find((item) => item.width >= target) ?? candidates[candidates.length - 1])?.url;
}
