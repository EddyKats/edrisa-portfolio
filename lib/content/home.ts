import "server-only";

import { navigation } from "@/data/navigation";
import { getDb } from "@/lib/db";
import { ContentWriteError } from "@/lib/content/errors";
import { removeStoredFile } from "@/lib/content/media";

export async function getHomeLabels() {
  const row = await getDb().homeContent.findUnique({ where: { id: "home" } });
  // Navigation labels fill in only when the home singleton row or a tile label is missing.
  return {
    about: row?.aboutTileLabel ?? label("about"),
    services: row?.servicesTileLabel ?? label("services"),
    contact: row?.contactTileLabel ?? label("contact"),
    portfolio: row?.portfolioTileLabel ?? label("portfolio"),
  };
}

export async function getStudioHome() {
  const row = await getDb().homeContent.findUnique({ where: { id: "home" } });
  if (!row) throw new ContentWriteError("Homepage content has not been seeded.");
  return row;
}

export async function saveHomeLabels(input: {
  aboutTileLabel: string;
  servicesTileLabel: string;
  contactTileLabel: string;
  portfolioTileLabel: string;
}) {
  const labels = {
    aboutTileLabel: required(input.aboutTileLabel, "About tile"),
    servicesTileLabel: required(input.servicesTileLabel, "Services tile"),
    contactTileLabel: required(input.contactTileLabel, "Contact tile"),
    portfolioTileLabel: required(input.portfolioTileLabel, "Portfolio tile"),
  };
  await getDb().homeContent.update({ where: { id: "home" }, data: labels });
}

export async function saveHomePortrait(url: string) {
  const db = getDb();
  const current = await db.homeContent.findUnique({ where: { id: "home" }, select: { portraitUrl: true } });
  await db.$transaction([
    db.homeContent.update({ where: { id: "home" }, data: { portraitUrl: url } }),
    db.siteSettings.update({ where: { id: "site" }, data: { homepagePortraitUrl: url } }),
  ]);
  const warning =
    current?.portraitUrl && current.portraitUrl !== url && current.portraitUrl.startsWith("http")
      ? await removeStoredFile(current.portraitUrl)
      : null;
  return { warning };
}

function label(id: "about" | "services" | "contact" | "portfolio") {
  return navigation.find((item) => item.id === id)?.title ?? id;
}

function required(value: string, name: string) {
  const text = value.trim();
  if (!text) throw new ContentWriteError(`Add the ${name} label.`);
  return text;
}
