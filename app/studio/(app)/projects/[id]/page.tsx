import { notFound } from "next/navigation";
import { updateProject } from "@/app/studio/(app)/projects/actions";
import { DeleteProjectButton } from "@/components/studio/DeleteProjectButton";
import { ProjectArtwork } from "@/components/studio/ProjectArtwork";
import { ProjectCredits } from "@/components/studio/ProjectCredits";
import { ProjectForm } from "@/components/studio/ProjectForm";
import { listPortfolioCategories } from "@/lib/content/categories";
import { getStudioProject } from "@/lib/content/projects";
import { listStudioServices } from "@/lib/content/services";
import { listSoftwareCatalogue } from "@/lib/content/software";

export default async function EditProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  const [project, categories, services, software] = await Promise.all([
    getStudioProject(id),
    listPortfolioCategories(),
    listStudioServices(),
    listSoftwareCatalogue(),
  ]);
  if (!project) notFound();

  return (
    <section className="max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{project.title}</h1>
          <p className="mt-3 text-sm text-[#1c120e]/60">{project.published ? "Published" : "Draft"}</p>
        </div>
        <DeleteProjectButton id={project.id} title={project.title} />
      </div>
      {saved === "1" ? (
        <p className="mt-6 rounded-xl bg-[#2e211c]/10 px-4 py-3 text-sm text-[#2e211c]" role="status">
          Project created.
        </p>
      ) : null}

      <h2 className="mt-10 text-lg font-semibold">Artwork</h2>
      <ProjectArtwork
        projectId={project.id}
        coverUrl={project.coverImageUrl}
        heroUrl={project.heroImageUrl}
        images={project.images}
      />

      <ProjectForm
        action={updateProject}
        mode="edit"
        categories={categories}
        services={services}
        software={software}
        selectedServiceIds={project.services.map((item) => item.serviceId)}
        selectedSoftwareIds={project.software.map((item) => item.softwareId)}
        values={{
          id: project.id,
          title: project.title,
          slug: project.slug,
          categoryId: project.categoryId,
          client: project.client,
          year: project.year == null ? "" : String(project.year),
          role: project.role ?? "",
          shortDescription: project.shortDescription ?? "",
          fullDescription: project.fullDescription ?? "",
          size: project.size,
          sortOrder: String(project.sortOrder),
          featured: project.featured,
          published: project.published,
          seoTitle: project.seoTitle ?? "",
          seoDescription: project.seoDescription ?? "",
        }}
      />

      <h2 className="mt-10 text-lg font-semibold">Credits</h2>
      <ProjectCredits projectId={project.id} credits={project.credits} />
    </section>
  );
}
