import { notFound } from "next/navigation";
import { updateProject } from "@/app/studio/(app)/projects/actions";
import { ProjectEditor } from "@/components/studio/ProjectEditor";
import { listCanonicalCategories } from "@/lib/content/categories";
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
    listCanonicalCategories(),
    listStudioServices(),
    listSoftwareCatalogue(),
  ]);
  if (!project) notFound();

  const updatedLabel = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(project.updatedAt);

  return (
    <section>
      <ProjectEditor
        justCreated={saved === "1"}
        action={updateProject}
        categories={categories}
        services={services}
        software={software}
        selectedServiceIds={project.services.map((item) => item.serviceId)}
        selectedSoftwareIds={project.software.map((item) => item.softwareId)}
        credits={project.credits}
        project={{
          id: project.id,
          title: project.title,
          slug: project.slug,
          published: project.published,
          role: project.role ?? "",
          client: project.client,
          year: project.year == null ? "" : String(project.year),
          shortDescription: project.shortDescription ?? "",
          fullDescription: project.fullDescription ?? "",
          size: project.size,
          sortOrder: String(project.sortOrder),
          featured: project.featured,
          seoTitle: project.seoTitle ?? "",
          seoDescription: project.seoDescription ?? "",
          legacyCategory: project.category?.name ?? null,
          categoryIds: project.categories.map((item) => item.categoryId),
          coverUrl: project.coverImageUrl,
          coverWidth: project.coverImageWidth,
          coverHeight: project.coverImageHeight,
          updatedLabel,
          images: project.images,
        }}
      />
    </section>
  );
}
