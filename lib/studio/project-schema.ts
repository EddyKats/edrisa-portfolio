import { z } from "zod";
import { ProjectSize } from "../../generated/prisma/enums";
import { slugify } from "./slug";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value.length === 0 ? null : value));

export const projectFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(160),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  categoryId: z.string().trim().min(1, "Choose a category."),
  client: z.string().trim().min(1, "Client is required.").max(160),
  year: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d{4}$/.test(value), "Year must be a four-digit year.")
    .transform((value) => (value === "" ? null : Number(value)))
    .refine((value) => value === null || (value >= 1900 && value <= 2100), "Year must be between 1900 and 2100."),
  role: optionalText(160),
  shortDescription: optionalText(500),
  fullDescription: optionalText(8000),
  size: z.enum([ProjectSize.STANDARD, ProjectSize.LARGE, ProjectSize.WIDE, ProjectSize.TALL]),
  sortOrder: z
    .string()
    .trim()
    .regex(/^\d+$/, "Sort order must be a whole number.")
    .transform(Number)
    .refine((value) => value <= 9999, "Sort order is too large."),
  featured: z.boolean(),
  published: z.boolean(),
  seoTitle: optionalText(160),
  seoDescription: optionalText(320),
});

export type ProjectInput = z.infer<typeof projectFormSchema>;

export function parseProjectForm(formData: FormData, options: { generateSlug: boolean }) {
  const title = String(formData.get("title") ?? "");
  let slug = String(formData.get("slug") ?? "");
  if (options.generateSlug && slug.trim() === "") slug = slugify(title);

  const parsed = projectFormSchema.safeParse({
    title,
    slug,
    categoryId: String(formData.get("categoryId") ?? ""),
    client: String(formData.get("client") ?? ""),
    year: String(formData.get("year") ?? ""),
    role: String(formData.get("role") ?? ""),
    shortDescription: String(formData.get("shortDescription") ?? ""),
    fullDescription: String(formData.get("fullDescription") ?? ""),
    size: String(formData.get("size") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? "0"),
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
    seoTitle: String(formData.get("seoTitle") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
  });

  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  return { ok: true as const, data: parsed.data };
}
