import { createProject } from "@/app/studio/(app)/projects/actions";
import { ProjectCreateForm } from "@/components/studio/ProjectCreateForm";
import { listCanonicalCategories } from "@/lib/content/categories";

export default async function NewProjectPage() {
  const categories = await listCanonicalCategories();

  return (
    <section>
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.16em] text-[#1c120e]/45 uppercase">Studio</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">New project</h1>
        <p className="mt-3 text-base leading-relaxed text-[#1c120e]/70">
          Name the project and choose its categories. Cover and presentation come on the next screen.
        </p>
      </div>
      <ProjectCreateForm action={createProject} categories={categories} />
    </section>
  );
}
