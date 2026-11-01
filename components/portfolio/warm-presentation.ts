export const presentationImageSizes = "(min-width: 960px) 1400px, 100vw";
export const presentationImageQuality = 90;
export const presentationLookahead = 3;

export function watchPresentationLookahead(scroller: HTMLElement, onWarmThrough: (index: number) => void) {
  const items = [...scroller.querySelectorAll<HTMLElement>(".presentation-stream > li")];
  if (items.length === 0) return () => {};

  let stopped = false;
  const bump = (index: number) => {
    if (stopped || index < 0) return;
    onWarmThrough(Math.min(items.length - 1, index + presentationLookahead));
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const index = items.indexOf(entry.target as HTMLElement);
        if (index >= 0) bump(index);
      }
    },
    { root: scroller, rootMargin: "0px 0px 60% 0px", threshold: 0 },
  );
  for (const item of items) observer.observe(item);

  return () => {
    stopped = true;
    observer.disconnect();
  };
}
