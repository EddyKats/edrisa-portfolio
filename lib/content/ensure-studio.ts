import "server-only";

import { aboutCopy, aboutJourney, aboutMeta, aboutProfile } from "@/data/about";
import { contactCopy, contactDetails, contactMeta } from "@/data/contact";
import { serviceClientRows } from "@/data/clients";
import { navigation } from "@/data/navigation";
import { portfolioCopy } from "@/data/portfolio";
import { projectCta } from "@/data/project-cta";
import { capabilityPackages, serviceOffers, servicesCopy } from "@/data/services";
import { site, socialLinks } from "@/data/site";
import { getDb } from "@/lib/db";
import { displayFromTelHref, telFromWhatsapp } from "@/lib/content/phone";
import { slugify } from "@/lib/studio/slug";

const publicPhone = (() => {
  const href = telFromWhatsapp(socialLinks.whatsapp);
  return href ? displayFromTelHref(href) : contactDetails.phone;
})();

export async function ensureStudioContent() {
  const db = getDb();
  if (!(await needsSiteAlign(db))) return;

  const tile = (id: "about" | "services" | "contact" | "portfolio") =>
    navigation.find((item) => item.id === id)?.homeLabel ?? id;

  await db.siteSettings.upsert({
    where: { id: "site" },
    create: {
      id: "site",
      siteName: site.name,
      siteUrl: site.url,
      homepagePortraitUrl: site.portraitSrc,
      logoUrl: site.logoSrc,
      behanceUrl: socialLinks.behance,
      linkedinUrl: socialLinks.linkedin,
      whatsappUrl: socialLinks.whatsapp,
      contactEmail: contactDetails.email,
      contactPhone: publicPhone,
      location: null,
      footerText: site.footerNote,
      footerSecondaryText: null,
      defaultSeoTitle: site.title,
      defaultSeoDescription: site.description,
    },
    update: {
      siteName: site.name,
      siteUrl: site.url,
      behanceUrl: socialLinks.behance,
      linkedinUrl: socialLinks.linkedin,
      whatsappUrl: socialLinks.whatsapp,
      contactEmail: contactDetails.email,
      contactPhone: publicPhone,
      location: null,
      footerText: site.footerNote,
      defaultSeoTitle: site.title,
      defaultSeoDescription: site.description,
    },
  });

  await db.homeContent.upsert({
    where: { id: "home" },
    create: {
      id: "home",
      portraitUrl: site.portraitSrc,
      logoUrl: site.logoSrc,
      aboutTileLabel: tile("about"),
      servicesTileLabel: tile("services"),
      contactTileLabel: tile("contact"),
      portfolioTileLabel: tile("portfolio"),
    },
    update: {
      aboutTileLabel: tile("about"),
      servicesTileLabel: tile("services"),
      contactTileLabel: tile("contact"),
      portfolioTileLabel: tile("portfolio"),
    },
  });

  const aboutStory = aboutProfile.experience
    .map((entry) => `${entry.company} — ${entry.steps[entry.steps.length - 1]}. ${entry.note}`)
    .join("\n\n");

  await db.aboutContent.upsert({
    where: { id: "about" },
    create: {
      id: "about",
      pageTitle: aboutProfile.bioHeading,
      introHeading: aboutProfile.title,
      introParagraph: aboutProfile.bio.join("\n\n"),
      storyHeading: "Experience",
      storyBody: aboutStory,
      featureMediaUrl: null,
      featureMediaType: null,
      ctaHeading: projectCta.heading,
      ctaText: aboutCopy.ctaBody,
      ctaButtonLabel: projectCta.label,
      ctaButtonHref: "/contact",
      seoTitle: aboutMeta.title,
      seoDescription: aboutMeta.description,
    },
    update: {
      pageTitle: aboutProfile.bioHeading,
      introHeading: aboutProfile.title,
      introParagraph: aboutProfile.bio.join("\n\n"),
      storyHeading: "Experience",
      storyBody: aboutStory,
      ctaHeading: projectCta.heading,
      ctaText: aboutCopy.ctaBody,
      ctaButtonLabel: projectCta.label,
      ctaButtonHref: "/contact",
      seoTitle: aboutMeta.title,
      seoDescription: aboutMeta.description,
    },
  });

  await db.aboutStat.deleteMany({
    where: {
      OR: [{ value: "00+" }, { label: { contains: "Perfectionism" } }, { label: { contains: "Arguing With Pixels" } }],
    },
  });
  await db.aboutStat.updateMany({ data: { published: false } });

  await db.experience.deleteMany({ where: { company: { equals: "Washo", mode: "insensitive" } } });
  for (const [index, entry] of aboutJourney.entries()) {
    const role = entry.role;
    const match = await db.experience.findFirst({
      where: { company: { equals: entry.company, mode: "insensitive" } },
    });
    if (match) {
      await db.experience.update({
        where: { id: match.id },
        data: {
          company: entry.company,
          role,
          microcopy: entry.note,
          startDate: null,
          endDate: null,
          sortOrder: index,
          published: true,
        },
      });
    } else {
      await db.experience.create({
        data: {
          company: entry.company,
          role,
          microcopy: entry.note,
          startDate: null,
          endDate: null,
          sortOrder: index,
          published: true,
        },
      });
    }
  }

  const serviceSlugs = new Set<string>();
  for (const [index, offer] of serviceOffers.entries()) {
    const slug = slugify(offer.title);
    serviceSlugs.add(slug);
    await db.service.upsert({
      where: { slug },
      create: {
        title: offer.title,
        slug,
        description: offer.summary,
        icon: offer.icon,
        sortOrder: index,
        published: true,
      },
      update: {
        title: offer.title,
        description: offer.summary,
        icon: offer.icon,
        sortOrder: index,
        published: true,
      },
    });
  }
  await db.service.updateMany({
    where: { slug: { notIn: [...serviceSlugs] } },
    data: { published: false },
  });

  const packageTitles = new Set<string>(capabilityPackages.map((entry) => entry.name));
  const packages = await db.capabilityPackage.findMany({ include: { items: true } });
  for (const row of packages) {
    if (!packageTitles.has(row.title)) {
      await db.capabilityPackage.update({ where: { id: row.id }, data: { published: false } });
    }
  }
  for (const [index, entry] of capabilityPackages.entries()) {
    const existing = await db.capabilityPackage.findFirst({ where: { title: entry.name } });
    if (existing) {
      await db.capabilityPackage.update({
        where: { id: existing.id },
        data: {
          title: entry.name,
          buttonLabel: servicesCopy.talkLabel,
          sortOrder: index,
          published: true,
        },
      });
      await db.capabilityItem.deleteMany({ where: { packageId: existing.id } });
      await db.capabilityItem.createMany({
        data: entry.items.map((label, itemIndex) => ({
          packageId: existing.id,
          label,
          sortOrder: itemIndex,
        })),
      });
      continue;
    }
    await db.capabilityPackage.create({
      data: {
        title: entry.name,
        buttonLabel: servicesCopy.talkLabel,
        sortOrder: index,
        published: true,
        items: {
          create: entry.items.map((label, itemIndex) => ({
            label,
            sortOrder: itemIndex,
          })),
        },
      },
    });
  }

  const listedClients = serviceClientRows.flat();
  const clientNames = listedClients.map((client) => client.name.toLowerCase());
  const clients = await db.client.findMany();
  for (const row of clients) {
    if (!clientNames.includes(row.name.toLowerCase())) {
      await db.client.update({ where: { id: row.id }, data: { published: false } });
    }
  }
  for (const [index, client] of listedClients.entries()) {
    const existing = await db.client.findFirst({
      where: { name: { equals: client.name, mode: "insensitive" } },
    });
    if (existing) {
      await db.client.update({
        where: { id: existing.id },
        data: {
          name: client.name,
          logoUrl: client.src,
          website: null,
          sortOrder: index,
          published: true,
        },
      });
      continue;
    }
    await db.client.create({
      data: {
        name: client.name,
        logoUrl: client.src,
        website: null,
        sortOrder: index,
        published: true,
      },
    });
  }

  await db.contactContent.upsert({
    where: { id: "contact" },
    create: {
      id: "contact",
      pageTitle: `${contactCopy.title} ${contactCopy.titleLine}`,
      subtitle: contactCopy.arrived,
      location: null,
      email: contactDetails.email,
      phone: publicPhone,
      formHeading: contactCopy.formHeading,
      socialHeading: contactCopy.socialHeading,
      seoTitle: contactMeta.title,
      seoDescription: contactMeta.description,
    },
    update: {
      pageTitle: `${contactCopy.title} ${contactCopy.titleLine}`,
      subtitle: contactCopy.arrived,
      location: null,
      email: contactDetails.email,
      phone: publicPhone,
      formHeading: contactCopy.formHeading,
      socialHeading: contactCopy.socialHeading,
      seoTitle: contactMeta.title,
      seoDescription: contactMeta.description,
    },
  });

  const calls = [
    {
      key: "about",
      heading: projectCta.heading,
      body: aboutCopy.ctaBody,
      buttonLabel: projectCta.label,
      buttonHref: "/contact",
    },
    {
      key: "services",
      heading: projectCta.heading,
      body: servicesCopy.ctaBody,
      buttonLabel: projectCta.label,
      buttonHref: "/contact",
    },
    {
      key: "portfolio",
      heading: projectCta.heading,
      body: portfolioCopy.ctaBody,
      buttonLabel: projectCta.label,
      buttonHref: "/contact",
    },
  ] as const;

  for (const call of calls) {
    await db.cTA.upsert({
      where: { key: call.key },
      create: call,
      update: {
        heading: call.heading,
        body: call.body,
        buttonLabel: call.buttonLabel,
        buttonHref: call.buttonHref,
      },
    });
  }
}

async function needsSiteAlign(db: ReturnType<typeof getDb>) {
  const [about, contact, settings, home, wash, placeholderStat, graphicDesign] = await Promise.all([
    db.aboutContent.findUnique({ where: { id: "about" } }),
    db.contactContent.findUnique({ where: { id: "contact" } }),
    db.siteSettings.findUnique({ where: { id: "site" } }),
    db.homeContent.findUnique({ where: { id: "home" } }),
    db.experience.findFirst({ where: { company: { equals: "Washo", mode: "insensitive" } } }),
    db.aboutStat.findFirst({
      where: {
        OR: [{ value: "00+" }, { label: { contains: "Perfectionism" } }, { label: { contains: "Arguing With Pixels" } }],
      },
    }),
    db.service.findUnique({ where: { slug: "graphic-design" } }),
  ]);

  if (!about || !contact || !settings || !home || !graphicDesign) return true;
  if (about.pageTitle === "The Edrisa Situation") return true;
  if (about.introHeading.startsWith("I make things look good")) return true;
  if (contact.email === "hello@edrisa.studio" || settings.contactEmail === "hello@edrisa.studio") return true;
  if (contact.pageTitle === "Okay, Your Turn." || contact.pageTitle === "Talk") return true;
  if (wash || placeholderStat) return true;
  return false;
}
