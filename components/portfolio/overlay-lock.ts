import { portfolioFocusKey } from "@/components/portfolio/portfolio-session";

let holders = 0;
let scrollY = 0;

export function holdPageScroll() {
  const page = document.getElementById("internal-page");
  if (holders === 0) {
    scrollY = window.scrollY;
    page?.setAttribute("inert", "");
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
  }
  holders += 1;
  let released = false;

  return function release() {
    if (released) return;
    released = true;
    queueMicrotask(() => {
      holders = Math.max(0, holders - 1);
      if (holders > 0) return;
      page?.removeAttribute("inert");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      window.scrollTo(0, scrollY);
      const slug = sessionStorage.getItem(portfolioFocusKey);
      const card = slug ? document.getElementById(`project-card-${slug}`) : null;
      if (card instanceof HTMLElement) card.focus({ preventScroll: true });
      else if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    });
  };
}
