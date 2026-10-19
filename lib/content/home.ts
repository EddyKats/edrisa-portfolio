import "server-only";

import { navigation } from "@/data/navigation";
import { getDb } from "@/lib/db";
import { ContentWriteError } from "@/lib/content/errors";
import { removeStoredFile } from "@/lib/content/media";

export async function getHomeLabels() {
  const row = await getDb().homeContent.findUnique({ where: { id: "home" } });
  return {
    about: row?.aboutTileLabel ?? label("about"),
    services: row?.servicesTileLabel ?? label("services"),
    contact: row?.contactTileLabel ?? label("contact"),
    portfolio: row?.portfolioTileLabel ?? label("portfolio"),
  };
}

export async function getStudioHome() {
  const db = getDb();
  const row = await db.homeContent.findUnique({
    where: { id: "home" },
    include: { portraits: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
  });
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

export async function saveHomePortraitMode(mode: "single" | "sequence") {
  const db = getDb();
  const home = await db.homeContent.findUnique({
    where: { id: "home" },
    include: { portraits: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
  });
  if (!home) throw new ContentWriteError("Homepage content has not been seeded.");

  if (mode === "sequence" && home.portraits.length === 0 && home.portraitUrl) {
    await db.homePortrait.create({
      data: { homeId: "home", imageUrl: home.portraitUrl, sortOrder: 0, published: true },
    });
  }

  await db.homeContent.update({ where: { id: "home" }, data: { portraitMode: mode } });
}

export async function saveHomePortrait(url: string) {
  const db = getDb();
  const current = await db.homeContent.findUnique({ where: { id: "home" }, select: { portraitUrl: true } });
  await syncPrimaryPortrait(url);
  const warning =
    current?.portraitUrl && current.portraitUrl !== url && current.portraitUrl.startsWith("http") && !(await stillUsed(current.portraitUrl))
      ? await removeStoredFile(current.portraitUrl)
      : null;
  return { warning };
}

export async function addHomePortrait(url: string) {
  const db = getDb();
  const count = await db.homePortrait.count({ where: { homeId: "home" } });
  const created = await db.homePortrait.create({
    data: { homeId: "home", imageUrl: url, sortOrder: count, published: true },
  });
  if (count === 0) await syncPrimaryPortrait(url);
  return created.id;
}

export async function saveHomePortraitItem(id: string, url: string) {
  const db = getDb();
  const current = await db.homePortrait.findUnique({ where: { id } });
  if (!current) throw new ContentWriteError("That picture could not be found.");
  await db.homePortrait.update({ where: { id }, data: { imageUrl: url } });
  const first = await db.homePortrait.findFirst({
    where: { homeId: "home", published: true },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  if (first?.id === id) await syncPrimaryPortrait(url);
  const warning =
    current.imageUrl !== url && current.imageUrl.startsWith("http") && !(await stillUsed(current.imageUrl))
      ? await removeStoredFile(current.imageUrl)
      : null;
  return { warning };
}

export async function deleteHomePortrait(id: string) {
  const db = getDb();
  const current = await db.homePortrait.findUnique({ where: { id } });
  if (!current) throw new ContentWriteError("That picture could not be found.");
  await db.homePortrait.delete({ where: { id } });
  const first = await db.homePortrait.findFirst({
    where: { homeId: "home", published: true },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  await syncPrimaryPortrait(first?.imageUrl ?? current.imageUrl);
  return {
    warning: current.imageUrl.startsWith("http") && !(await stillUsed(current.imageUrl)) ? await removeStoredFile(current.imageUrl) : null,
  };
}

export async function moveHomePortrait(id: string, direction: "up" | "down") {
  const db = getDb();
  const rows = await db.homePortrait.findMany({
    where: { homeId: "home" },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true },
  });
  const index = rows.findIndex((row) => row.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= rows.length) return;
  const next = rows.slice();
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item!);
  await db.$transaction(next.map((row, sortOrder) => db.homePortrait.update({ where: { id: row.id }, data: { sortOrder } })));
  const first = next[0];
  if (first) {
    const row = await db.homePortrait.findUnique({ where: { id: first.id } });
    if (row) await syncPrimaryPortrait(row.imageUrl);
  }
}

async function stillUsed(url: string) {
  const db = getDb();
  const [inGallery, home] = await Promise.all([
    db.homePortrait.count({ where: { imageUrl: url } }),
    db.homeContent.findUnique({ where: { id: "home" }, select: { portraitUrl: true } }),
  ]);
  return inGallery > 0 || home?.portraitUrl === url;
}

async function syncPrimaryPortrait(url: string | null) {
  const db = getDb();
  await db.$transaction([
    db.homeContent.update({ where: { id: "home" }, data: { portraitUrl: url } }),
    db.siteSettings.update({ where: { id: "site" }, data: { homepagePortraitUrl: url } }),
  ]);
}

function label(id: "about" | "services" | "contact" | "portfolio") {
  return navigation.find((item) => item.id === id)?.homeLabel ?? id;
}

function required(value: string, name: string) {
  const text = value.trim();
  if (!text) throw new ContentWriteError(`Add the ${name} label.`);
  return text;
}
