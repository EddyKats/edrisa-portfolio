import "server-only";

import { navigation } from "@/data/navigation";
import { getDb } from "@/lib/db";
import { ContentWriteError } from "@/lib/content/errors";
import {
  kindFromMime,
  modeField,
  type HomeMediaKind,
  type HomeMediaMode,
  type HomeSurface,
} from "@/lib/content/home-surfaces";
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
  const hasHero = row.portraits.some((item) => item.surface === "hero");
  if (!hasHero && row.portraitUrl) {
    await db.homePortrait.create({
      data: {
        homeId: "home",
        surface: "hero",
        imageUrl: row.portraitUrl,
        kind: "IMAGE",
        sortOrder: 0,
        published: true,
      },
    });
    return getStudioHome();
  }
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

export async function saveHomeSurfaceMode(surface: HomeSurface, mode: HomeMediaMode) {
  const db = getDb();
  const home = await db.homeContent.findUnique({ where: { id: "home" } });
  if (!home) throw new ContentWriteError("Homepage content has not been seeded.");
  await db.homeContent.update({ where: { id: "home" }, data: { [modeField(surface)]: mode } });
}

export async function addHomeMedia(input: { surface: HomeSurface; url: string; mimeType: string | null }) {
  const db = getDb();
  const count = await db.homePortrait.count({ where: { homeId: "home", surface: input.surface } });
  const created = await db.homePortrait.create({
    data: {
      homeId: "home",
      surface: input.surface,
      imageUrl: input.url,
      kind: kindFromMime(input.mimeType),
      mimeType: input.mimeType,
      sortOrder: count,
      published: true,
    },
  });
  if (input.surface === "hero") await syncHeroStill();
  return created.id;
}

export async function saveHomeMediaItem(id: string, url: string, mimeType: string | null) {
  const db = getDb();
  const current = await db.homePortrait.findUnique({ where: { id } });
  if (!current) throw new ContentWriteError("That picture could not be found.");
  await db.homePortrait.update({
    where: { id },
    data: { imageUrl: url, kind: kindFromMime(mimeType), mimeType },
  });
  if (current.surface === "hero") await syncHeroStill();
  const warning =
    current.imageUrl !== url && current.imageUrl.startsWith("http") && !(await stillUsed(current.imageUrl))
      ? await removeStoredFile(current.imageUrl)
      : null;
  return { warning };
}

export async function deleteHomeMedia(id: string) {
  const db = getDb();
  const current = await db.homePortrait.findUnique({ where: { id } });
  if (!current) throw new ContentWriteError("That picture could not be found.");
  await db.homePortrait.delete({ where: { id } });
  if (current.surface === "hero") await syncHeroStill();
  return {
    warning: current.imageUrl.startsWith("http") && !(await stillUsed(current.imageUrl)) ? await removeStoredFile(current.imageUrl) : null,
  };
}

export async function moveHomeMedia(id: string, direction: "up" | "down") {
  const db = getDb();
  const current = await db.homePortrait.findUnique({ where: { id } });
  if (!current) return;
  const rows = await db.homePortrait.findMany({
    where: { homeId: "home", surface: current.surface },
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
  if (current.surface === "hero") await syncHeroStill();
}

export function framesFor(
  items: { imageUrl: string; kind: string; published: boolean }[],
  mode: string,
) {
  const published = items.filter((item) => item.published && item.imageUrl);
  const chosen = mode === "sequence" ? published : published.slice(0, 1);
  return chosen.map((item) => ({
    src: item.imageUrl,
    kind: (item.kind === "VIDEO" || item.kind === "GIF" ? item.kind : "IMAGE") as HomeMediaKind,
  }));
}

async function stillUsed(url: string) {
  const db = getDb();
  const [inGallery, home] = await Promise.all([
    db.homePortrait.count({ where: { imageUrl: url } }),
    db.homeContent.findUnique({ where: { id: "home" }, select: { portraitUrl: true } }),
  ]);
  return inGallery > 0 || home?.portraitUrl === url;
}

async function syncHeroStill() {
  const db = getDb();
  const firstImage = await db.homePortrait.findFirst({
    where: { homeId: "home", surface: "hero", published: true, kind: { not: "VIDEO" } },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  const firstAny = await db.homePortrait.findFirst({
    where: { homeId: "home", surface: "hero", published: true },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  const url = firstImage?.imageUrl ?? firstAny?.imageUrl ?? null;
  await db.$transaction([
    db.homeContent.update({ where: { id: "home" }, data: { portraitUrl: url } }),
    db.siteSettings.update({ where: { id: "site" }, data: { homepagePortraitUrl: firstImage?.imageUrl ?? null } }),
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
