import { StudioPageHead } from "@/components/studio/StudioPageHead";
import { createProject } from "@/app/studio/(app)/projects/actions";
import { ProjectCreateForm } from "@/components/studio/ProjectCreateForm";
import { listCanonicalCategories } from "@/lib/content/categories";

export default async function NewProjectPage() {
  const categories = await listCanonicalCategories();

  return (
    <section>
      <StudioPageHead
        title="New project"
        note="Name the project and choose its categories. Cover and presentation come on the next screen."
      />
      <ProjectCreateForm action={createProject} categories={categories} />
    </section>
  );
}
