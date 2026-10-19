import type { Metadata } from "next";
import { ContactDetails } from "@/components/contact/ContactDetails";
import { ContactForm } from "@/components/contact/ContactForm";
import { InternalFooter } from "@/components/internal/InternalFooter";
import { InternalPageLayout } from "@/components/internal/InternalPageLayout";
import { contactCopy, contactDetails, contactMeta, splitContactTitle } from "@/data/contact";
import { getPublicContact } from "@/lib/content/contact";
import { toTelHref } from "@/lib/content/phone";
import { getPublicSite } from "@/lib/content/site";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const contact = await getPublicContact();
  return {
    title: { absolute: contact?.seoTitle || contactMeta.title },
    description: contact?.seoDescription || contactMeta.description,
    alternates: { canonical: "/contact" },
  };
}

export default async function ContactRoute() {
  const [site, contact] = await Promise.all([getPublicSite(), getPublicContact()]);
  const heading = splitContactTitle(contact?.pageTitle || `${contactCopy.title} ${contactCopy.titleLine}`);
  const email = contact?.email || contactDetails.email;
  const callHref = (contact?.phone ? toTelHref(contact.phone) : null) ?? site.callHref;

  return (
    <InternalPageLayout section="contact">
      <div className="internal-frame px-5 pt-14 pb-[max(1rem,env(safe-area-inset-bottom,0px))] sm:px-8 sm:pt-20">
        <header className="contact-intro">
          <h1 className="about-name font-display tracking-tight">
            <span className="block">{heading.title}</span>
            <span className="block">{heading.titleLine}</span>
          </h1>
          <p className="about-title max-w-[24rem] text-[clamp(1.05rem,1.4vw,1.28rem)] leading-snug font-medium text-ink/82">
            {contact?.subtitle || contactCopy.arrived}
          </p>
          <p className="about-lead mt-6">{contactCopy.subheading}</p>
        </header>
        <div className="contact-layout">
          <ContactDetails
            detailsHeading={contactCopy.detailsHeading}
            socialHeading={contact?.socialHeading || contactCopy.socialHeading}
            email={email}
            callHref={callHref}
            socials={site.socials}
          />
          <ContactForm heading={contact?.formHeading || contactCopy.formHeading} inbox={email} />
        </div>
        <InternalFooter />
      </div>
    </InternalPageLayout>
  );
}
