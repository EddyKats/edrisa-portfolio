import type { Metadata } from "next";
import { InternalCTA } from "@/components/internal/InternalCTA";
import { InternalFooter } from "@/components/internal/InternalFooter";
import { InternalPageLayout } from "@/components/internal/InternalPageLayout";
import { CapabilityPackages } from "@/components/services/CapabilityPackages";
import { ClientStrip } from "@/components/services/ClientStrip";
import { ServiceOffers } from "@/components/services/ServiceOffers";
import { aboutCopy } from "@/data/about";
import { serviceClientRows } from "@/data/clients";
import { projectCta } from "@/data/project-cta";
import { capabilityPackages, serviceOffers, servicesCopy, servicesMeta } from "@/data/services";
import { getPublicServices } from "@/lib/content/catalog";
import { getPublicCta } from "@/lib/content/cta";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: { absolute: servicesMeta.title },
    description: servicesMeta.description,
    alternates: { canonical: "/services" },
  };
}

export default async function ServicesRoute() {
  const [catalog, cta] = await Promise.all([getPublicServices(), getPublicCta("services")]);
  const offers = catalog.services.length > 0 ? catalog.services : [...serviceOffers];
  const packages =
    catalog.packages.length > 0
      ? catalog.packages.map((entry) => ({
          id: entry.id,
          name: entry.name,
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

  return (
    <InternalPageLayout section="services">
      <div className="internal-frame px-5 py-14 sm:px-8 sm:py-20">
        <header className="services-intro">
          <h1 className="about-name font-display tracking-tight">
            <span className="block">{servicesCopy.title}</span>
            <span className="block">{servicesCopy.titleLine}</span>
          </h1>
        </header>
        <ServiceOffers heading={servicesCopy.offersHeading} offers={offers} />
        <CapabilityPackages heading={servicesCopy.capabilitiesHeading} packages={packages} />
        <ClientStrip heading={servicesCopy.placesHeading} clients={clients} />
        <InternalCTA
          section="services"
          heading={cta?.heading ?? projectCta.heading}
          body={cta?.body ?? aboutCopy.ctaBody}
          label={cta?.buttonLabel ?? projectCta.label}
          href={cta?.buttonHref ?? "/contact"}
        />
        <InternalFooter />
      </div>
    </InternalPageLayout>
  );
}
