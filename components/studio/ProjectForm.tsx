"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { ProjectActionState } from "@/app/studio/(app)/projects/actions";
import { softwareRegistry, type SoftwareId } from "@/data/software";
import { slugify } from "@/lib/studio/slug";

const sizes = [
  ["STANDARD", "Standard"],
  ["LARGE", "Large"],
  ["WIDE", "Wide"],
  ["TALL", "Tall"],
] as const;

export type ProjectFormValues = {
  id?: string;
  title: string;
  slug: string;
  categoryId: string;
  client: string;
  year: string;
  role: string;
  shortDescription: string;
  fullDescription: string;
  size: (typeof sizes)[number][0];
  sortOrder: string;
  featured: boolean;
  published: boolean;
  seoTitle: string;
  seoDescription: string;
};

export function ProjectForm({
  action,
  categories,
  services,
  software,
  selectedServiceIds,
  selectedSoftwareIds,
  values,
  mode,
}: {
  action: (state: ProjectActionState, formData: FormData) => Promise<ProjectActionState>;
  categories: { id: string; name: string }[];
  services: { id: string; title: string; published: boolean }[];
  software: { id: string; key: string; name: string }[];
  selectedServiceIds: string[];
  selectedSoftwareIds: string[];
  values: ProjectFormValues;
  mode: "create" | "edit";
}) {
  const [state, formAction] = useActionState(action, {});
  const [title, setTitle] = useState(values.title);
  const [slug, setSlug] = useState(values.slug);
  const [slugEdited, setSlugEdited] = useState(mode === "edit");

  function onTitleChange(next: string) {
    setTitle(next);
    if (!slugEdited) setSlug(slugify(next));
  }

  const slugWarning = mode === "edit" && values.published && slug !== values.slug;

  return (
    <form action={formAction} className="mt-8 grid max-w-2xl gap-5">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <input type="hidden" name="relations" value="1" />
      {state.error ? (
        <p className="rounded-xl bg-[#8a3b2b]/10 px-4 py-3 text-sm text-[#8a3b2b]" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="rounded-xl bg-[#2e211c]/10 px-4 py-3 text-sm text-[#2e211c]" role="status">
          Saved.
        </p>
      ) : null}

      <fieldset className="grid gap-5">
        <legend className="text-sm font-semibold">Basic information</legend>
        <Field label="Title" name="title" value={title} onChange={onTitleChange} required />
        <div>
          <Field
            label="Slug"
            name="slug"
            value={slug}
            onChange={(next) => {
              setSlugEdited(true);
              setSlug(next.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
            }}
            required
          />
          {slugWarning ? (
            <p className="mt-2 text-sm text-[#8a3b2b]">
              This project is published. Changing the slug changes its public URL.
            </p>
          ) : null}
        </div>
        <label className="grid gap-1 text-sm font-medium">
          Category
          <select name="categoryId" defaultValue={values.categoryId} required className={controlClass}>
            <option value="">Choose a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      <fieldset className="grid gap-5 border-t border-[#1c120e]/10 pt-5">
        <legend className="text-sm font-semibold">Publishing</legend>
        <label className="grid gap-1 text-sm font-medium">
          Grid size
          <select name="size" defaultValue={values.size} className={controlClass}>
            {sizes.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <UncontrolledField label="Sort order" name="sortOrder" defaultValue={values.sortOrder} inputMode="numeric" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={values.featured} className="size-4" />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" defaultChecked={values.published} className="size-4" />
          Published
        </label>
      </fieldset>

      <fieldset className="grid gap-5 border-t border-[#1c120e]/10 pt-5">
        <legend className="text-sm font-semibold">Project details</legend>
        <UncontrolledField label="Client" name="client" defaultValue={values.client} required />
        <UncontrolledField label="Year" name="year" defaultValue={values.year} inputMode="numeric" />
        <UncontrolledField label="Role" name="role" defaultValue={values.role} />
        <UncontrolledField label="Short description" name="shortDescription" defaultValue={values.shortDescription} multiline />
        <UncontrolledField label="Full description" name="fullDescription" defaultValue={values.fullDescription} multiline />
        <div>
          <p className="text-sm font-medium">Services</p>
          <ul className="mt-2 grid gap-2">
            {services.map((service) => (
              <li key={service.id}>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="serviceId"
                    value={service.id}
                    defaultChecked={selectedServiceIds.includes(service.id)}
                    className="size-4"
                  />
                  {service.title}
                  {service.published ? null : " (unpublished)"}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </fieldset>

      <fieldset className="grid gap-3 border-t border-[#1c120e]/10 pt-5">
        <legend className="text-sm font-semibold">Software used</legend>
        <ul className="grid gap-2">
          {software.map((tool) => {
            const known = isSoftwareId(tool.key) ? softwareRegistry[tool.key] : null;
            const Icon = known?.Icon;
            return (
              <li key={tool.id}>
                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    name="softwareId"
                    value={tool.id}
                    defaultChecked={selectedSoftwareIds.includes(tool.id)}
                    className="size-4"
                  />
                  {Icon ? <Icon className="size-5" aria-hidden="true" /> : null}
                  {known?.label ?? tool.name}
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <fieldset className="grid gap-5 border-t border-[#1c120e]/10 pt-5">
        <legend className="text-sm font-semibold">SEO</legend>
        <UncontrolledField label="SEO title" name="seoTitle" defaultValue={values.seoTitle} />
        <UncontrolledField label="SEO description" name="seoDescription" defaultValue={values.seoDescription} multiline />
      </fieldset>

      <SaveButton label={mode === "create" ? "Create project" : "Save project"} />
    </form>
  );
}

const controlClass =
  "mt-1 w-full rounded-lg border border-[#1c120e]/15 bg-white px-3 py-2 text-sm font-normal text-[#1c120e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2e211c]";

function Field({
  label,
  name,
  value,
  onChange,
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1 text-sm font-medium">
      {label}
      <input
        name={name}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className={controlClass}
      />
    </label>
  );
}

function UncontrolledField({
  label,
  name,
  defaultValue,
  required,
  multiline,
  inputMode,
}: {
  label: string;
  name: string;
  defaultValue: string;
  required?: boolean;
  multiline?: boolean;
  inputMode?: "numeric" | "text";
}) {
  return (
    <label className="grid gap-1 text-sm font-medium">
      {label}
      {multiline ? (
        <textarea name={name} defaultValue={defaultValue} required={required} rows={4} className={controlClass} />
      ) : (
        <input
          name={name}
          defaultValue={defaultValue}
          required={required}
          inputMode={inputMode}
          className={controlClass}
        />
      )}
    </label>
  );
}

function isSoftwareId(key: string): key is SoftwareId {
  return key in softwareRegistry;
}

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-fit rounded-full bg-[#2e211c] px-4 py-2 text-sm font-semibold text-[#f7f1ea] disabled:opacity-60"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}
