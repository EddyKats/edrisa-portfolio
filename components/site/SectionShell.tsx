import Link from "next/link";
import { ViewTransition } from "react";
import type { NavItem } from "@/data/navigation";
import { NavIcon } from "@/components/icons/NavIcon";

type SectionShellProps = {
  item: NavItem;
};

export function SectionShell({ item }: SectionShellProps) {
  return (
    <main className="min-h-dvh bg-mocha">
      <ViewTransition name={item.transitionName}>
        <div className={`relative flex min-h-dvh flex-col ${item.surfaceClass}`}>
          <div className="flex items-center justify-between p-6 sm:p-10">
            <Link
              href="/"
              className="text-sm font-semibold tracking-[0.22em] text-white uppercase focus-visible:outline-offset-4"
            >
              edrisa
            </Link>
          </div>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent"
          />
          <div className="relative z-10 mt-auto flex flex-col items-start gap-5 p-7 sm:p-10">
            <NavIcon name={item.icon} className="size-11 text-white" />
            <h1 className="text-[1.7rem] leading-none font-semibold tracking-wide text-white">
              {item.title}
            </h1>
          </div>
        </div>
      </ViewTransition>
    </main>
  );
}
