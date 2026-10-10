import "server-only";

import { getDb } from "@/lib/db";
import { ContentWriteError } from "@/lib/content/errors";
import { removeStoredFile } from "@/lib/content/media";
import { safeHrefSchema } from "@/lib/studio/urls";

const statIcons = ["layers", "sparkles", "clock"] as const;
const tones = ["cyan", "violet", "magenta"] as const;

export async function getPublicAbout() {
  const db = getDb();
  const [content, stats, experience] = await Promise.all([
    db.aboutContent.findUnique({ where: { id: "about" } }),
    db.aboutStat.findMany({ where: { published: true }, orderBy: [{ sortOrder: "asc" }, { label: "asc" }] }),
    db.experience.findMany({ where: { published: true }, orderBy: [{ sortOrder: "asc" }, { company: "asc" }] }),
  ]);

  return {
    content,
    stats: stats.map((stat, index) => ({
      value: stat.value,
      label: stat.label,
      icon: isStatIcon(stat.icon) ? stat.icon : "layers",
      tone: tones[index % tones.length]!,
    })),
    experience: experience.map((entry) => ({
      id: entry.id,
      company: entry.company,
      role: entry.role,
      note: entry.microcopy ?? "",
      imageUrl: entry.imageUrl,
      initials: initialsFor(entry.company),
    })),
  };
}

export async function getStudioAbout() {
  const db = getDb();
  const [content, stats, experience] = await Promise.all([
    db.aboutContent.findUnique({ where: { id: "about" } }),
    db.aboutStat.findMany({ orderBy: [{ sortOrder: "asc" }, { label: "asc" }] }),
    db.experience.findMany({ orderBy: [{ sortOrder: "asc" }, { company: "asc" }] }),
  ]);
  if (!content) throw new ContentWriteError("About content has not been seeded.");
  return { content, stats, experience };
}

export async function saveAboutContent(input: {
  pageTitle: string;
  introHeading: string;
  introParagraph: string;
  storyHeading: string;
  storyBody: string;
  seoTitle: string | null;
  seoDescription: string | null;
  ctaHeading: string;
  ctaText: string;
  ctaButtonLabel: string;
  ctaButtonHref: string;
}) {
  const pageTitle = required(input.pageTitle, "page title");
  const introHeading = required(input.introHeading, "intro heading");
  const introParagraph = required(input.introParagraph, "intro");
  const storyHeading = required(input.storyHeading, "story heading");
  const storyBody = required(input.storyBody, "story");
  const ctaButtonHref = safeHrefSchema.parse(input.ctaButtonHref);
  const db = getDb();
  await db.$transaction([
    db.aboutContent.update({
      where: { id: "about" },
      data: {
        pageTitle,
        introHeading,
        introParagraph,
        storyHeading,
        storyBody,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        ctaHeading: input.ctaHeading.trim(),
        ctaText: input.ctaText.trim(),
        ctaButtonLabel: input.ctaButtonLabel.trim(),
        ctaButtonHref,
      },
    }),
    db.cTA.upsert({
      where: { key: "about" },
      create: {
        key: "about",
        heading: required(input.ctaHeading, "call to action heading"),
        body: required(input.ctaText, "call to action"),
        buttonLabel: required(input.ctaButtonLabel, "button label"),
        buttonHref: ctaButtonHref,
      },
      update: {
        heading: required(input.ctaHeading, "call to action heading"),
        body: required(input.ctaText, "call to action"),
        buttonLabel: required(input.ctaButtonLabel, "button label"),
        buttonHref: ctaButtonHref,
      },
    }),
  ]);
}

export async function saveAboutFeature(url: string) {
  const db = getDb();
  const current = await db.aboutContent.findUnique({ where: { id: "about" }, select: { featureMediaUrl: true } });
  await db.aboutContent.update({
    where: { id: "about" },
    data: { featureMediaUrl: url, featureMediaType: "image" },
  });
  return { warning: current?.featureMediaUrl && current.featureMediaUrl !== url ? await removeStoredFile(current.featureMediaUrl) : null };
}

export async function clearAboutFeature() {
  const db = getDb();
  const current = await db.aboutContent.findUnique({ where: { id: "about" }, select: { featureMediaUrl: true } });
  await db.aboutContent.update({
    where: { id: "about" },
    data: { featureMediaUrl: null, featureMediaType: null },
  });
  return { warning: await removeStoredFile(current?.featureMediaUrl) };
}

export async function saveAboutStat(input: {
  id?: string;
  value: string;
  label: string;
  icon: string;
  published: boolean;
}) {
  if (!isStatIcon(input.icon)) throw new ContentWriteError("Choose layers, sparkles, or clock.");
  const value = required(input.value, "stat value");
  const label = required(input.label, "stat label");
  const db = getDb();
  if (input.id) {
    await db.aboutStat.update({ where: { id: input.id }, data: { value, label, icon: input.icon, published: input.published } });
    return;
  }
  const count = await db.aboutStat.count();
  await db.aboutStat.create({ data: { value, label, icon: input.icon, published: input.published, sortOrder: count } });
}

export async function deleteAboutStat(id: string) {
  await getDb().aboutStat.delete({ where: { id } });
}

export async function moveAboutStat(id: string, direction: "up" | "down") {
  await moveRows("aboutStat", id, direction);
}

export async function saveExperience(input: {
  id?: string;
  company: string;
  role: string;
  microcopy: string | null;
  startDate: Date | null;
  endDate: Date | null;
  published: boolean;
}) {
  const company = required(input.company, "company");
  const role = required(input.role, "role");
  const db = getDb();
  const data = {
    company,
    role,
    microcopy: input.microcopy,
    startDate: input.startDate,
    endDate: input.endDate,
    published: input.published,
  };
  if (input.id) {
    await db.experience.update({ where: { id: input.id }, data });
    return input.id;
  }
  const count = await db.experience.count();
  const created = await db.experience.create({ data: { ...data, sortOrder: count } });
  return created.id;
}

export async function saveExperienceImage(id: string, url: string) {
  const db = getDb();
  const current = await db.experience.findUnique({ where: { id }, select: { imageUrl: true } });
  if (!current) throw new ContentWriteError("That experience could not be found.");
  await db.experience.update({ where: { id }, data: { imageUrl: url } });
  return { warning: current.imageUrl && current.imageUrl !== url ? await removeStoredFile(current.imageUrl) : null };
}

export async function clearExperienceImage(id: string) {
  const db = getDb();
  const current = await db.experience.findUnique({ where: { id }, select: { imageUrl: true } });
  if (!current) throw new ContentWriteError("That experience could not be found.");
  await db.experience.update({ where: { id }, data: { imageUrl: null } });
  return { warning: await removeStoredFile(current.imageUrl) };
}

export async function deleteExperience(id: string) {
  const current = await getDb().experience.findUnique({ where: { id }, select: { imageUrl: true } });
  await getDb().experience.delete({ where: { id } });
  return { warning: await removeStoredFile(current?.imageUrl) };
}

export async function moveExperience(id: string, direction: "up" | "down") {
  await moveRows("experience", id, direction);
}

export function parseDate(value: string) {
  const text = value.trim();
  if (!text) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new ContentWriteError("Use a real date.");
  return new Date(`${text}T00:00:00.000Z`);
}

export function dateField(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

function isStatIcon(value: string): value is (typeof statIcons)[number] {
  return statIcons.includes(value as (typeof statIcons)[number]);
}

function initialsFor(company: string) {
  const words = company.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0]!.slice(0, 1).toUpperCase();
  return `${words[0]!.slice(0, 1)}${words[1]!.slice(0, 1)}`.toUpperCase();
}

function required(value: string, name: string) {
  const text = value.trim();
  if (!text) throw new ContentWriteError(`Add a ${name}.`);
  return text;
}

async function moveRows(table: "aboutStat" | "experience", id: string, direction: "up" | "down") {
  const db = getDb();
  const rows =
    table === "aboutStat"
      ? await db.aboutStat.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { id: true } })
      : await db.experience.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { id: true } });
  const next = shifted(rows, id, direction);
  if (!next) return;
  await db.$transaction(
    next.map((row, sortOrder) =>
      table === "aboutStat"
        ? db.aboutStat.update({ where: { id: row.id }, data: { sortOrder } })
        : db.experience.update({ where: { id: row.id }, data: { sortOrder } }),
    ),
  );
}

function shifted(rows: { id: string }[], id: string, direction: "up" | "down") {
  const index = rows.findIndex((row) => row.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= rows.length) return null;
  const next = rows.slice();
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item!);
  return next;
}
