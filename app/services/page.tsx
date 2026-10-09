import type { Metadata } from "next";
import { InternalCTA } from "@/components/internal/InternalCTA";
import { InternalFooter } from "@/components/internal/InternalFooter";
import { InternalPageLayout } from "@/components/internal/InternalPageLayout";
import { InternalTitle } from "@/components/internal/InternalTitle";
import { CapabilityPackages } from "@/components/services/CapabilityPackages";
import { ClientStrip } from "@/components/services/ClientStrip";
import { ServiceOffers } from "@/components/services/ServiceOffers";
import { servicesCopy, servicesMeta } from "@/data/services";

export const metadata: Metadata = {
  title: { absolute: servicesMeta.title },
  description: servicesMeta.description,
  alternates: {
    canonical: "/services",
  },
};

export default function ServicesRoute() {
  return (
    <InternalPageLayout section="services">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <InternalTitle>{servicesCopy.title}</InternalTitle>
        <ServiceOffers />
        <CapabilityPackages />
        <ClientStrip />
        <InternalCTA
          section="services"
          heading={servicesCopy.ctaHeading}
          body={servicesCopy.ctaBody}
          label={servicesCopy.ctaLabel}
          href="/contact"
        />
        <InternalFooter />
      </div>
    </InternalPageLayout>
  );
}
