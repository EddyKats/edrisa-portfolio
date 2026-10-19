"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { Plus } from "lucide-react";

export type StudioOverview = {
  publishedProjects: number;
  draftProjects: number;
  services: number;
  clients: number;
  publishedShare: number;
  recentProjects: {
    id: string;
    title: string;
    slug: string;
    published: boolean;
    updatedAt: Date;
    coverImageUrl: string | null;
  }[];
};

export function StudioRail({
  user,
  overview,
}: {
  user: { name: string; image: string | null };
  overview: StudioOverview;
}) {
  const pathname = usePathname();
  if (pathname.startsWith("/studio/projects/")) return null;

  const first = user.name.split(" ")[0] ?? user.name;
  const bars = [
    { label: "Live", value: overview.publishedProjects },
    { label: "Drafts", value: overview.draftProjects },
    { label: "Clients", value: overview.clients },
  ];
  const max = Math.max(1, ...bars.map((bar) => bar.value));

  return (
    <aside className="studio-rail">
      <section className="studio-card studio-stat-card">
        <div className="studio-stat-head">
          <p>Statistic</p>
        </div>
        <div className="studio-stat-hero">
          <div className="studio-progress-ring" style={{ "--studio-progress": overview.publishedShare } as CSSProperties}>
            {user.image ? (
              <Image src={user.image} alt="" width={72} height={72} unoptimized className="studio-progress-photo" />
            ) : (
              <span className="studio-progress-fallback">{first.slice(0, 1)}</span>
            )}
            <span className="studio-progress-label">{overview.publishedShare}%</span>
          </div>
          <h2>Good to see you, {first}</h2>
          <p>Published projects as a share of everything in Studio.</p>
        </div>
        <div className="studio-bars" aria-hidden="true">
          {bars.map((bar) => (
            <div key={bar.label} className="studio-bar">
              <span style={{ height: `${Math.max(12, (bar.value / max) * 100)}%` }} />
              <small>{bar.label}</small>
            </div>
          ))}
        </div>
      </section>
      <section className="studio-card studio-list-card">
        <div className="studio-stat-head">
          <p>Recent projects</p>
          <Link href="/studio/projects/new" className="studio-icon-btn" aria-label="New project">
            <Plus className="size-4" />
          </Link>
        </div>
        {overview.recentProjects.length === 0 ? (
          <p className="studio-empty">No projects yet.</p>
        ) : (
          <ul>
            {overview.recentProjects.slice(0, 3).map((project) => (
              <li key={project.id}>
                <Link href={`/studio/projects/${project.id}`} className="studio-person-row">
                  <span className="studio-nav-avatar">{project.title.slice(0, 1)}</span>
                  <span>
                    <span className="studio-nav-person-name">{project.title}</span>
                    <span className="studio-nav-person-note">{project.published ? "Published" : "Draft"}</span>
                  </span>
                  <span className="studio-follow">Edit</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link href="/studio/projects" className="studio-see-all">
          See all
        </Link>
      </section>
    </aside>
  );
}
