import type { Metadata } from "next";
import { ContactDetails } from "@/components/contact/ContactDetails";
import { ContactForm } from "@/components/contact/ContactForm";
import { LocationCard } from "@/components/contact/LocationCard";
import { InternalFooter } from "@/components/internal/InternalFooter";
import { InternalPageLayout } from "@/components/internal/InternalPageLayout";
import { InternalTitle } from "@/components/internal/InternalTitle";
import { contactCopy } from "@/data/contact";
import { getPublicContact } from "@/lib/content/contact";
import { getPublicSite } from "@/lib/content/site";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [contact, site] = await Promise.all([getPublicContact(), getPublicSite()]);
  return {
    title: { absolute: contact?.seoTitle || site.title },
    description: contact?.seoDescription || site.description,
    alternates: { canonical: "/contact" },
  };
}

export default async function ContactRoute() {
  const [contact, site] = await Promise.all([getPublicContact(), getPublicSite()]);

  return (
    <InternalPageLayout section="contact">
      <div className="mx-auto w-full max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
        <InternalTitle>{contact?.pageTitle ?? contactCopy.title}</InternalTitle>
        <p className="mx-auto mt-4 max-w-md text-center text-[1.05rem] leading-relaxed text-ink/70">
          {contact?.subtitle ?? contactCopy.subheading}
        </p>
        <div className="mt-16 grid items-start gap-14 split:grid-cols-2 split:gap-16">
          <ContactDetails
            detailsHeading={contactCopy.detailsHeading}
            socialHeading={contact?.socialHeading ?? contactCopy.socialHeading}
            email={contact?.email ?? null}
            phone={contact?.phone ?? null}
            location={contact?.location ?? null}
            socials={site.socials}
          />
          <ContactForm heading={contact?.formHeading ?? contactCopy.formHeading} />
        </div>
        <LocationCard location={contact?.location || "Not listed yet"} />
        <InternalFooter />
      </div>
    </InternalPageLayout>
  );
}
