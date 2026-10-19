"use client";

import { useState, type ReactNode } from "react";
import { StudioMark } from "@/components/studio/StudioMark";
import { StudioNav } from "@/components/studio/StudioNav";
import { StudioRail, type StudioOverview } from "@/components/studio/StudioRail";
import { StudioTopBar } from "@/components/studio/StudioTopBar";

export function StudioChrome({
  user,
  overview,
  account,
  children,
}: {
  user: { name: string; image: string | null };
  overview: StudioOverview;
  account: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`studio-frame${open ? " is-nav-open" : ""}`}>
      {open ? <button type="button" className="studio-nav-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} /> : null}
      <aside className="studio-sidebar" onClick={(event) => {
          if ((event.target as HTMLElement).closest("a")) setOpen(false);
        }}>
        <div className="studio-brand">
          <StudioMark />
          <span>Studio</span>
        </div>
        <StudioNav />
        {account}
      </aside>
      <div className="studio-workspace">
        <StudioTopBar user={user} onMenu={() => setOpen((value) => !value)} />
        <div className="studio-workspace-body">
          <main className="studio-main">{children}</main>
          <StudioRail user={user} overview={overview} />
        </div>
      </div>
    </div>
  );
}
