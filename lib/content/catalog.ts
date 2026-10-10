import "server-only";

import { getDb } from "@/lib/db";
import { ContentWriteError } from "@/lib/content/errors";
import { removeStoredFile } from "@/lib/content/media";
import { slugify } from "@/lib/studio/slug";
import { httpsUrlSchema } from "@/lib/studio/urls";

const serviceIcons = ["gem", "zap", "layers"] as const;
const surfaces = ["about", "services", "portfolio"] as const;

export async function getPublicServices() {
  const db = getDb();
  const [services, packages, clients] = await Promise.all([
    db.service.findMany({ where: { published: true }, orderBy: [{ sortOrder: "asc" }, { title: "asc" }] }),
    db.capabilityPackage.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      include: { items: { orderBy: [{ sortOrder: "asc" }, { label: "asc" }] } },
    }),
    db.client.findMany({ where: { published: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);

  return {
    services: services.map((service, index) => ({
      title: service.title,
      summary: service.description,
      icon: isServiceIcon(service.icon) ? service.icon : "layers",
      surface: surfaces[index % surfaces.length]!,
    })),
    packages: packages.map((entry) => ({
      id: entry.id,
      name: entry.title,
      description: entry.description,
      buttonLabel: entry.buttonLabel,
      items: entry.items.map((item) => item.label),
    })),
    clients: clients.map((client) => ({
      id: client.id,
      name: client.name,
      logoUrl: client.logoUrl,
      website: client.website,
    })),
  };
}

export async function listStudioCatalog() {
  const db = getDb();
  const [services, packages, clients] = await Promise.all([
    db.service.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }] }),
    db.capabilityPackage.findMany({
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      include: { items: { orderBy: [{ sortOrder: "asc" }, { label: "asc" }] } },
    }),
    db.client.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);
  return { services, packages, clients };
}

export async function saveService(input: {
  id?: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  published: boolean;
}) {
  const title = required(input.title, "title");
  const description = required(input.description, "description");
  const slug = slugify(input.slug || title);
  if (!slug) throw new ContentWriteError("Add a slug.");
  if (!isServiceIcon(input.icon)) throw new ContentWriteError("Choose gem, zap, or layers.");
  const db = getDb();
  if (input.id) {
    await db.service.update({
      where: { id: input.id },
      data: { title, slug, description, icon: input.icon, published: input.published },
    });
    return;
  }
  const count = await db.service.count();
  await db.service.create({ data: { title, slug, description, icon: input.icon, published: input.published, sortOrder: count } });
}

export async function deleteService(id: string) {
  await getDb().service.delete({ where: { id } });
}

export async function moveService(id: string, direction: "up" | "down") {
  await moveAll("service", id, direction);
}

export async function savePackage(input: {
  id?: string;
  title: string;
  description: string | null;
  buttonLabel: string;
  published: boolean;
}) {
  const title = required(input.title, "package title");
  const buttonLabel = required(input.buttonLabel, "button label");
  const db = getDb();
  if (input.id) {
    await db.capabilityPackage.update({
      where: { id: input.id },
      data: { title, description: input.description, buttonLabel, published: input.published },
    });
    return input.id;
  }
  const count = await db.capabilityPackage.count();
  const created = await db.capabilityPackage.create({
    data: { title, description: input.description, buttonLabel, published: input.published, sortOrder: count },
  });
  return created.id;
}

export async function deletePackage(id: string) {
  await getDb().capabilityPackage.delete({ where: { id } });
}

export async function movePackage(id: string, direction: "up" | "down") {
  await moveAll("capabilityPackage", id, direction);
}

export async function saveCapabilityItem(input: { id?: string; packageId: string; label: string }) {
  const label = required(input.label, "item");
  const db = getDb();
  const owner = await db.capabilityPackage.findUnique({ where: { id: input.packageId }, select: { id: true } });
  if (!owner) throw new ContentWriteError("That package could not be found.");
  if (input.id) {
    await db.capabilityItem.update({ where: { id: input.id }, data: { label } });
    return;
  }
  const count = await db.capabilityItem.count({ where: { packageId: input.packageId } });
  await db.capabilityItem.create({ data: { packageId: input.packageId, label, sortOrder: count } });
}

export async function deleteCapabilityItem(id: string) {
  await getDb().capabilityItem.delete({ where: { id } });
}

export async function moveCapabilityItem(id: string, direction: "up" | "down") {
  const db = getDb();
  const current = await db.capabilityItem.findUnique({ where: { id }, select: { packageId: true } });
  if (!current) return;
  const rows = await db.capabilityItem.findMany({
    where: { packageId: current.packageId },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true },
  });
  const next = shifted(rows, id, direction);
  if (!next) return;
  await db.$transaction(next.map((row, sortOrder) => db.capabilityItem.update({ where: { id: row.id }, data: { sortOrder } })));
}

export async function saveClient(input: {
  id?: string;
  name: string;
  website: string | null;
  published: boolean;
}) {
  const name = required(input.name, "client name");
  const website = input.website ? httpsUrlSchema.parse(input.website) : null;
  const db = getDb();
  if (input.id) {
    await db.client.update({ where: { id: input.id }, data: { name, website, published: input.published } });
    return input.id;
  }
  const count = await db.client.count();
  const created = await db.client.create({ data: { name, website, published: input.published, sortOrder: count } });
  return created.id;
}

export async function saveClientLogo(id: string, url: string) {
  const db = getDb();
  const current = await db.client.findUnique({ where: { id }, select: { logoUrl: true } });
  if (!current) throw new ContentWriteError("That client could not be found.");
  await db.client.update({ where: { id }, data: { logoUrl: url } });
  return { warning: current.logoUrl && current.logoUrl !== url ? await removeStoredFile(current.logoUrl) : null };
}

export async function clearClientLogo(id: string) {
  const db = getDb();
  const current = await db.client.findUnique({ where: { id }, select: { logoUrl: true } });
  if (!current) throw new ContentWriteError("That client could not be found.");
  await db.client.update({ where: { id }, data: { logoUrl: null } });
  return { warning: await removeStoredFile(current.logoUrl) };
}

export async function deleteClient(id: string) {
  const current = await getDb().client.findUnique({ where: { id }, select: { logoUrl: true } });
  await getDb().client.delete({ where: { id } });
  return { warning: await removeStoredFile(current?.logoUrl) };
}

export async function moveClient(id: string, direction: "up" | "down") {
  await moveAll("client", id, direction);
}

function isServiceIcon(value: string): value is (typeof serviceIcons)[number] {
  return serviceIcons.includes(value as (typeof serviceIcons)[number]);
}

function required(value: string, name: string) {
  const text = value.trim();
  if (!text) throw new ContentWriteError(`Add a ${name}.`);
  return text;
}

async function moveAll(table: "service" | "capabilityPackage" | "client", id: string, direction: "up" | "down") {
  const db = getDb();
  const rows =
    table === "service"
      ? await db.service.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { id: true } })
      : table === "client"
        ? await db.client.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { id: true } })
        : await db.capabilityPackage.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { id: true } });
  const next = shifted(rows, id, direction);
  if (!next) return;
  await db.$transaction(
    next.map((row, sortOrder) => {
      if (table === "service") return db.service.update({ where: { id: row.id }, data: { sortOrder } });
      if (table === "client") return db.client.update({ where: { id: row.id }, data: { sortOrder } });
      return db.capabilityPackage.update({ where: { id: row.id }, data: { sortOrder } });
    }),
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
