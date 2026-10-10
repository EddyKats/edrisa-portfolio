import Link from "next/link";
import { DeleteProjectButton } from "@/components/studio/DeleteProjectButton";
import { PublishProjectButton } from "@/components/studio/PublishProjectButton";
import { listStudioProjects } from "@/lib/content/projects";

const sizeLabels = {
  STANDARD: "Standard",
  LARGE: "Large",
  WIDE: "Wide",
  TALL: "Tall",
} as const;

export default async function StudioProjectsPage() {
  const projects = await listStudioProjects();

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-[#1c120e]/70">
            Published projects are ready for the public site. Drafts stay in the studio.
          </p>
        </div>
        <Link
          href="/studio/projects/new"
          className="rounded-full bg-[#2e211c] px-4 py-2 text-sm font-semibold text-[#f7f1ea]"
        >
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="mt-8 text-sm text-[#1c120e]/70">No projects yet.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-[#1c120e]/55">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Grid size</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-t border-[#1c120e]/10 align-top">
                  <td className="px-4 py-3 font-medium">{project.title}</td>
                  <td className="px-4 py-3">{project.category.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        project.published
                          ? "rounded-full bg-[#2e211c] px-2 py-1 text-xs font-semibold text-[#f7f1ea]"
                          : "rounded-full bg-[#1c120e]/10 px-2 py-1 text-xs font-semibold text-[#1c120e]"
                      }
                    >
                      {project.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{sizeLabels[project.size]}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" }).format(project.updatedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/studio/projects/${project.id}`} className="rounded-full px-3 py-1.5 font-semibold hover:bg-black/5">
                        Edit
                      </Link>
                      <PublishProjectButton id={project.id} published={project.published} />
                      <DeleteProjectButton id={project.id} title={project.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
