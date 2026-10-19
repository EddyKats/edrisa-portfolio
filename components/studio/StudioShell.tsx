import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { signOut } from "@/auth";
import { StudioNav } from "@/components/studio/StudioNav";

export function StudioShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#fffbf3] text-[#1c120e]" style={{ colorScheme: "light" }}>
      <div className="mx-auto flex min-h-dvh w-full max-w-[1600px] flex-col lg:flex-row">
        <aside className="flex shrink-0 flex-col bg-[#2e211c] text-[#f7f1ea] lg:sticky lg:top-0 lg:h-dvh lg:w-60">
          <div className="px-5 pt-5 pb-3 lg:pt-6 lg:pb-4">
            <p className="text-xs tracking-[0.18em] text-white/60 uppercase">Edrisa</p>
            <p className="mt-1 text-lg font-semibold">Studio</p>
          </div>
          <StudioNav />
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 px-4 py-4 lg:flex-col lg:items-stretch">
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-white/80 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              View website
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
