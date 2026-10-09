import { EdrisaLogo } from "@/components/site/EdrisaLogo";
import { site, socialProfiles } from "@/data/site";

export function InternalFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-16 overflow-hidden rounded-[1.35rem] bg-[#2e211c] text-[#f7f1ea]">
      <div className="relative z-10 flex flex-col gap-6 px-6 pt-8 sm:flex-row sm:items-start sm:justify-between sm:px-8 sm:pt-10">
        <div>
          <p className="max-w-[18rem] text-sm leading-relaxed text-white/72">{site.footerNote}</p>
          <p className="mt-4 text-sm text-white/88">© {year} Edrisa.</p>
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm sm:flex-col sm:items-end">
          {socialProfiles.map((item) => (
            <li key={item.id}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm text-white/70 underline-offset-4 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="relative z-0 mt-8 overflow-hidden px-4 sm:mt-6 sm:px-6" aria-hidden="true">
        <EdrisaLogo className="h-auto w-[92%] max-w-none translate-y-3 sm:w-[52%] sm:translate-y-5" />
      </div>
    </footer>
  );
}
