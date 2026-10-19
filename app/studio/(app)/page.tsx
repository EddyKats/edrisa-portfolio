import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StudioMark } from "@/components/studio/StudioMark";
import { getStudioOverview } from "@/lib/content/overview";

const chips = [
  { href: "/studio/about", label: "About", tone: "violet" },
  { href: "/studio/services", label: "Services", tone: "pink" },
  { href: "/studio/clients", label: "Clients", tone: "blue" },
] as const;

const pages = [
  {
    href: "/studio/about",
    kicker: "About",
    title: "Bio, experience, and the call to action",
    note: "Matches the public About page.",
  },
  {
    href: "/studio/services",
    kicker: "Services",
    title: "Offers, capability lists, and talk buttons",
    note: "Published items appear on /services.",
  },
  {
    href: "/studio/clients",
    kicker: "Clients",
    title: "Logo marquee for the services page",
    note: "Keep the twelve marks in order.",
  },
] as const;

export default async function StudioDashboard() {
  const overview = await getStudioOverview();
  const projectTotal = overview.publishedProjects + overview.draftProjects;
  const counts = [
    { href: "/studio/projects", label: "Published", value: projectTotal ? `${overview.publishedProjects}/${projectTotal}` : "0", detail: "projects live" },
    { href: "/studio/services", label: "Services", value: String(overview.services), detail: "published offers" },
    { href: "/studio/clients", label: "Clients", value: String(overview.clients), detail: "in the marquee" },
  ];

  return (
    <div className="studio-dash">
      <section className="studio-banner">
        <p className="studio-banner-brand">
          <StudioMark />
          Edrisa studio
        </p>
        <h1>Keep the public site in step with the work</h1>
        <Link href="/studio/projects/new" className="studio-banner-btn">
          New project
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>

      <ul className="studio-chips">
        {counts.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="studio-chip">
              <span className="studio-chip-value">{item.value}</span>
              <span>
                <strong>{item.label}</strong>
                <small>{item.detail}</small>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="studio-block-head">
        <h2>Continue editing</h2>
      </div>
      <ul className="studio-course-grid">
        {pages.map((page) => (
          <li key={page.href}>
            <Link href={page.href} className="studio-course-card">
              <p className="studio-course-kicker">{page.kicker}</p>
              <h3>{page.title}</h3>
              <p>{page.note}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="studio-block-head">
        <h2>Your pages</h2>
        <Link href="/studio/projects">See all</Link>
      </div>
      {overview.recentProjects.length === 0 ? (
        <p className="studio-empty">No projects yet.</p>
      ) : (
        <div className="studio-table studio-card">
          <div className="studio-table-row is-head">
            <span>Project</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          {overview.recentProjects.map((project) => (
            <div key={project.id} className="studio-table-row">
              <span>{project.title}</span>
              <span className={project.published ? "studio-pill is-live" : "studio-pill"}>{project.published ? "Published" : "Draft"}</span>
              <Link href={`/studio/projects/${project.id}`}>Edit</Link>
            </div>
          ))}
        </div>
      )}

      <ul className="studio-chips studio-chips-secondary">
        {chips.map((chip) => (
          <li key={chip.href}>
            <Link href={chip.href} className={`studio-mini-chip tone-${chip.tone}`}>
              {chip.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
