import { aboutCopy, aboutFeature, aboutJourney, aboutMeta, aboutStats } from "../data/about";
import { contactCopy, contactDetails, contactMeta } from "../data/contact";
import { navigation } from "../data/navigation";
import { portfolioCategories, portfolioCopy, portfolioProjects } from "../data/portfolio";
import { capabilityPackages, serviceOffers, servicesCopy } from "../data/services";
import { site, socialLinks } from "../data/site";
import { softwareRegistry } from "../data/software";
import { getDb } from "../lib/prisma";
import { socialUrlSchema } from "../lib/studio/urls";
import { ProjectSize } from "../generated/prisma/enums";

const sizes = {
  standard: ProjectSize.STANDARD,
  large: ProjectSize.LARGE,
  wide: ProjectSize.WIDE,
  tall: ProjectSize.TALL,
} as const;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Add the Neon connection string to .env.local. Do not commit it.");
  }

  const socials = socialUrlSchema.parse({
    behanceUrl: socialLinks.behance,
    linkedinUrl: socialLinks.linkedin,
    whatsappUrl: socialLinks.whatsapp,
  });

  const db = getDb();
  const tile = (id: "about" | "services" | "contact" | "portfolio") =>
    navigation.find((item) => item.id === id)?.title ?? id;

  await db.siteSettings.upsert({
    where: { id: "site" },
    create: {
      id: "site",
      siteName: site.name,
      siteUrl: site.url,
      homepagePortraitUrl: site.portraitSrc,
      logoUrl: site.logoSrc,
      ...socials,
      contactEmail: contactDetails.email,
      contactPhone: contactDetails.phone,
      location: contactDetails.location,
      footerText: site.footerNote,
      footerSecondaryText: null,
      defaultSeoTitle: site.title,
      defaultSeoDescription: site.description,
    },
    update: {},
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
    update: {},
  });

  await db.aboutContent.upsert({
    where: { id: "about" },
    create: {
      id: "about",
      pageTitle: aboutCopy.title,
      introHeading: aboutCopy.introHeading,
      introParagraph: aboutCopy.intro,
      storyHeading: aboutCopy.storyHeading,
      storyBody: aboutCopy.story,
      featureMediaUrl: aboutFeature.src,
      featureMediaType: aboutFeature.src ? "image" : null,
      ctaHeading: aboutCopy.ctaHeading,
      ctaText: aboutCopy.ctaBody,
      ctaButtonLabel: aboutCopy.ctaLabel,
      ctaButtonHref: "/contact",
      seoTitle: aboutMeta.title,
      seoDescription: aboutMeta.description,
    },
    update: {},
  });

  if ((await db.aboutStat.count()) === 0) {
    await db.aboutStat.createMany({
      data: aboutStats.map((stat, index) => ({
        value: stat.value,
        label: stat.label,
        icon: stat.icon,
        sortOrder: index,
        published: true,
      })),
    });
  }

  if ((await db.experience.count()) === 0) {
    await db.experience.createMany({
      data: aboutJourney.map((entry, index) => ({
        company: entry.company,
        role: entry.role,
        microcopy: entry.note,
        imageUrl: entry.markSrc,
        startDate: null,
        endDate: null,
        sortOrder: index,
        published: true,
      })),
    });
  }

  for (const [index, offer] of serviceOffers.entries()) {
    await db.service.upsert({
      where: { slug: slugify(offer.title) },
      create: {
        title: offer.title,
        slug: slugify(offer.title),
        description: offer.summary,
        icon: offer.icon,
        sortOrder: index,
        published: true,
      },
      update: {},
    });
  }

  if ((await db.capabilityPackage.count()) === 0) {
    for (const [index, entry] of capabilityPackages.entries()) {
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
  }

  const categories = portfolioCategories.filter((category) => category !== "All");
  for (const [index, name] of categories.entries()) {
    await db.portfolioCategory.upsert({
      where: { slug: slugify(name) },
      create: {
        name,
        slug: slugify(name),
        sortOrder: index,
        published: true,
      },
      update: {},
    });
  }

  for (const [index, project] of portfolioProjects.entries()) {
    const category = await db.portfolioCategory.findUnique({ where: { slug: slugify(project.category) } });
    if (!category) throw new Error(`Missing category for ${project.slug}`);

    await db.project.upsert({
      where: { slug: project.slug },
      create: {
        slug: project.slug,
        title: project.title,
        categoryId: category.id,
        client: project.client,
        year: project.year,
        role: project.role,
        shortDescription: project.shortDescription,
        fullDescription: project.fullDescription,
        coverImageUrl: project.coverImage,
        heroImageUrl: project.heroImage,
        size: sizes[project.size],
        sortOrder: index,
        featured: false,
        published: true,
        seoTitle: null,
        seoDescription: null,
      },
      update: {},
    });
  }

  const catalogue = Object.entries(softwareRegistry);
  for (const [index, [key, tool]] of catalogue.entries()) {
    await db.software.upsert({
      where: { key },
      create: {
        key,
        name: tool.label,
        iconKey: key,
        sortOrder: index,
        published: true,
      },
      update: {},
    });
  }

  await db.contactContent.upsert({
    where: { id: "contact" },
    create: {
      id: "contact",
      pageTitle: contactCopy.title,
      subtitle: contactCopy.subheading,
      location: contactDetails.location,
      email: contactDetails.email,
      phone: contactDetails.phone,
      formHeading: contactCopy.formHeading,
      socialHeading: contactCopy.socialHeading,
      seoTitle: contactMeta.title,
      seoDescription: contactMeta.description,
    },
    update: {},
  });

  const calls = [
    {
      key: "about",
      heading: aboutCopy.ctaHeading,
      body: aboutCopy.ctaBody,
      buttonLabel: aboutCopy.ctaLabel,
      buttonHref: "/contact",
    },
    {
      key: "services",
      heading: servicesCopy.ctaHeading,
      body: servicesCopy.ctaBody,
      buttonLabel: servicesCopy.ctaLabel,
      buttonHref: "/contact",
    },
    {
      key: "portfolio",
      heading: portfolioCopy.ctaHeading,
      body: portfolioCopy.ctaBody,
      buttonLabel: portfolioCopy.ctaLabel,
      buttonHref: "/contact",
    },
  ] as const;

  for (const call of calls) {
    await db.cTA.upsert({
      where: { key: call.key },
      create: call,
      update: {},
    });
  }

  await db.$disconnect();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

main().catch(async (error: unknown) => {
  const message = error instanceof Error ? error.message : "Seed failed.";
  console.error(message);
  process.exitCode = 1;
});
