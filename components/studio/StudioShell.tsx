import Link from "next/link";
import { signOut } from "@/auth";

const links = [
  { href: "/studio", label: "Dashboard" },
  { href: "/studio/projects", label: "Projects" },
  { href: "/studio/about", label: "About" },
  { href: "/studio/services", label: "Services" },
  { href: "/studio/clients", label: "Clients" },
  { href: "/studio/contact", label: "Contact" },
  { href: "/studio/home", label: "Home" },
  { href: "/studio/settings", label: "Site Settings" },
] as const;

export function StudioShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#f4f1ec] text-[#1c120e]" style={{ colorScheme: "light" }}>
      <div className="mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col md:flex-row">
        <aside className="flex shrink-0 flex-col bg-[#2e211c] text-[#f7f1ea] md:sticky md:top-0 md:h-dvh md:w-64">
          <div className="px-5 pt-6 pb-4">
            <p className="text-xs tracking-[0.18em] text-white/60 uppercase">Edrisa</p>
            <p className="mt-1 text-lg font-semibold">Studio</p>
          </div>
          <nav aria-label="Studio" className="flex gap-1 overflow-x-auto px-3 pb-4 md:flex-1 md:flex-col md:overflow-visible md:px-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="shrink-0 rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 px-4 py-4 md:flex-col md:items-stretch">
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg px-2 py-2 text-sm text-white/80 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              View Website ↗
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/studio/signin" });
              }}
            >
              <button
                type="submit"
                className="rounded-lg px-2 py-2 text-sm text-white/80 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Sign Out
              </button>
            </form>
          </div>
        </aside>
        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}
