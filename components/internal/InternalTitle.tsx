import type { ReactNode } from "react";

export function InternalTitle({ children }: { children: ReactNode }) {
  return (
    <div>
      <h1 className="text-center text-balance font-display text-[clamp(2.25rem,3.15vw,3.15rem)] leading-[1.05] font-semibold tracking-tight">
        {children}
      </h1>
      <span aria-hidden="true" className="mx-auto mt-4 block h-px w-14 bg-ink/20" />
    </div>
  );
}
