import { aboutProfile } from "@/data/about";
import { knownProfiles, personIdentity, studioBrand } from "@/data/identity";
import type { PublicSite } from "@/lib/content/site-shape";

export function personId(siteUrl: string) {
  return `${siteUrl}/#person`;
}

export function studioId(siteUrl: string) {
  return `${siteUrl}/#studio`;
}

export function websiteId(siteUrl: string) {
  return `${siteUrl}/#website`;
}

function siteOrigin(siteUrl: string) {
  return siteUrl.replace(/\/$/, "");
}

export function sameAsFrom(site: PublicSite) {
  const extra = process.env.WIKIDATA_ENTITY_URL?.trim();
  const links = site.socials
    .filter((item) => item.id === "linkedin" || item.id === "behance")
    .map((item) => item.href);
  const known = [knownProfiles.linkedin, knownProfiles.behance];
  const unique = [...new Set([...links, ...known, ...(extra ? [extra] : [])])];
  return unique.filter(Boolean);
}

export function personNode(site: PublicSite, image?: string | null) {
  const url = siteOrigin(site.url);
  return {
    "@type": "Person",
    "@id": personId(url),
    name: personIdentity.name,
    alternateName: [...personIdentity.alternateName],
    url,
    image: image || undefined,
    jobTitle: personIdentity.jobTitle,
    description: personIdentity.description,
    sameAs: sameAsFrom(site),
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: aboutProfile.education.school,
    },
    worksFor: { "@id": `${url}/#edutech` },
  };
}

export function workNodes(siteUrl: string) {
  const url = siteOrigin(siteUrl);
  const person = { "@id": personId(url) };
  return [
    {
      "@type": "Organization",
      "@id": `${url}/#edutech`,
      name: "Edutech Media Group",
      employee: person,
    },
    {
      "@type": "Organization",
      "@id": `${url}/#giniyas`,
      name: "Giniyas Media Services",
      founder: person,
    },
    {
      "@type": "Organization",
      "@id": `${url}/#gline`,
      name: "Gline",
      founder: person,
    },
  ];
}

export function studioNode(site: PublicSite) {
  const url = site.url.replace(/\/$/, "");
  return {
    "@type": "ProfessionalService",
    "@id": studioId(url),
    name: studioBrand.name,
    url,
    image: absoluteAsset(url, site.logoSrc),
    founder: { "@id": personId(url) },
    employee: { "@id": personId(url) },
    sameAs: sameAsFrom(site),
    knowsAbout: [...aboutProfile.coreSkills],
  };
}

export function websiteNode(site: PublicSite) {
  const url = site.url.replace(/\/$/, "");
  return {
    "@type": "WebSite",
    "@id": websiteId(url),
    url,
    name: studioBrand.name,
    alternateName: personIdentity.name,
    description: site.description,
    publisher: { "@id": studioId(url) },
    inLanguage: "en",
  };
}

export function siteGraph(site: PublicSite, image?: string | null) {
  return {
    "@context": "https://schema.org" as const,
    "@graph": [personNode(site, image), studioNode(site), websiteNode(site), ...workNodes(site.url)],
  };
}

export function withGraph(site: PublicSite, extra: Record<string, unknown>[], image?: string | null) {
  const graph = siteGraph(site, image);
  const extraIds = new Set(extra.flatMap((node) => (typeof node["@id"] === "string" ? [node["@id"]] : [])));
  return {
    ...graph,
    "@graph": [...extra, ...graph["@graph"].filter((node) => !extraIds.has(node["@id"]))],
  };
}

export function projectSeoTitle(title: string, category?: string | null) {
  const craft = category?.trim();
  return craft ? `${title} · ${craft} by ${personIdentity.name}` : `${title} by ${personIdentity.name}`;
}

export function publicStoredTitle(stored: string | null | undefined, fallback: string) {
  if (!stored?.trim() || stored.includes("| Edrisa")) return fallback;
  return stored;
}

export function projectWorkNode(
  site: PublicSite,
  project: {
    slug: string;
    title: string;
    category?: string | null;
    shortDescription?: string | null;
    fullDescription?: string | null;
    coverImage?: string | null;
    heroImage?: string | null;
  },
) {
  const url = siteOrigin(site.url);
  const page = `${url}/portfolio/${project.slug}`;
  const imageSrc = project.coverImage || project.heroImage;
  return {
    "@type": "CreativeWork",
    "@id": `${page}#work`,
    url: page,
    name: project.title,
    description:
      project.fullDescription ||
      project.shortDescription ||
      `${project.title} by ${personIdentity.name} of ${studioBrand.name}.`,
    creator: { "@id": personId(url) },
    author: { "@id": personId(url) },
    publisher: { "@id": studioId(url) },
    ...(project.category ? { about: project.category } : {}),
    ...(imageSrc ? { image: absoluteAsset(url, imageSrc) } : {}),
  };
}

export function absoluteAsset(siteUrl: string, src: string) {
  if (src.startsWith("https://") || src.startsWith("http://")) return src;
  return new URL(src, siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`).href;
}
