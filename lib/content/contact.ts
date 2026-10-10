import "server-only";

import { getDb } from "@/lib/db";
import { ContentWriteError } from "@/lib/content/errors";

export async function getPublicContact() {
  return getDb().contactContent.findUnique({ where: { id: "contact" } });
}

export async function getStudioContact() {
  const row = await getPublicContact();
  if (!row) throw new ContentWriteError("Contact content has not been seeded.");
  return row;
}

export async function saveContactContent(input: {
  pageTitle: string;
  subtitle: string | null;
  location: string | null;
  email: string | null;
  phone: string | null;
  formHeading: string | null;
  socialHeading: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}) {
  if (!input.pageTitle.trim()) throw new ContentWriteError("Add a page title.");
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    throw new ContentWriteError("That email doesn't look usable.");
  }
  await getDb().contactContent.update({
    where: { id: "contact" },
    data: { ...input, pageTitle: input.pageTitle.trim() },
  });
}
