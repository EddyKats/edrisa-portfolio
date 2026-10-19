"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Briefcase, Check, Link as LinkIcon, Tags, Type } from "lucide-react";
import type { ProjectActionState } from "@/app/studio/(app)/projects/actions";
import { controlClass } from "@/components/studio/editor";
import { slugify } from "@/lib/studio/slug";

const panel = "studio-card studio-panel";
const heading = "text-xl font-extrabold tracking-tight";
const control = `mt-2 ${controlClass}`;

export function ProjectCreateForm({
  action,
  categories,
}: {
  action: (state: ProjectActionState, formData: FormData) => Promise<ProjectActionState>;
  categories: { id: string; name: string }[];
}) {
  const [state, formAction] = useActionState(action, {});
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [published, setPublished] = useState(false);

  return (
    <form action={formAction} className="mx-auto mt-8 grid w-full max-w-3xl gap-6">
      {state.error ? (
        <p className="rounded-xl bg-[#8a3b2b]/10 px-4 py-3 text-sm text-[#8a3b2b]" role="alert">
          {state.error}
        </p>
      ) : null}

      <section className={panel}>
        <h2 className={heading}>Project identity</h2>
        <div className="mt-5 grid gap-5">
          <label className="grid text-sm font-medium">
            <span className="flex items-center gap-2">
              <Type className="size-4 text-[#1c120e]/45" aria-hidden="true" />
              Title
            </span>
            <input
              name="title"
              value={title}
              required
              onChange={(event) => {
                const next = event.target.value;
                setTitle(next);
                if (!slugEdited) setSlug(slugify(next));
              }}
              className={control}
            />
          </label>
          <label className="grid text-sm font-medium">
            <span className="flex items-center gap-2">
              <LinkIcon className="size-4 text-[#1c120e]/45" aria-hidden="true" />
              Slug
            </span>
            <input
              name="slug"
              value={slug}
              required
              onChange={(event) => {
                setSlugEdited(true);
                setSlug(event.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
              }}
              className={control}
            />
          </label>
        </div>
      </section>

      <section className={panel}>
        <h2 className={`${heading} flex items-center gap-2`}>
          <Tags className="size-5 text-[#1c120e]/55" aria-hidden="true" />
          Categories
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#1c120e]/65">A project can appear in more than one category.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {categories.map((category) => {
            const checked = selected.includes(category.id);
            return (
              <label
                key={category.id}
                className={`studio-choice${checked ? " is-on" : ""}`}
              >
                <input
                  type="checkbox"
                  name="categoryId"
                  value={category.id}
                  checked={checked}
                  onChange={() =>
                    setSelected((current) =>
                      current.includes(category.id) ? current.filter((id) => id !== category.id) : [...current, category.id],
                    )
                  }
                  className="sr-only"
                />
                <Check className={`size-4 ${checked ? "opacity-100" : "opacity-0"}`} aria-hidden="true" />
                {category.name}
              </label>
            );
          })}
        </div>
      </section>

      <section className={panel}>
        <h2 className={`${heading} flex items-center gap-2`}>
          <Briefcase className="size-5 text-[#1c120e]/55" aria-hidden="true" />
          Role
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#1c120e]/65">Optional. Shown with the categories on the project.</p>
        <label className="mt-5 grid text-sm font-medium">
          Role
          <input name="role" placeholder="Founder / Brand & Product Direction" className={control} />
        </label>
      </section>

      <section className={panel}>
        <h2 className={heading}>Publishing</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2" role="group" aria-label="Publishing">
          <StatusChoice label="Draft" detail="Hidden from the public site" selected={!published} onClick={() => setPublished(false)} />
          <StatusChoice label="Published" detail="Visible in Selected Works" selected={published} onClick={() => setPublished(true)} />
        </div>
        {published ? <input type="hidden" name="published" value="on" /> : null}
      </section>

      <CreateButton />
    </form>
  );
}

function StatusChoice({
  label,
  detail,
  selected,
  onClick,
}: {
  label: string;
  detail: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`studio-choice text-left${selected ? " is-on" : ""}`}
    >
      <span className="block text-sm font-semibold">{label}</span>
      <span className={`mt-1 block text-xs ${selected ? "text-white/75" : "text-[#8a8aa8]"}`}>{detail}</span>
    </button>
  );
}

function CreateButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="studio-btn-primary"
    >
      {pending ? "Saving..." : "Create Project & Add Presentation"}
      {pending ? null : <ArrowRight className="size-4" aria-hidden="true" />}
    </button>
  );
}
