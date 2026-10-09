import type { ReactNode } from "react";

export function InternalTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-center text-balance text-[clamp(1.875rem,2.4vw,2.375rem)] font-medium tracking-tight">
      {children}
    </h1>
  );
}
