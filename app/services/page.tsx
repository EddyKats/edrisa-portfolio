import type { Metadata } from "next";
import { InternalCTA } from "@/components/internal/InternalCTA";
import { InternalFooter } from "@/components/internal/InternalFooter";
import { InternalPageLayout } from "@/components/internal/InternalPageLayout";
import { InternalTitle } from "@/components/internal/InternalTitle";
import { CapabilityPackages } from "@/components/services/CapabilityPackages";
import { ClientStrip } from "@/components/services/ClientStrip";
import { ServiceOffers } from "@/components/services/ServiceOffers";
import { servicesCopy } from "@/data/services";
import { getPublicServices } from "@/lib/content/catalog";
import { getPublicCta } from "@/lib/content/cta";
import { getPublicSite } from "@/lib/content/site";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getPublicSite();
  return {
    title: { absolute: site.title },
    description: site.description,
    alternates: { canonical: "/services" },
  };
}

export default async function ServicesRoute() {
  const [catalog, cta] = await Promise.all([getPublicServices(), getPublicCta("services")]);

  return (
    <InternalPageLayout section="services">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <InternalTitle>{servicesCopy.title}</InternalTitle>
        <ServiceOffers offers={catalog.services} />
        <CapabilityPackages
          heading={servicesCopy.capabilitiesHeading}
          note={servicesCopy.capabilitiesNote}
          packages={catalog.packages}
        />
        <ClientStrip heading={servicesCopy.clientsHeading} note={servicesCopy.clientsNote} clients={catalog.clients} />
        <InternalCTA
          section="services"
          heading={cta?.heading ?? servicesCopy.ctaHeading}
          body={cta?.body ?? servicesCopy.ctaBody}
          label={cta?.buttonLabel ?? servicesCopy.ctaLabel}
          href={cta?.buttonHref ?? "/contact"}
        />
        <InternalFooter />
      </div>
    </InternalPageLayout>
  );
}
