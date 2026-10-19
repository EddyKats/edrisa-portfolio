import type { Metadata } from "next";
import { InternalCTA } from "@/components/internal/InternalCTA";
import { InternalFooter } from "@/components/internal/InternalFooter";
import { InternalPageLayout } from "@/components/internal/InternalPageLayout";
import { CapabilityPackages } from "@/components/services/CapabilityPackages";
import { ClientStrip } from "@/components/services/ClientStrip";
import { ServiceOffers } from "@/components/services/ServiceOffers";
import { aboutCopy } from "@/data/about";
import { projectCta } from "@/data/project-cta";
import { capabilityPackages, serviceOffers, servicesCopy, servicesMeta } from "@/data/services";
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
  const cta = await getPublicCta("services");

  return (
    <InternalPageLayout section="services">
      <div className="internal-frame px-5 py-14 sm:px-8 sm:py-20">
        <header className="services-intro">
          <h1 className="about-name font-display tracking-tight">
            <span className="block">{servicesCopy.title}</span>
            <span className="block">{servicesCopy.titleLine}</span>
          </h1>
        </header>
        <ServiceOffers heading={servicesCopy.offersHeading} offers={[...serviceOffers]} />
        <CapabilityPackages
          heading={servicesCopy.capabilitiesHeading}
          packages={capabilityPackages.map((entry) => ({
            id: entry.name,
            name: entry.name,
            items: [...entry.items],
            buttonLabel: servicesCopy.talkLabel,
          }))}
        />
        <ClientStrip heading={servicesCopy.placesHeading} />
        <InternalCTA
          section="services"
          heading={projectCta.heading}
          body={aboutCopy.ctaBody}
          label={projectCta.label}
          href={cta?.buttonHref ?? "/contact"}
        />
        <InternalFooter />
      </div>
    </InternalPageLayout>
  );
}
