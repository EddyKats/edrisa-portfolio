import { createProject } from "@/app/studio/(app)/projects/actions";
import { ProjectForm } from "@/components/studio/ProjectForm";
import { listPortfolioCategories } from "@/lib/content/categories";
import { listStudioServices } from "@/lib/content/services";
import { listSoftwareCatalogue } from "@/lib/content/software";

export default async function NewProjectPage() {
  const [categories, services, software] = await Promise.all([
    listPortfolioCategories(),
    listStudioServices(),
    listSoftwareCatalogue(),
  ]);

  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">New project</h1>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-[#1c120e]/70">
        The slug starts from the title. You can change it before saving.
      </p>
      <ProjectForm
        action={createProject}
        mode="create"
        categories={categories}
        services={services}
        software={software}
        selectedServiceIds={[]}
        selectedSoftwareIds={[]}
        values={{
          title: "",
          slug: "",
          categoryId: categories[0]?.id ?? "",
          client: "",
          year: "",
          role: "",
          shortDescription: "",
          fullDescription: "",
          size: "STANDARD",
          sortOrder: "0",
          featured: false,
          published: false,
          seoTitle: "",
          seoDescription: "",
        }}
      />
    </section>
  );
}
