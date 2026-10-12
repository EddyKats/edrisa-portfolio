import { EdrisaLogo } from "@/components/site/EdrisaLogo";
import { getPublicSite } from "@/lib/content/site";

export async function InternalFooter() {
  const site = await getPublicSite();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-16 overflow-hidden rounded-[1.35rem] bg-[#2e211c] px-8 pt-10 pb-8 text-[#f7f1ea] sm:px-10 sm:pt-12 sm:pb-10">
      <div className="relative z-10 flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-[18rem] text-sm leading-relaxed text-white/72">
          <p>Designed with intent.</p>
          <p>Built with unreasonable attention to detail.</p>
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm sm:flex-col sm:items-end sm:text-right">
          {site.socials.map((item) => (
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
          {site.callHref ? (
            <li>
              <a
                href={site.callHref}
                className="rounded-sm text-white/70 underline-offset-4 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Call
              </a>
            </li>
          ) : null}
        </ul>
      </div>
      <div className="relative z-0 mt-12 flex justify-center sm:mt-14" aria-hidden="true">
        <EdrisaLogo className="footer-wordmark h-auto w-[92%] max-w-[46rem] sm:w-[74%]" />
      </div>
      <p className="relative z-10 mt-6 text-sm text-white/70">© {year} Edrisa.</p>
    </footer>
  );
}
