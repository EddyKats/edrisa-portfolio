import Link from "next/link";
import { getStudioOverview } from "@/lib/content/overview";

const actions = [
  { href: "/studio/projects/new", label: "New Project" },
  { href: "/studio/about", label: "Edit About" },
  { href: "/portfolio", label: "View Portfolio" },
] as const;

export default async function StudioDashboard() {
  const overview = await getStudioOverview();
  const counts = [
    ["Published projects", overview.publishedProjects],
    ["Draft projects", overview.draftProjects],
    ["Services", overview.services],
    ["Clients", overview.clients],
  ] as const;

  return (
    <section className="max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-[#1c120e]/70">
        These counts come from Neon. The public site still reads its current files.
      </p>
      <dl className="mt-8 grid gap-3 sm:grid-cols-2">
        {counts.map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white px-4 py-4">
            <dt className="text-sm text-[#1c120e]/60">{label}</dt>
            <dd className="mt-1 text-2xl font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      {overview.recentProjects.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-lg font-semibold">Recently updated projects</h2>
          <ul className="mt-3 divide-y divide-[#1c120e]/10 rounded-2xl bg-white">
            {overview.recentProjects.map((project) => (
              <li key={project.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-medium">{project.title}</p>
                  <p className="text-sm text-[#1c120e]/60">{project.published ? "Published" : "Draft"}</p>
                </div>
                <Link href={`/studio/projects/${project.id}`} className="text-sm font-semibold underline-offset-2 hover:underline">
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <ul className="mt-8 flex flex-wrap gap-3">
        {actions.map((action) => (
          <li key={action.href}>
            <Link
              href={action.href}
              className="inline-flex rounded-full bg-[#2e211c] px-4 py-2 text-sm font-semibold text-[#f7f1ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2e211c]"
            >
              {action.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
