import "server-only";

import { getDb } from "@/lib/db";
import { ContentWriteError } from "@/lib/content/errors";
import { safeHrefSchema } from "@/lib/studio/urls";

export async function getPublicCta(key: "about" | "services" | "portfolio") {
  return getDb().cTA.findUnique({ where: { key } });
}

export async function saveCta(input: {
  key: "about" | "services" | "portfolio";
  heading: string;
  body: string;
  buttonLabel: string;
  buttonHref: string;
}) {
  const heading = input.heading.trim();
  const body = input.body.trim();
  const buttonLabel = input.buttonLabel.trim();
  if (!heading || !body || !buttonLabel) throw new ContentWriteError("Fill in the call to action.");
  const buttonHref = safeHrefSchema.parse(input.buttonHref);
  await getDb().cTA.upsert({
    where: { key: input.key },
    create: { key: input.key, heading, body, buttonLabel, buttonHref },
    update: { heading, body, buttonLabel, buttonHref },
  });
}
