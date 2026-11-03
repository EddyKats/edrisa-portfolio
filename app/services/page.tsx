import type { Metadata } from "next";
import { InternalCTA } from "@/components/internal/InternalCTA";
import { InternalFooter } from "@/components/internal/InternalFooter";
import { InternalPageLayout } from "@/components/internal/InternalPageLayout";
import { ProjectDetail } from "@/components/portfolio/ProjectDetail";
import { SelectedWork } from "@/components/portfolio/SelectedWork";
import { CapabilityPackages } from "@/components/services/CapabilityPackages";
import { ClientStrip } from "@/components/services/ClientStrip";
import { ServiceOffers } from "@/components/services/ServiceOffers";
import { aboutProfile } from "@/data/about";
import { serviceClientRows } from "@/data/clients";
import { publicPortfolioFilters } from "@/data/portfolio";
import { projectCta } from "@/data/project-cta";
import { capabilityPackages, serviceOffers, servicesCopy, servicesMeta } from "@/data/services";
import { getPublicServices } from "@/lib/content/catalog";
import { getPublicCta } from "@/lib/content/cta";
import { getPublishedProjects } from "@/lib/content/portfolio";
import { getPublicSite } from "@/lib/content/site";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: { absolute: servicesMeta.title },
    description: servicesMeta.description,
    alternates: { canonical: "/services" },
    openGraph: {
      title: servicesMeta.title,
      description: servicesMeta.description,
      url: "/services",
    },
  };
}

export default async function ServicesRoute({
  searchParams,
}: {
  searchParams: Promise<{ work?: string | string[] }>;
}) {
  const params = await searchParams;
  const workSlug = typeof params.work === "string" ? params.work : undefined;
  const [catalog, cta, projects, site] = await Promise.all([
    getPublicServices(),
    getPublicCta("services"),
    getPublishedProjects(),
    getPublicSite(),
  ]);
  const offers = catalog.services.length > 0 ? catalog.services : [...serviceOffers];
  const packages =
    catalog.packages.length > 0
        ? catalog.packages.map((entry) => ({
          id: entry.id,
          name: entry.name,
          description: entry.description,
          items: entry.items,
          buttonLabel: entry.buttonLabel || servicesCopy.talkLabel,
        }))
      : capabilityPackages.map((entry) => ({
          id: entry.name,
          name: entry.name,
          items: [...entry.items],
          buttonLabel: servicesCopy.talkLabel,
        }));
  const clients =
    catalog.clients.filter((client) => client.logoUrl).length > 0
      ? catalog.clients
          .filter((client) => client.logoUrl)
          .map((client) => ({ id: client.id, name: client.name, src: client.logoUrl as string }))
      : serviceClientRows.flat().map((client) => ({ id: client.id, name: client.name, src: client.src }));
  const workIndex = workSlug ? projects.findIndex((item) => item.slug === workSlug) : -1;
  const opened = workIndex >= 0 ? projects[workIndex] : null;
  const previous = opened ? projects[(workIndex - 1 + projects.length) % projects.length] ?? opened : null;
  const next = opened ? projects[(workIndex + 1) % projects.length] ?? opened : null;

  return (
    <>
    <InternalPageLayout section="services">
      <div className="internal-frame px-5 pt-14 pb-[max(1rem,env(safe-area-inset-bottom,0px))] sm:px-8 sm:pt-20">
        <header className="services-intro">
          <h1 className="about-name font-display tracking-tight">
            <span className="block">{servicesCopy.title}</span>
            <span className="block">{servicesCopy.titleLine}</span>
          </h1>
        </header>
        <ServiceOffers heading={servicesCopy.offersHeading} offers={offers} />
        <CapabilityPackages heading={servicesCopy.capabilitiesHeading} packages={packages} />
        <SelectedWork
          projects={projects}
          returnTo="/services"
          heading={aboutProfile.selectedHeading}
          note={aboutProfile.selectedNote}
          headingId="services-work-title"
          className="services-selected"
          cue
          uniform
        />
        <ClientStrip heading={servicesCopy.placesHeading} clients={clients} />
        <InternalCTA
          section="services"
          heading={cta?.heading ?? projectCta.heading}
          body={cta?.body ?? servicesCopy.ctaBody}
          label={cta?.buttonLabel ?? projectCta.label}
          href={cta?.buttonHref ?? "/contact"}
          frameClassName="services-close relative"
        />
        <InternalFooter />
      </div>
    </InternalPageLayout>
    {opened && previous && next ? (
      <ProjectDetail
        source="services"
        project={opened}
        previous={{ slug: previous.slug, title: previous.title }}
        next={{ slug: next.slug, title: next.title }}
        categories={[...publicPortfolioFilters]}
        contact={{
          profiles: site.socials,
          callHref: site.callHref,
        }}
        ctaHref={cta?.buttonHref ?? "/contact"}
      />
    ) : null}
    </>
  );
}
