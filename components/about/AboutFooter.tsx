import { aboutCopy } from "@/data/about";
import { socialProfiles } from "@/data/site";

export function AboutFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 flex flex-col gap-5 border-t border-ink/10 pt-8 text-sm text-ink/70 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p>© {year} Edrisa.</p>
        <p className="mt-1 max-w-[18rem] text-xs leading-relaxed text-ink/50">{aboutCopy.footerNote}</p>
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {socialProfiles.map((item) => (
          <li key={item.id}>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}
