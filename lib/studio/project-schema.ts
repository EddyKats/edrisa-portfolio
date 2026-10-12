import { z } from "zod";
import { ProjectSize } from "../../generated/prisma/enums";
import { slugify } from "./slug";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value.length === 0 ? null : value));

const title = z.string().trim().min(1, "Title is required.").max(160);
const slug = z
  .string()
  .trim()
  .min(1, "Slug is required.")
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens.");
const categoryIds = z.array(z.string().trim().min(1)).max(4);
const year = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\d{4}$/.test(value), "Year must be a four-digit year.")
  .transform((value) => (value === "" ? null : Number(value)))
  .refine((value) => value === null || (value >= 1900 && value <= 2100), "Year must be between 1900 and 2100.");
const sortOrder = z
  .string()
  .trim()
  .regex(/^\d+$/, "Sort order must be a whole number.")
  .transform(Number)
  .refine((value) => value <= 9999, "Sort order is too large.");

export const createProjectSchema = z.object({
  title,
  slug,
  categoryIds,
  role: optionalText(160),
  published: z.boolean(),
});

export const updateProjectSchema = z.object({
  title,
  slug,
  categoryIds,
  role: optionalText(160),
  client: z.string().trim().max(160),
  year,
  shortDescription: optionalText(500),
  fullDescription: optionalText(8000),
  size: z.enum([ProjectSize.STANDARD, ProjectSize.LARGE, ProjectSize.WIDE, ProjectSize.TALL]),
  sortOrder,
  featured: z.boolean(),
  seoTitle: optionalText(160),
  seoDescription: optionalText(320),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export function parseCreateProjectForm(formData: FormData) {
  const projectTitle = String(formData.get("title") ?? "");
  let projectSlug = String(formData.get("slug") ?? "");
  if (projectSlug.trim() === "") projectSlug = slugify(projectTitle);
  return parse(createProjectSchema, {
    title: projectTitle,
    slug: projectSlug,
    categoryIds: formData.getAll("categoryId").map(String),
    role: String(formData.get("role") ?? ""),
    published: formData.get("published") === "on",
  });
}

export function parseUpdateProjectForm(formData: FormData) {
  return parse(updateProjectSchema, {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    categoryIds: formData.getAll("categoryId").map(String),
    role: String(formData.get("role") ?? ""),
    client: String(formData.get("client") ?? ""),
    year: String(formData.get("year") ?? ""),
    shortDescription: String(formData.get("shortDescription") ?? ""),
    fullDescription: String(formData.get("fullDescription") ?? ""),
    size: String(formData.get("size") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? "0"),
    featured: formData.get("featured") === "on",
    seoTitle: String(formData.get("seoTitle") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
  });
}

function parse<T>(schema: z.ZodType<T>, value: unknown) {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }
  return { ok: true as const, data: parsed.data };
}
