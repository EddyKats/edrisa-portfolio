import Link from "next/link";
import Image from "next/image";
import { ExternalLink, ImageIcon, Pencil, Plus } from "lucide-react";
import { listStudioProjects } from "@/lib/content/projects";

export default async function StudioProjectsPage() {
  const projects = await listStudioProjects();

  return (
    <section className="mx-auto w-full max-w-[68rem]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-[#1c120e]/70">
            Published projects are ready for the public site. Drafts stay in the studio.
          </p>
        </div>
        <Link
          href="/studio/projects/new"
          className="inline-flex items-center gap-2 rounded-full bg-[#2e211c] px-4 py-2 text-sm font-semibold text-[#f7f1ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2e211c]"
        >
          <Plus className="size-4" aria-hidden="true" />
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="mt-8 text-sm text-[#1c120e]/70">No projects yet.</p>
      ) : (
        <ul className="mt-8 grid gap-3">
          {projects.map((project) => {
            const names = project.categories.map((item) => item.category.name);
            const updated = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" }).format(project.updatedAt);
            return (
              <li key={project.id} className="rounded-2xl border border-[#1c120e]/10 bg-white px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-[#f7f1ea]">
                    {project.coverImageUrl ? (
                      <Image src={project.coverImageUrl} alt="" fill className="object-cover" sizes="64px" />
                    ) : (
                      <span className="grid size-full place-items-center text-[#1c120e]/35">
                        <ImageIcon className="size-5" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold tracking-tight">{project.title}</h2>
                      <span
                        className={
                          project.published
                            ? "rounded-full bg-[#2e211c] px-2 py-1 text-xs font-semibold tracking-wide text-[#f7f1ea] uppercase"
                            : "rounded-full bg-[#1c120e]/10 px-2 py-1 text-xs font-semibold tracking-wide text-[#1c120e] uppercase"
                        }
                      >
                        {project.published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[#1c120e]/70">
                      {names.length > 0 ? names.join(" · ") : "Needs categories"}
                      {names.length === 0 && project.category ? ` · previous label ${project.category.name}` : ""}
                    </p>
                    <p className="mt-1 text-sm text-[#1c120e]/55">
                      {project._count.images} {project._count.images === 1 ? "presentation item" : "presentation items"} · Updated {updated}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/studio/projects/${project.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#2e211c] px-3 py-1.5 text-sm font-semibold text-[#f7f1ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2e211c]"
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                      Edit
                    </Link>
                    {project.published ? (
                      <Link
                        href={`/portfolio/${project.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2e211c]"
                      >
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                        View
                      </Link>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
