"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import {
  ArrowUpDown,
  Briefcase,
  Check,
  ChevronDown,
  Eye,
  FileText,
  LayoutGrid,
  Link as LinkIcon,
  Save,
  Star,
  Tags,
  Type,
} from "lucide-react";
import type { ProjectActionState } from "@/app/studio/(app)/projects/actions";
import { controlClass } from "@/components/studio/editor";
import { ProjectArtwork } from "@/components/studio/ProjectArtwork";
import { ProjectCredits } from "@/components/studio/ProjectCredits";
import { DeleteProjectButton } from "@/components/studio/DeleteProjectButton";
import { PublishProjectButton } from "@/components/studio/PublishProjectButton";
import { softwareRegistry, type SoftwareId } from "@/data/software";
import { slugify } from "@/lib/studio/slug";

const section = "studio-card studio-panel scroll-mt-44";
const heading = "text-xl font-extrabold tracking-tight";
const control = `mt-2 ${controlClass}`;
const formId = "project-form";

const sizes = [
  ["STANDARD", "Standard", "A regular Selected Works card.", "h-6 w-6"],
  ["LARGE", "Large", "A bigger square card.", "h-8 w-8"],
  ["WIDE", "Wide", "A horizontal card.", "h-5 w-10"],
  ["TALL", "Tall", "A vertical card.", "h-10 w-5"],
] as const;

const sections = [
  ["overview", "Overview"],
  ["cover", "Cover"],
  ["presentation", "Presentation"],
  ["display", "Display"],
  ["metadata", "Metadata"],
  ["seo", "SEO"],
] as const;

type PresentationItem = {
  id: string;
  url: string;
  altText: string;
  caption: string | null;
  width: number | null;
  height: number | null;
  kind: "IMAGE" | "GIF" | "VIDEO";
  mimeType: string | null;
  originalName: string | null;
};

export function ProjectEditor({
  action,
  project,
  categories,
  services,
  software,
  selectedServiceIds,
  selectedSoftwareIds,
  credits,
  justCreated = false,
}: {
  action: (state: ProjectActionState, formData: FormData) => Promise<ProjectActionState>;
  project: {
    id: string;
    title: string;
    slug: string;
    published: boolean;
    role: string;
    client: string;
    year: string;
    shortDescription: string;
    fullDescription: string;
    size: (typeof sizes)[number][0];
    sortOrder: string;
    featured: boolean;
    seoTitle: string;
    seoDescription: string;
    legacyCategory: string | null;
    categoryIds: string[];
    coverUrl: string | null;
    coverWidth: number | null;
    coverHeight: number | null;
    updatedLabel: string;
    images: PresentationItem[];
  };
  categories: { id: string; name: string }[];
  services: { id: string; title: string; published: boolean }[];
  software: { id: string; key: string; name: string }[];
  selectedServiceIds: string[];
  selectedSoftwareIds: string[];
  credits: { id: string; label: string; value: string }[];
  justCreated?: boolean;
}) {
  const [state, formAction] = useActionState(action, {});
  const [title, setTitle] = useState(project.title);
  const [slug, setSlug] = useState(project.slug);
  const [slugEdited, setSlugEdited] = useState(true);
  const [selected, setSelected] = useState(project.categoryIds);
  const [size, setSize] = useState(project.size);
  const [seoTitle, setSeoTitle] = useState(project.seoTitle);
  const [seoDescription, setSeoDescription] = useState(project.seoDescription);
  const [active, setActive] = useState<(typeof sections)[number][0]>("overview");
  const slugWarning = project.published && slug !== project.slug;
  const slugError = fieldError(state.error, "slug");
  const categoryError = fieldError(state.error, "category");

  useEffect(() => {
    const nodes = sections.map((item) => document.getElementById(item[0])).filter((node): node is HTMLElement => node !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const id = visible?.target.id;
        if (id && sections.some((item) => item[0] === id)) setActive(id as (typeof sections)[number][0]);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0.15, 0.4] },
    );
    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, []);

  function jump(id: (typeof sections)[number][0]) {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="mx-auto grid w-full max-w-[68rem] gap-8">
      <div className="studio-sticky-bar">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-3xl font-semibold tracking-tight sm:text-4xl">{title || "Untitled project"}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#1c120e]/60">
              <span className={project.published ? "studio-pill is-live" : "studio-pill"}>
                {project.published ? "Published" : "Draft"}
              </span>
              <span>Updated {project.updatedLabel}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {project.published ? (
              <a
                href={`/portfolio/${project.slug}`}
                target="_blank"
                rel="noreferrer"
                className="studio-btn-ghost"
              >
                <Eye className="size-4" aria-hidden="true" />
                View project
              </a>
            ) : null}
            <form id={formId} action={formAction} className="contents">
              <input type="hidden" name="id" value={project.id} />
              <SaveButton saved={Boolean(state.ok)} failed={Boolean(state.error)} />
            </form>
            <PublishProjectButton id={project.id} published={project.published} tone="header" />
          </div>
        </div>
        <nav aria-label="Project sections" className="mt-4 flex gap-1 overflow-x-auto pb-1">
          {sections.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => jump(id)}
              aria-current={active === id ? "true" : undefined}
              className={`studio-tab${active === id ? " is-on" : ""}`}
            >
              {label}
            </button>
          ))}
        </nav>
        {justCreated ? (
          <p className="mt-3 text-sm text-[#2e211c]" role="status">
            Project created. Add the cover and presentation below.
          </p>
        ) : null}
        {state.error ? (
          <p className="mt-3 text-sm text-[#8a3b2b]" role="alert">
            {state.error}
          </p>
        ) : null}
        {state.ok ? (
          <p className="mt-3 text-sm text-[#2e211c]" role="status">
            Saved
          </p>
        ) : null}
      </div>

      <ul className="flex flex-wrap gap-2 text-sm" aria-label="Project setup">
        <SetupItem done={title.trim().length > 0 && slug.trim().length > 0} label="Identity" />
        <SetupItem done={selected.length > 0} label="Categories" />
        <SetupItem done={Boolean(project.coverUrl)} label="Cover" />
        <li className="rounded-full bg-white px-3 py-1.5 text-[#1c120e]/75">
          {project.images.length} {project.images.length === 1 ? "presentation item" : "presentation items"}
        </li>
        <li className="rounded-full bg-white px-3 py-1.5 text-[#1c120e]/75">{project.published ? "Published" : "Draft"}</li>
      </ul>

      <section id="overview" className={section}>
        <h2 className={heading}>Project identity</h2>
        <div className="mt-6 grid gap-5">
          <Field label="Title" icon={<Type className="size-4" aria-hidden="true" />}>
            <input
              form={formId}
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
          </Field>
          <Field label="Slug" icon={<LinkIcon className="size-4" aria-hidden="true" />}>
            <input
              form={formId}
              name="slug"
              value={slug}
              required
              onChange={(event) => {
                setSlugEdited(true);
                setSlug(event.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
              }}
              className={control}
            />
            {slugWarning ? <p className="mt-2 text-sm text-[#8a3b2b]">This project is published. Changing the slug changes its public URL.</p> : null}
            {slugError ? (
              <p className="mt-2 text-sm text-[#8a3b2b]" role="alert">
                {slugError}
              </p>
            ) : null}
          </Field>
          <div>
            <p className="flex items-center gap-2 text-sm font-medium">
              <Tags className="size-4 text-[#1c120e]/45" aria-hidden="true" />
              Categories
            </p>
            <p className="mt-2 text-sm text-[#1c120e]/60">A project can appear in more than one category.</p>
            {selected.length === 0 ? (
              <p className="mt-2 text-sm leading-relaxed text-[#8a3b2b]">
                This project still needs a category.
                {project.legacyCategory ? ` It keeps the previous label “${project.legacyCategory}” and appears under All.` : " It appears under All until one is chosen."}
              </p>
            ) : null}
            {categoryError ? (
              <p className="mt-2 text-sm text-[#8a3b2b]" role="alert">
                {categoryError}
              </p>
            ) : null}
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {categories.map((category) => {
                const checked = selected.includes(category.id);
                return (
                  <label
                    key={category.id}
                    className={`studio-choice${checked ? " is-on" : ""}`}
                  >
                    <input
                      form={formId}
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
          </div>
          <Field label="Role" icon={<Briefcase className="size-4" aria-hidden="true" />}>
            <input form={formId} name="role" defaultValue={project.role} placeholder="Founder / Brand & Product Direction" className={control} />
          </Field>
        </div>
      </section>

      <ProjectArtwork
        projectId={project.id}
        coverUrl={project.coverUrl}
        coverWidth={project.coverWidth}
        coverHeight={project.coverHeight}
        images={project.images}
      />

      <section id="display" className={section}>
        <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <LayoutGrid className="size-5 text-[#1c120e]/55" aria-hidden="true" />
          Portfolio display
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#1c120e]/65">
          These settings change the Selected Works grid. They are separate from the presentation.
        </p>
        <fieldset className="mt-6">
          <legend className="text-sm font-medium">Grid size</legend>
          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {sizes.map(([value, label, detail, mark]) => (
              <label
                key={value}
                className={`studio-choice min-h-28 flex-col items-start justify-between${size === value ? " is-on" : ""}`}
              >
                <input form={formId} type="radio" name="size" value={value} checked={size === value} onChange={() => setSize(value)} className="sr-only" />
                <span className={`rounded-md ${mark} ${size === value ? "bg-white" : "bg-[#6b4dff]/80"}`} aria-hidden="true" />
                <span>
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className={`mt-1 block text-xs ${size === value ? "text-white/75" : "text-[#8a8aa8]"}`}>{detail}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className="mt-6 grid max-w-xs text-sm font-medium">
          <span className="flex items-center gap-2">
            <ArrowUpDown className="size-4 text-[#1c120e]/45" aria-hidden="true" />
            Sort order
          </span>
          <input form={formId} name="sortOrder" defaultValue={project.sortOrder} inputMode="numeric" className={control} />
          <span className="mt-2 font-normal text-[#1c120e]/55">Lower numbers appear earlier in Selected Works.</span>
        </label>
        <label
          className="studio-choice mt-6 max-w-md items-start"
        >
          <input form={formId} type="checkbox" name="featured" defaultChecked={project.featured} className="mt-0.5 size-4 accent-[#6b4dff]" />
          <span>
            <span className="flex items-center gap-2 font-medium">
              <Star className="size-4 text-[#1c120e]/45" aria-hidden="true" />
              Featured
            </span>
            <span className="mt-1 block font-normal text-[#1c120e]/55">Saved with the project. The public grid currently follows sort order.</span>
          </span>
        </label>
      </section>

      <details id="metadata" className={`group ${section}`}>
        <summary className={`${heading} flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden`}>
          <span className="flex items-center gap-2">
            <FileText className="size-5 text-[#1c120e]/55" aria-hidden="true" />
            Optional project metadata
          </span>
          <ChevronDown className="size-5 text-[#1c120e]/45 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#1c120e]/65">
          Optional information used for records, SEO, integrations or future presentation features.
        </p>
        <div className="mt-6 grid gap-5">
          <TextField form={formId} label="Client" name="client" defaultValue={project.client} />
          <TextField form={formId} label="Year" name="year" defaultValue={project.year} inputMode="numeric" />
          <TextField form={formId} label="Short description" name="shortDescription" defaultValue={project.shortDescription} multiline />
          <TextField form={formId} label="Full description" name="fullDescription" defaultValue={project.fullDescription} multiline />
          <div>
            <p className="text-sm font-medium">Services</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {services.map((service) => (
                <li key={service.id}>
                  <label className="studio-choice">
                    <input
                      form={formId}
                      type="checkbox"
                      name="serviceId"
                      value={service.id}
                      defaultChecked={selectedServiceIds.includes(service.id)}
                      className="size-4 accent-[#6b4dff]"
                    />
                    {service.title}
                    {service.published ? null : " (unpublished)"}
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium">Software</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {software.map((tool) => {
                const known = isSoftwareId(tool.key) ? softwareRegistry[tool.key] : null;
                const Icon = known?.Icon;
                return (
                  <li key={tool.id}>
                    <label className="studio-choice">
                      <input
                        form={formId}
                        type="checkbox"
                        name="softwareId"
                        value={tool.id}
                        defaultChecked={selectedSoftwareIds.includes(tool.id)}
                        className="size-4 accent-[#6b4dff]"
                      />
                      {Icon ? <Icon className="size-5 shrink-0" aria-hidden="true" /> : null}
                      {known?.label ?? tool.name}
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-[#1c120e]/10 pt-6">
          <h3 className="text-lg font-semibold tracking-tight">Credits</h3>
          <p className="mt-2 text-sm text-[#1c120e]/60">Saved separately from the project form.</p>
          <ProjectCredits projectId={project.id} credits={credits} />
        </div>
      </details>

      <details id="seo" className={`group ${section}`}>
        <summary className={`${heading} flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden`}>
          <span>SEO & sharing</span>
          <ChevronDown className="size-5 text-[#1c120e]/45 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <p className="mt-3 text-sm leading-relaxed text-[#1c120e]/65">
          Leave these blank to use the project title, then the short description, then the site description.
        </p>
        <div className="mt-6 grid gap-5">
          <label className="grid text-sm font-medium">
            SEO title
            <input form={formId} name="seoTitle" value={seoTitle} placeholder={project.title} onChange={(event) => setSeoTitle(event.target.value)} className={control} />
            <span className="mt-2 font-normal text-[#1c120e]/55">{seoTitle.length} characters · about 60 is a comfortable length</span>
          </label>
          <label className="grid text-sm font-medium">
            SEO description
            <textarea
              form={formId}
              name="seoDescription"
              value={seoDescription}
              placeholder={project.shortDescription || "Site description"}
              rows={4}
              onChange={(event) => setSeoDescription(event.target.value)}
              className={control}
            />
            <span className="mt-2 font-normal text-[#1c120e]/55">{seoDescription.length} characters · about 160 is a comfortable length</span>
          </label>
        </div>
      </details>

      <div className="flex justify-end">
        <DeleteProjectButton id={project.id} title={project.title} />
      </div>
    </div>
  );
}

function SetupItem({ done, label }: { done: boolean; label: string }) {
  return (
    <li className={`studio-pill${done ? " is-live" : ""}`}>
      {done ? <Check className="size-3.5" aria-hidden="true" /> : null}
      {label}
    </li>
  );
}

function Field({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <label className="grid text-sm font-medium">
      <span className="flex items-center gap-2">
        <span className="text-[#1c120e]/45">{icon}</span>
        {label}
      </span>
      {children}
    </label>
  );
}

function TextField({
  form,
  label,
  name,
  defaultValue,
  placeholder,
  multiline,
  inputMode,
}: {
  form: string;
  label: string;
  name: string;
  defaultValue: string;
  placeholder?: string;
  multiline?: boolean;
  inputMode?: "numeric";
}) {
  return (
    <label className="grid text-sm font-medium">
      {label}
      {multiline ? (
        <textarea form={form} name={name} defaultValue={defaultValue} placeholder={placeholder} rows={4} className={control} />
      ) : (
        <input form={form} name={name} defaultValue={defaultValue} placeholder={placeholder} inputMode={inputMode} className={control} />
      )}
    </label>
  );
}

function SaveButton({ saved, failed }: { saved: boolean; failed: boolean }) {
  const { pending } = useFormStatus();
  let label = "Save changes";
  if (pending) label = "Saving...";
  else if (failed) label = "Error saving";
  else if (saved) label = "Saved";

  return (
    <button
      type="submit"
      disabled={pending}
      className="studio-btn-primary"
    >
      {saved && !pending && !failed ? <Check className="size-4" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
      {label}
    </button>
  );
}

function fieldError(error: string | undefined, field: "slug" | "category") {
  if (!error) return null;
  const text = error.toLowerCase();
  if (field === "slug" && text.includes("slug")) return error;
  if (field === "category" && text.includes("category")) return error;
  return null;
}

function isSoftwareId(key: string): key is SoftwareId {
  return key in softwareRegistry;
}
